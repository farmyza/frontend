import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from './db.js';
import { httpUrl, InputError, text } from './validation.js';

export const oauthRouter = Router();

// 1. GET /oauth2/v2/auth (Interactive Google OAuth Consent UI)
oauthRouter.get('/auth', (req: Request, res: Response) => {
  const { client_id, redirect_uri, state, scope } = req.query;

  if (typeof client_id !== 'string' || typeof redirect_uri !== 'string') {
    res.status(400).send('Missing client_id or redirect_uri query parameters');
    return;
  }
  text(client_id, 'client_id', 512, true);
  httpUrl(redirect_uri, 'redirect_uri', true);
  if (state !== undefined) text(state, 'state', 2048);
  if (scope !== undefined) text(scope, 'scope', 2048);

  // Fetch preset google users
  const usersStmt = db.prepare('SELECT * FROM google_users ORDER BY name ASC');
  const users = usersStmt.all() as any[];

  // Render Google-style login consent page
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in with Google - Zyrun Demo Gateway</title>
  <style>
    * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #f0f4f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
    .card { background: #ffffff; border-radius: 28px; width: 100%; max-width: 480px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .google-logo { width: 44px; height: 44px; margin-bottom: 16px; }
    h1 { font-size: 24px; font-weight: 500; color: #1f1f1f; margin: 0 0 8px 0; }
    p.sub { font-size: 14px; color: #444746; margin: 0 0 24px 0; }
    .app-badge { display: inline-flex; align-items: center; gap: 8px; background: #e8f0fe; color: #1a73e8; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; margin-bottom: 24px; }
    .account-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
    .account-item { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border: 1px solid #dadce0; border-radius: 12px; text-decoration: none; color: inherit; cursor: pointer; transition: background 0.15s, border-color 0.15s; background: none; width: 100%; text-align: left; }
    .account-item:hover { background-color: #f8fafd; border-color: #1a73e8; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: #c2e7ff; display: grid; place-items: center; font-weight: 600; color: #001d35; overflow: hidden; }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .account-info { display: flex; flex-direction: column; }
    .account-name { font-size: 14px; font-weight: 500; color: #1f1f1f; }
    .account-email { font-size: 12px; color: #5f6368; }
    .custom-form { border-top: 1px solid #dadce0; padding-top: 20px; margin-top: 10px; }
    .custom-form h3 { font-size: 14px; font-weight: 600; color: #1f1f1f; margin: 0 0 12px 0; }
    .form-group { margin-bottom: 12px; }
    .form-group label { display: block; font-size: 12px; color: #444746; margin-bottom: 4px; }
    .form-group input { width: 100%; padding: 10px 14px; border: 1px solid #dadce0; border-radius: 8px; font-size: 14px; outline: none; }
    .form-group input:focus { border-color: #1a73e8; box-shadow: 0 0 0 2px rgba(26,115,232,0.2); }
    .btn-submit { width: 100%; background: #0b57d0; color: #ffffff; border: none; padding: 12px; border-radius: 20px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
    .btn-submit:hover { background: #0842a0; }
    .footer { font-size: 11px; color: #747775; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <svg class="google-logo" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
    </svg>
    <h1>Choose an account</h1>
    <p class="sub">to continue to <span style="font-weight:600;color:#1f1f1f;">Zyrun</span></p>

    <div class="app-badge">
      <span>🔒 Mock OAuth Server (Port 5050)</span>
    </div>

    <form method="POST" action="/oauth2/v2/auth/consent">
      <input type="hidden" name="client_id" value="${encodeURIComponent(String(client_id))}">
      <input type="hidden" name="redirect_uri" value="${encodeURIComponent(String(redirect_uri))}">
      <input type="hidden" name="state" value="${encodeURIComponent(String(state || ''))}">
      <input type="hidden" name="scope" value="${encodeURIComponent(String(scope || ''))}">

      <div class="account-list">
        ${users
          .map(
            (u) => `
          <button type="submit" name="google_id" value="${u.google_id}" class="account-item">
            <div class="avatar">
              ${u.picture ? `<img src="${u.picture}" alt="${u.name}" />` : u.name[0]}
            </div>
            <div class="account-info">
              <span class="account-name">${u.name}</span>
              <span class="account-email">${u.email}</span>
            </div>
          </button>
        `
          )
          .join('')}
      </div>

      <div class="custom-form">
        <h3>Or use another demo account:</h3>
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" name="custom_name" placeholder="e.g. Mahfuz Rahman" />
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" name="custom_email" placeholder="e.g. mahfuz@example.com" />
        </div>
        <button type="submit" name="use_custom" value="1" class="btn-submit">Continue with Custom Account</button>
      </div>
    </form>

    <div class="footer">
      Zyrun Local Google OAuth Gateway Emulator. Zero external network calls.
    </div>
  </div>
</body>
</html>
  `;
  res.send(html);
});

// 2. POST /oauth2/v2/auth/consent (Handles account selection and issues authorization code)
oauthRouter.post('/auth/consent', (req: Request, res: Response) => {
  const { client_id, redirect_uri, state, google_id, use_custom, custom_name, custom_email } = req.body;
  const clientId = text(client_id, 'client_id', 512, true);
  const encodedRedirect = text(redirect_uri, 'redirect_uri', 2048, true);
  let redirectUri: string;
  try {
    redirectUri = decodeURIComponent(encodedRedirect);
  } catch {
    throw new InputError('redirect_uri is invalid');
  }
  httpUrl(redirectUri, 'redirect_uri', true);
  const stateValue = state === undefined ? '' : text(state, 'state', 2048);

  let selectedGoogleId = google_id;
  if (selectedGoogleId !== undefined) {
    selectedGoogleId = text(selectedGoogleId, 'google_id', 64, true);
    if (!/^[A-Za-z0-9_-]+$/.test(selectedGoogleId)) throw new InputError('google_id is invalid');
  }

  if (use_custom === '1' && custom_email) {
    const email = text(custom_email, 'custom_email', 254, true).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new InputError('custom_email is invalid');
    const name = custom_name === undefined ? 'Demo User' : text(custom_name, 'custom_name', 120);
    const resolvedName = name || 'Demo User';
    const parts = resolvedName.split(' ');
    const givenName = parts[0];
    const familyName = parts.slice(1).join(' ') || givenName;

    // Check if user already exists
    const findStmt = db.prepare('SELECT google_id FROM google_users WHERE email = ?');
    const existing = findStmt.get(email) as any;

    if (existing) {
      selectedGoogleId = existing.google_id;
    } else {
      selectedGoogleId = `google_usr_${crypto.randomBytes(6).toString('hex')}`;
      const insertStmt = db.prepare(`
        INSERT INTO google_users (google_id, email, name, given_name, family_name, picture)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insertStmt.run(
        selectedGoogleId,
        email,
        resolvedName,
        givenName,
        familyName,
        `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(givenName)}`
      );
    }
  }

  if (!selectedGoogleId) {
    res.status(400).send('No user account selected');
    return;
  }
  const selectedUser = db.prepare('SELECT 1 FROM google_users WHERE google_id = ?').get(selectedGoogleId);
  if (!selectedUser) {
    res.status(400).send('Selected demo account does not exist');
    return;
  }

  // Generate authorization code
  const code = `mock_code_${crypto.randomBytes(16).toString('hex')}`;
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 min

  const insertCode = db.prepare(`
    INSERT INTO auth_codes (code, google_id, client_id, redirect_uri, consumed, expires_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `);
  insertCode.run(code, selectedGoogleId, clientId, encodedRedirect, expiresAt);

  const redirectTarget = new URL(redirectUri);
  redirectTarget.searchParams.set('code', code);
  if (stateValue) {
    redirectTarget.searchParams.set('state', stateValue);
  }

  res.redirect(redirectTarget.toString());
});

// 3. POST /oauth2/v4/token (Token exchange endpoint)
oauthRouter.post('/token', (req: Request, res: Response) => {
  const { code, client_id, client_secret } = req.body;

  if (typeof code !== 'string' || !code) {
    res.status(400).json({ error: 'invalid_request', error_description: 'Missing code' });
    return;
  }
  text(code, 'code', 256, true);
  if (client_id !== undefined) text(client_id, 'client_id', 512);
  if (client_secret !== undefined) text(client_secret, 'client_secret', 1024);

  const findCode = db.prepare(`
    SELECT * FROM auth_codes 
    WHERE code = ? AND consumed = 0 AND expires_at > ?
  `);
  const record = findCode.get(code, Date.now()) as any;

  if (!record) {
    res.status(400).json({ error: 'invalid_grant', error_description: 'Code is invalid, expired or consumed' });
    return;
  }

  // Mark consumed
  db.prepare('UPDATE auth_codes SET consumed = 1 WHERE code = ?').run(code);

  // Generate access token
  const accessToken = `mock_google_at_${crypto.randomBytes(24).toString('hex')}`;
  const tokenExpiresAt = Date.now() + 3600 * 1000;

  db.prepare('INSERT INTO access_tokens (token, google_id, expires_at) VALUES (?, ?, ?)').run(
    accessToken,
    record.google_id,
    tokenExpiresAt
  );

  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    id_token: `mock_id_token_${crypto.randomBytes(32).toString('hex')}`,
  });
});

// 4. GET /oauth2/v2/userinfo (User profile endpoint)
oauthRouter.get('/userinfo', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  text(authHeader, 'authorization', 4096);
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    res.status(401).json({ error: 'unauthorized', error_description: 'Missing access token' });
    return;
  }

  const findToken = db.prepare('SELECT * FROM access_tokens WHERE token = ? AND expires_at > ?');
  const tokenRecord = findToken.get(token, Date.now()) as any;

  if (!tokenRecord) {
    res.status(401).json({ error: 'invalid_token', error_description: 'Token expired or invalid' });
    return;
  }

  const findUser = db.prepare('SELECT * FROM google_users WHERE google_id = ?');
  const user = findUser.get(tokenRecord.google_id) as any;

  if (!user) {
    res.status(404).json({ error: 'user_not_found' });
    return;
  }

  res.json({
    id: user.google_id,
    email: user.email,
    verified_email: true,
    name: user.name,
    given_name: user.given_name,
    family_name: user.family_name,
    picture: user.picture,
  });
});
