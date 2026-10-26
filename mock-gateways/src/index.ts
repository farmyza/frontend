import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import { oauthRouter } from './oauth.routes.js';
import { paymentsRouter } from './payments.routes.js';
import { requestBounds } from './validation.js';

initDatabase();

// Fully permissive CORS middleware that reflects origin, supports credentials, wildcards headers & methods, and handles preflights
const permissiveCors = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    (req.headers['access-control-request-headers'] as string) ||
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma'
  );
  res.setHeader('Access-Control-Expose-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
};

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  console.error('[Mock Gateway Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
};

// 1. OAuth Server (Port 5050)
const oauthApp = express();
oauthApp.use(permissiveCors);
oauthApp.use(cors({ origin: true, credentials: true }));
oauthApp.use(express.json({ limit: '64kb' }));
oauthApp.use(express.urlencoded({ extended: false, limit: '64kb', parameterLimit: 32 }));
oauthApp.use(requestBounds);
oauthApp.get('/health', (req, res) => res.json({ status: 'ok', service: 'mock-google-oauth' }));
oauthApp.use('/oauth2/v2', oauthRouter);
oauthApp.use('/oauth2/v4', oauthRouter);
oauthApp.use(errorHandler);

const OAUTH_PORT = 5100;
oauthApp.listen(OAUTH_PORT, () => {
  console.log(`[Mock Google OAuth] Running at http://localhost:${OAUTH_PORT}`);
  console.log(`[Mock Google OAuth] Consent URL: http://localhost:${OAUTH_PORT}/oauth2/v2/auth`);
});

// 2. Payments Server (Port 5051)
const paymentsApp = express();
paymentsApp.use(permissiveCors);
paymentsApp.use(cors({ origin: true, credentials: true }));
paymentsApp.use(express.json({ limit: '64kb' }));
paymentsApp.use(express.urlencoded({ extended: false, limit: '64kb', parameterLimit: 32 }));
paymentsApp.use(requestBounds);
paymentsApp.get('/health', (req, res) => res.json({ status: 'ok', service: 'mock-payments-gateway' }));
paymentsApp.use('/', paymentsRouter);
paymentsApp.use(errorHandler);

const PAYMENTS_PORT = 5101;
paymentsApp.listen(PAYMENTS_PORT, () => {
  console.log(`[Mock Payments Gateway] Running at http://localhost:${PAYMENTS_PORT}`);
  console.log(`[Mock Payments Gateway] bKash: http://localhost:${PAYMENTS_PORT}/bkash/gateway`);
  console.log(`[Mock Payments Gateway] SSLCommerz: http://localhost:${PAYMENTS_PORT}/sslcommerz/gateway`);
});
