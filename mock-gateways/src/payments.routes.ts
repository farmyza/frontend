import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db.js';
import { amount as validateAmount, httpUrl, InputError, text } from './validation.js';

export const paymentsRouter = Router();

const optionalText = (value: unknown, field: string, max: number) => {
  if (value !== undefined && value !== null) text(value, field, max);
};
const optionalUrl = (value: unknown, field: string) => {
  if (value !== undefined && value !== null && value !== '') httpUrl(value, field);
};
const currencyCode = (value: unknown) => {
  const code = text(value, 'currency', 3, true);
  if (!/^[A-Za-z]{3}$/.test(code)) throw new InputError('currency must be a 3-letter code');
  return code;
};

const getFrontendBase = (req?: Request) => {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;
  const origin = req?.headers?.origin as string;
  if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
    return origin;
  }
  const fwdOrigin = req?.headers?.['x-forwarded-origin'] as string;
  if (fwdOrigin) return fwdOrigin;
  const forwarded = (req?.headers?.['x-client-host'] || req?.headers?.['x-forwarded-host']) as string;
  if (forwarded) {
    const hostOnly = forwarded.split(':')[0];
    return `http://${hostOnly}:5454`;
  }
  if ((req?.body as any)?.clientHost) {
    return `http://${(req?.body as any).clientHost}:5454`;
  }
  const host = req?.headers?.host?.split(':')[0];
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return `http://${host}:5454`;
  }
  return 'http://localhost:5454';
};

const getGatewayBase = (req?: Request, defaultPort = 5051) => {
  if (process.env.PAYMENTS_GATEWAY_URL) return process.env.PAYMENTS_GATEWAY_URL;
  const forwarded = (req?.headers?.['x-client-host'] || req?.headers?.['x-forwarded-host']) as string;
  if (forwarded) {
    const hostOnly = forwarded.split(':')[0];
    return `http://${hostOnly}:${defaultPort}`;
  }
  if ((req?.body as any)?.clientHost) {
    return `http://${(req?.body as any).clientHost}:${defaultPort}`;
  }
  const host = req?.headers?.host;
  if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return `http://${host}`;
  }
  return `http://localhost:${defaultPort}`;
};

const getBackendBase = (req?: Request) => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  if (process.env.BACKEND_HOST) return `http://${process.env.BACKEND_HOST}:5000`;
  return 'http://localhost:5000';
};

// ==========================================
// 1. bKash Tokenized Checkout v1.2.0-beta
// ==========================================

// 1.1 Grant Token
paymentsRouter.post('/tokenized/checkout/token/grant', (req: Request, res: Response) => {
  const token = `bkash_token_${crypto.randomBytes(16).toString('hex')}`;
  res.json({
    statusCode: '0000',
    statusMessage: 'Successful',
    id_token: token,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: `bkash_refresh_${crypto.randomBytes(16).toString('hex')}`,
  });
});

// 1.2 Create Payment
paymentsRouter.post(['/tokenized/checkout/create', '/bkash/checkout/create'], (req: Request, res: Response) => {
  const { amount, currency, orderExternal, callbackURL, successUrl, cancelUrl, merchantInvoiceNumber, payerReference } = req.body;
  const parsedAmount = req.body.amount === undefined ? 0 : validateAmount(req.body.amount);
  if (currency !== undefined) currencyCode(currency);
  optionalText(orderExternal, 'orderExternal', 128);
  optionalText(merchantInvoiceNumber, 'merchantInvoiceNumber', 128);
  optionalText(payerReference, 'payerReference', 64);
  optionalUrl(callbackURL, 'callbackURL');
  optionalUrl(successUrl, 'successUrl');
  optionalUrl(cancelUrl, 'cancelUrl');
  const paymentID = `TR0011${Date.now()}${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const frontendBase = getFrontendBase(req);
  const gatewayBase = getGatewayBase(req, 5051);
  const effectiveSuccess = callbackURL || successUrl || `${frontendBase}/tickets`;
  const effectiveCancel = cancelUrl || `${frontendBase}/`;

  const insertStmt = db.prepare(`
    INSERT INTO bkash_payments (payment_id, order_external, amount, currency, status, success_url, cancel_url, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
  `);
  insertStmt.run(
    paymentID,
    merchantInvoiceNumber || orderExternal || null,
    parsedAmount,
    currency || 'BDT',
    effectiveSuccess,
    effectiveCancel,
    Date.now()
  );

  res.json({
    statusCode: '0000',
    statusMessage: 'Successful',
    paymentID,
    bkashURL: `${gatewayBase}/bkash/gateway?paymentID=${paymentID}`,
    callbackURL: effectiveSuccess,
    amount: String(amount),
    currency: currency || 'BDT',
    intent: 'sale',
    paymentCreateTime: new Date().toISOString(),
    transactionStatus: 'Initiated',
    merchantInvoiceNumber: merchantInvoiceNumber || orderExternal || paymentID,
    payerReference: payerReference || '01712345678',
  });
});

// 1.3 Execute Payment
paymentsRouter.post(['/tokenized/checkout/execute', '/bkash/checkout/execute'], (req: Request, res: Response) => {
  const { paymentID } = req.body;
  if (!paymentID) {
    res.status(400).json({ statusCode: '2023', statusMessage: 'Missing paymentID' });
    return;
  }
  text(paymentID, 'paymentID', 64, true);

  const stmt = db.prepare('SELECT * FROM bkash_payments WHERE payment_id = ?');
  const payment = stmt.get(String(paymentID)) as any;

  if (!payment) {
    res.status(404).json({
      statusCode: '2023',
      statusMessage: 'Payment does not exist',
    });
    return;
  }

  const trxID = payment.trx_id || `BKH${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  db.prepare("UPDATE bkash_payments SET status = 'Completed', trx_id = ? WHERE payment_id = ?").run(trxID, String(paymentID));

  fetch(`${getBackendBase(req)}/api/v1/payments/callback/bkash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider_transaction_id: paymentID,
      trxID,
      status: 'succeeded',
    }),
  }).catch((err) => console.warn('[Mock bKash Execute] Callback err:', err));

  res.json({
    statusCode: '0000',
    statusMessage: 'Successful',
    paymentID,
    trxID,
    transactionStatus: 'Completed',
    amount: String(payment.amount),
    currency: payment.currency || 'BDT',
    intent: 'sale',
    paymentExecuteTime: new Date().toISOString(),
    merchantInvoiceNumber: payment.order_external,
    payerReference: '01712345678',
    customerMsisdn: '01712345678',
  });
});

// 1.4 Query Payment Status
paymentsRouter.post(['/tokenized/checkout/payment/status', '/bkash/checkout/payment/status'], (req: Request, res: Response) => {
  const { paymentID } = req.body;
  if (!paymentID) {
    res.status(400).json({ statusCode: '2023', statusMessage: 'Missing paymentID' });
    return;
  }
  text(paymentID, 'paymentID', 64, true);

  const stmt = db.prepare('SELECT * FROM bkash_payments WHERE payment_id = ?');
  const payment = stmt.get(String(paymentID)) as any;

  if (!payment) {
    res.status(404).json({ statusCode: '2023', statusMessage: 'Payment does not exist' });
    return;
  }

  res.json({
    statusCode: '0000',
    statusMessage: 'Successful',
    paymentID,
    trxID: payment.trx_id || 'BKH_PENDING',
    transactionStatus: payment.status === 'Completed' ? 'Completed' : 'Initiated',
    amount: String(payment.amount),
    currency: payment.currency,
  });
});

// 1.5 Interactive bKash Gateway UI
paymentsRouter.get('/bkash/gateway', (req: Request, res: Response) => {
  const { paymentID } = req.query;
  if (!paymentID) {
    res.status(400).send('Missing paymentID query parameter');
    return;
  }
  text(paymentID, 'paymentID', 64, true);

  const stmt = db.prepare('SELECT * FROM bkash_payments WHERE payment_id = ?');
  const payment = stmt.get(String(paymentID)) as any;

  if (!payment) {
    res.status(404).send('bKash Payment session not found');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>bKash Payment Gateway - Merchant Sandbox</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #e2136e; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 16px; }
    .gateway-card { background: #ffffff; border-radius: 16px; width: 100%; max-width: 420px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
    .header { background: #e2136e; color: #fff; padding: 24px 20px; text-align: center; }
    .logo-text { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .sub-badge { font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 12px; display: inline-block; margin-top: 6px; }
    .body-content { padding: 24px; }
    .amount-box { background: #fdf2f7; border: 1px dashed #e2136e; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px; }
    .amount-label { font-size: 13px; color: #666; }
    .amount-val { font-size: 32px; font-weight: 800; color: #e2136e; margin-top: 4px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #333; margin-bottom: 6px; }
    .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; }
    .form-group input:focus { border-color: #e2136e; }
    .btn-pay { width: 100%; background: #e2136e; color: #fff; border: none; padding: 14px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity 0.15s; margin-bottom: 10px; }
    .btn-pay:hover { opacity: 0.9; }
    .btn-fail { width: 100%; background: #ffebee; color: #c62828; border: 1px solid #ffcdd2; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 10px; }
    .btn-cancel { width: 100%; background: transparent; color: #777; border: none; padding: 8px; font-size: 13px; cursor: pointer; }
    .footer { font-size: 11px; color: #888; text-align: center; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="gateway-card">
    <div class="header">
      <div class="logo-text">bKash</div>
      <div class="sub-badge">Sandbox Merchant Payment Emulator (v1.2.0)</div>
    </div>
    <div class="body-content">
      <div class="amount-box">
        <div class="amount-label">Payment ID: ${payment.payment_id}</div>
        <div class="amount-val">৳ ${payment.amount} <span style="font-size:16px;">${payment.currency}</span></div>
      </div>

      <form method="POST" action="/bkash/gateway/action">
        <input type="hidden" name="paymentID" value="${payment.payment_id}">

        <div class="form-group">
          <label>Your bKash Account Number</label>
          <input type="text" value="01712345678" readonly />
        </div>
        <div class="form-group">
          <label>Verification OTP (Demo: 123456)</label>
          <input type="text" value="123456" />
        </div>
        <div class="form-group">
          <label>bKash PIN (Demo: any 5 digits)</label>
          <input type="password" value="12121" />
        </div>

        <button type="submit" name="action" value="pay" class="btn-pay">
          ✅ Confirm & Pay ৳ ${payment.amount}
        </button>
        <button type="submit" name="action" value="fail" class="btn-fail">
          ❌ Simulate Payment Failure
        </button>
        <button type="submit" name="action" value="cancel" class="btn-cancel">
          Cancel Transaction
        </button>
      </form>

      <div class="footer">
        Zyrun bKash Tokenized Gateway Simulator
      </div>
    </div>
  </div>
</body>
</html>
  `;
  res.send(html);
});

// 1.6 bKash Action
paymentsRouter.post('/bkash/gateway/action', async (req: Request, res: Response) => {
  const { paymentID, action } = req.body;
  if (!paymentID) {
    res.status(400).send('Missing paymentID');
    return;
  }
  text(paymentID, 'paymentID', 64, true);
  if (!['pay', 'fail', 'cancel'].includes(action)) throw new InputError('action is invalid');

  const stmt = db.prepare('SELECT * FROM bkash_payments WHERE payment_id = ?');
  const payment = stmt.get(String(paymentID)) as any;

  if (!payment) {
    res.status(404).send('Payment not found');
    return;
  }

  if (action === 'pay') {
    const trxID = `BKH${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    db.prepare("UPDATE bkash_payments SET status = 'Completed', trx_id = ? WHERE payment_id = ?").run(trxID, String(paymentID));

    try {
      await fetch(`${getBackendBase(req)}/api/v1/payments/callback/bkash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_transaction_id: paymentID,
          trxID,
          status: 'succeeded',
        }),
      });
    } catch (err) {
      console.warn('[Mock bKash] Could not post callback to backend:', err);
    }

    const frontendBase = getFrontendBase(req);
    const target = payment.success_url || `${frontendBase}/tickets`;
    res.redirect(target);
  } else if (action === 'fail') {
    db.prepare("UPDATE bkash_payments SET status = 'Failed' WHERE payment_id = ?").run(String(paymentID));
    try {
      await fetch(`${getBackendBase()}/api/v1/payments/callback/bkash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_transaction_id: paymentID,
          status: 'failed',
        }),
      });
    } catch (err) {
      console.warn('[Mock bKash] Could not post fail callback:', err);
    }
    const frontendBase = getFrontendBase(req);
    const target = payment.cancel_url || `${frontendBase}/`;
    res.redirect(target);
  } else {
    const frontendBase = getFrontendBase(req);
    const target = payment.cancel_url || `${frontendBase}/`;
    res.redirect(target);
  }
});

// ==========================================
// 2. Nagad Online Payment Gateway
// ==========================================

// 2.1 Initialize Checkout
paymentsRouter.post(['/check-out/initialize/:merchantId/:orderId', '/nagad/checkout/initialize'], (req: Request, res: Response) => {
  const merchantId = req.params.merchantId || req.body.merchantId || 'NAGAD_MERC_01';
  const orderId = req.params.orderId || req.body.orderId || `ORD_${Date.now()}`;
  const amount = req.body.amount || req.body.total_amount || 0;
  text(merchantId, 'merchantId', 64, true);
  text(orderId, 'orderId', 128, true);
  const parsedAmount = amount === 0 ? 0 : validateAmount(amount);
  optionalUrl(req.body.callbackUrl, 'callbackUrl');
  optionalUrl(req.body.callback_url, 'callback_url');
  const paymentRefId = `NAGAD_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const challenge = crypto.randomBytes(16).toString('hex');
  const frontendBase = getFrontendBase(req);
  const gatewayBase = getGatewayBase(req, 5051);
  const callbackUrl = req.body.callbackUrl || req.body.callback_url || `${frontendBase}/tickets`;

  const insertStmt = db.prepare(`
    INSERT INTO nagad_payments (payment_ref_id, order_id, amount, currency, status, callback_url, challenge, created_at)
    VALUES (?, ?, ?, 'BDT', 'pending', ?, ?, ?)
  `);
  insertStmt.run(paymentRefId, String(orderId), parsedAmount, callbackUrl, challenge, Date.now());

  res.json({
    status: 'SUCCESS',
    statusCode: '00_000_000',
    sensitiveData: {
      paymentRefId,
      challenge,
    },
    callBackUrl: `${gatewayBase}/nagad/gateway?paymentRefId=${paymentRefId}`,
    message: 'Nagad Checkout Initialized Successfully',
  });
});

// 2.2 Complete Checkout (Redirect URL)
paymentsRouter.post(['/check-out/complete/:paymentRefId', '/nagad/checkout/complete'], (req: Request, res: Response) => {
  const paymentRefId = req.params.paymentRefId || req.body.paymentRefId;
  text(paymentRefId, 'paymentRefId', 128, true);
  const gatewayBase = getGatewayBase(req, 5051);
  res.json({
    status: 'SUCCESS',
    statusCode: '00_000_000',
    callBackUrl: `${gatewayBase}/nagad/gateway?paymentRefId=${paymentRefId}`,
    message: 'Checkout Complete URL ready',
  });
});

// 2.3 Verify Payment
paymentsRouter.get(['/verify/payment/:paymentRefId', '/nagad/verify/:paymentRefId'], (req: Request, res: Response) => {
  const { paymentRefId } = req.params;
  if (!paymentRefId) {
    res.status(400).json({ status: 'FAILED', statusCode: '00_000_004', message: 'Missing paymentRefId' });
    return;
  }
  text(paymentRefId, 'paymentRefId', 128, true);

  const stmt = db.prepare('SELECT * FROM nagad_payments WHERE payment_ref_id = ?');
  const payment = stmt.get(String(paymentRefId)) as any;

  if (!payment) {
    res.status(404).json({ status: 'FAILED', statusCode: '00_000_004', message: 'Payment Ref not found' });
    return;
  }

  res.json({
    merchantId: 'NAGAD_MERC_01',
    orderId: payment.order_id,
    paymentRefId: payment.payment_ref_id,
    amount: String(payment.amount),
    clientMobileNo: '01712345678',
    merchantMobileNo: '01812345678',
    orderDateTime: new Date(payment.created_at).toISOString(),
    issuerPaymentDateTime: new Date().toISOString(),
    issuerPaymentRefNo: payment.trx_id || 'NGD_PENDING',
    status: payment.status === 'Completed' ? 'Success' : payment.status,
    statusCode: payment.status === 'Completed' ? '00_000_000' : '00_000_001',
  });
});

// 2.4 Interactive Nagad Gateway UI
paymentsRouter.get('/nagad/gateway', (req: Request, res: Response) => {
  const { paymentRefId } = req.query;
  if (!paymentRefId) {
    res.status(400).send('Missing paymentRefId query parameter');
    return;
  }
  text(paymentRefId, 'paymentRefId', 128, true);

  const stmt = db.prepare('SELECT * FROM nagad_payments WHERE payment_ref_id = ?');
  const payment = stmt.get(String(paymentRefId)) as any;

  if (!payment) {
    res.status(404).send('Nagad Payment session not found');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nagad Payment Gateway - Merchant Simulator</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: linear-gradient(135deg, #f7941d 0%, #e41e26 100%); display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 16px; }
    .gateway-card { background: #ffffff; border-radius: 16px; width: 100%; max-width: 420px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.25); }
    .header { background: #f7941d; color: #fff; padding: 24px 20px; text-align: center; }
    .logo-text { font-size: 30px; font-weight: 900; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .sub-badge { font-size: 12px; background: rgba(255,255,255,0.25); padding: 4px 10px; border-radius: 12px; display: inline-block; margin-top: 6px; }
    .body-content { padding: 24px; }
    .amount-box { background: #fff8f0; border: 1px dashed #f7941d; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 20px; }
    .amount-label { font-size: 13px; color: #777; }
    .amount-val { font-size: 32px; font-weight: 800; color: #e41e26; margin-top: 4px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 12px; font-weight: 600; color: #333; margin-bottom: 6px; }
    .form-group input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; outline: none; }
    .form-group input:focus { border-color: #f7941d; }
    .btn-pay { width: 100%; background: linear-gradient(135deg, #f7941d 0%, #e41e26 100%); color: #fff; border: none; padding: 14px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity 0.15s; margin-bottom: 10px; }
    .btn-pay:hover { opacity: 0.92; }
    .btn-fail { width: 100%; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 10px; }
    .btn-cancel { width: 100%; background: transparent; color: #777; border: none; padding: 8px; font-size: 13px; cursor: pointer; }
    .footer { font-size: 11px; color: #888; text-align: center; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="gateway-card">
    <div class="header">
      <div class="logo-text">নগদ (Nagad)</div>
      <div class="sub-badge">Online Merchant Gateway Simulator</div>
    </div>
    <div class="body-content">
      <div class="amount-box">
        <div class="amount-label">Payment Ref: ${payment.payment_ref_id}</div>
        <div class="amount-val">৳ ${payment.amount} <span style="font-size:16px;">${payment.currency}</span></div>
      </div>

      <form method="POST" action="/nagad/gateway/action">
        <input type="hidden" name="paymentRefId" value="${payment.payment_ref_id}">

        <div class="form-group">
          <label>Your Nagad Account Number</label>
          <input type="text" value="01712345678" readonly />
        </div>
        <div class="form-group">
          <label>Verification OTP (Demo: 1234)</label>
          <input type="text" value="1234" />
        </div>
        <div class="form-group">
          <label>Nagad PIN (Demo: 4 digits)</label>
          <input type="password" value="1234" />
        </div>

        <button type="submit" name="action" value="pay" class="btn-pay">
          ✅ Proceed & Pay ৳ ${payment.amount}
        </button>
        <button type="submit" name="action" value="fail" class="btn-fail">
          ❌ Simulate Payment Failure
        </button>
        <button type="submit" name="action" value="cancel" class="btn-cancel">
          Cancel & Return
        </button>
      </form>

      <div class="footer">
        Zyrun Official Nagad Gateway Integration Simulator
      </div>
    </div>
  </div>
</body>
</html>
  `;
  res.send(html);
});

// 2.5 Nagad Action
paymentsRouter.post('/nagad/gateway/action', async (req: Request, res: Response) => {
  const { paymentRefId, action } = req.body;
  if (!paymentRefId) {
    res.status(400).send('Missing paymentRefId');
    return;
  }
  text(paymentRefId, 'paymentRefId', 128, true);
  if (!['pay', 'fail', 'cancel'].includes(action)) throw new InputError('action is invalid');

  const stmt = db.prepare('SELECT * FROM nagad_payments WHERE payment_ref_id = ?');
  const payment = stmt.get(String(paymentRefId)) as any;

  if (!payment) {
    res.status(404).send('Payment Ref not found');
    return;
  }

  if (action === 'pay') {
    const trxID = `NGD${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    db.prepare("UPDATE nagad_payments SET status = 'Completed', trx_id = ? WHERE payment_ref_id = ?").run(trxID, String(paymentRefId));

    try {
      await fetch(`${getBackendBase(req)}/api/v1/payments/callback/nagad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_transaction_id: paymentRefId,
          trxID,
          status: 'succeeded',
        }),
      });
    } catch (err) {
      console.warn('[Mock Nagad] Could not post callback to backend:', err);
    }

    const frontendBase = getFrontendBase(req);
    const target = payment.callback_url || `${frontendBase}/tickets`;
    res.redirect(target);
  } else if (action === 'fail') {
    db.prepare("UPDATE nagad_payments SET status = 'Failed' WHERE payment_ref_id = ?").run(String(paymentRefId));
    try {
      await fetch(`${getBackendBase()}/api/v1/payments/callback/nagad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_transaction_id: paymentRefId,
          status: 'failed',
        }),
      });
    } catch (err) {
      console.warn('[Mock Nagad] Could not post fail callback:', err);
    }
    const frontendBase = getFrontendBase(req);
    res.redirect(`${frontendBase}/`);
  } else {
    const frontendBase = getFrontendBase(req);
    res.redirect(`${frontendBase}/`);
  }
});

// ==========================================
// 3. SSLCommerz Mock Gateway
// ==========================================

paymentsRouter.post('/sslcommerz/gwprocess/v4/api.php', (req: Request, res: Response) => {
  const { total_amount, currency, tran_id, success_url, fail_url, cancel_url } = req.body;
  const parsedAmount = total_amount === undefined ? 0 : validateAmount(total_amount, 'total_amount');
  if (currency !== undefined) currencyCode(currency);
  optionalText(tran_id, 'tran_id', 128);
  optionalUrl(success_url, 'success_url');
  optionalUrl(fail_url, 'fail_url');
  optionalUrl(cancel_url, 'cancel_url');
  const sessionId = `ssl_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const transactionId = tran_id || sessionId;
  const frontendBase = getFrontendBase(req);
  const gatewayBase = getGatewayBase(req, 5051);

  const insertStmt = db.prepare(`
    INSERT INTO sslcommerz_sessions (session_id, tran_id, amount, currency, status, success_url, fail_url, cancel_url, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?)
  `);
  insertStmt.run(
    sessionId,
    String(transactionId),
    parsedAmount,
    currency || 'BDT',
    success_url || `${frontendBase}/tickets`,
    fail_url || `${frontendBase}/`,
    cancel_url || `${frontendBase}/`,
    Date.now()
  );

  res.json({
    status: 'SUCCESS',
    failedreason: '',
    sessionkey: sessionId,
    gw: {
      visa: '1',
      master: '1',
      nagad: '1',
      rocket: '1',
    },
    GatewayPageURL: `${gatewayBase}/sslcommerz/gateway?tran_id=${transactionId}`,
  });
});

paymentsRouter.get('/sslcommerz/gateway', (req: Request, res: Response) => {
  const { tran_id } = req.query;
  if (!tran_id) {
    res.status(400).send('Missing tran_id query parameter');
    return;
  }
  text(tran_id, 'tran_id', 128, true);

  const stmt = db.prepare('SELECT * FROM sslcommerz_sessions WHERE tran_id = ?');
  const session = stmt.get(String(tran_id)) as any;

  if (!session) {
    res.status(404).send('SSLCommerz session not found');
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SSLCommerz Payment Gateway - Mock Sandbox</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: #f0f2f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 16px; }
    .card { background: #ffffff; border-radius: 12px; width: 100%; max-width: 480px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: #1a3b5c; color: #fff; padding: 20px; text-align: center; }
    .header h2 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .body-content { padding: 24px; }
    .amount-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 20px; }
    .amount-num { font-size: 28px; font-weight: 800; color: #0284c7; }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
    .tab { padding: 8px 12px; font-size: 13px; font-weight: 600; border-radius: 6px; background: #e0f2fe; color: #0369a1; }
    .btn-pay { width: 100%; background: #0284c7; color: #fff; border: none; padding: 14px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; margin-bottom: 10px; }
    .btn-pay:hover { background: #0369a1; }
    .btn-fail { width: 100%; background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; padding: 10px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 10px; }
    .btn-cancel { width: 100%; background: transparent; color: #64748b; border: none; padding: 8px; font-size: 13px; cursor: pointer; }
    .footer { font-size: 11px; color: #94a3b8; text-align: center; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>SSLCOMMERZ</h2>
      <div style="font-size:12px;opacity:0.8;margin-top:4px;">Secure Payment Gateway Simulator</div>
    </div>
    <div class="body-content">
      <div class="amount-card">
        <div style="font-size:12px;color:#64748b;">Transaction Reference: ${session.tran_id}</div>
        <div class="amount-num">৳ ${session.amount} <span style="font-size:16px;">${session.currency}</span></div>
      </div>

      <div class="tabs">
        <div class="tab">💳 Cards</div>
        <div class="tab">📱 Mobile Banking</div>
        <div class="tab">🏦 Net Banking</div>
      </div>

      <form method="POST" action="/sslcommerz/gateway/action">
        <input type="hidden" name="tran_id" value="${session.tran_id}">

        <button type="submit" name="action" value="pay" class="btn-pay">
          ✅ Pay ৳ ${session.amount} (SSLCommerz)
        </button>
        <button type="submit" name="action" value="fail" class="btn-fail">
          ❌ Simulate Payment Failure
        </button>
        <button type="submit" name="action" value="cancel" class="btn-cancel">
          Cancel & Return to Merchant
        </button>
      </form>

      <div class="footer">
        Zyrun Local Payment Gateway Emulator (Port 5051).
      </div>
    </div>
  </div>
</body>
</html>
  `;
  res.send(html);
});

paymentsRouter.post('/sslcommerz/gateway/action', async (req: Request, res: Response) => {
  const { tran_id, action } = req.body;
  if (!tran_id) {
    res.status(400).send('Missing tran_id');
    return;
  }
  text(tran_id, 'tran_id', 128, true);
  if (!['pay', 'fail', 'cancel'].includes(action)) throw new InputError('action is invalid');

  const stmt = db.prepare('SELECT * FROM sslcommerz_sessions WHERE tran_id = ?');
  const session = stmt.get(String(tran_id)) as any;

  if (!session) {
    res.status(404).send('Session not found');
    return;
  }

  if (action === 'pay') {
    db.prepare("UPDATE sslcommerz_sessions SET status = 'VALID' WHERE tran_id = ?").run(String(tran_id));
    try {
      await fetch(`${getBackendBase()}/api/v1/payments/callback/sslcommerz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_transaction_id: tran_id,
          status: 'VALID',
        }),
      });
    } catch (err) {
      console.warn('[Mock SSLCommerz] Could not post callback:', err);
    }
    const frontendBase = getFrontendBase(req);
    res.redirect(session.success_url || `${frontendBase}/tickets`);
  } else if (action === 'fail') {
    db.prepare("UPDATE sslcommerz_sessions SET status = 'FAILED' WHERE tran_id = ?").run(String(tran_id));
    try {
      await fetch(`${getBackendBase()}/api/v1/payments/callback/sslcommerz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_transaction_id: tran_id,
          status: 'FAILED',
        }),
      });
    } catch (err) {
      console.warn('[Mock SSLCommerz] Could not post fail callback:', err);
    }
    const frontendBase = getFrontendBase(req);
    res.redirect(session.fail_url || `${frontendBase}/`);
  } else {
    const frontendBase = getFrontendBase(req);
    res.redirect(session.cancel_url || `${frontendBase}/`);
  }
});
