import crypto from "crypto";
import { db } from "@/lib/db";
import { UserAccount } from "@/lib/db";

export function isOAuthConfigured(): boolean {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(id && id.trim().length > 0 && secret && secret.trim().length > 0);
}

export const DEFAULT_USER: UserAccount = {
  id: "default_user",
  name: "Demo Farmer",
  email: "demo@farmyza.local",
  role: "Demo",
  avatar: "👤",
  district: "Satkhira",
  createdAt: new Date().toISOString(),
};

// Ensure the default (demo) user exists in the users table on first run.
try {
  db.prepare(
    "INSERT OR IGNORE INTO users (id, name, email, role, avatar, district, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(
    DEFAULT_USER.id,
    DEFAULT_USER.name,
    DEFAULT_USER.email,
    DEFAULT_USER.role,
    DEFAULT_USER.avatar,
    DEFAULT_USER.district,
    DEFAULT_USER.createdAt
  );
} catch (e) {
  console.warn("[auth] default user upsert failed:", e);
}

const STATE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function env(name: string): string {
  const v = process.env[name];
  if (!v) {
    if (process.env.NODE_ENV === "production") throw new Error(`Missing env ${name}`);
    console.warn(`[auth] Missing env ${name}`);
    return "";
  }
  return v;
}

export function normalizeReturnTo(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== "string") throw new Error("INVALID_RETURN_TO");
  const value = raw.trim();
  if (value.length === 0) return null;
  if (value.length > 2048) throw new Error("INVALID_RETURN_TO");
  if (/[\u0000-\u001f\u007f]/.test(value)) throw new Error("INVALID_RETURN_TO");
  if (value.includes("\\")) throw new Error("INVALID_RETURN_TO");
  if (value.includes("://")) throw new Error("INVALID_RETURN_TO");
  if (!value.startsWith("/")) throw new Error("INVALID_RETURN_TO");
  if (value.startsWith("//")) throw new Error("INVALID_RETURN_TO");
  return value;
}

export function createOAuthState(returnTo: string | null): string {
  const state = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + STATE_TTL_MS).toISOString();
  db.prepare(
    "INSERT INTO oauth_states (state, provider, return_to, expires_at, consumed) VALUES (?, ?, ?, ?, 0)"
  ).run(state, "google", returnTo, expiresAt);
  return state;
}

export function consumeOAuthState(state: string): string | null {
  const now = new Date().toISOString();
  const info = db
    .prepare(
      "UPDATE oauth_states SET consumed = 1 WHERE state = ? AND consumed = 0 AND expires_at > ?"
    )
    .run(state, now);
  if (info.changes === 0) return null; // signal failure via null? need distinguish
  const row = db.prepare("SELECT return_to FROM oauth_states WHERE state = ?").get(state) as
    | { return_to: string | null }
    | undefined;
  return row ? row.return_to : null;
}

// We need to know if consume succeeded; null return_to is valid. Use separate check.
export function tryConsumeState(state: string): { ok: boolean; returnTo: string | null } {
  const now = new Date().toISOString();
  const info = db
    .prepare(
      "UPDATE oauth_states SET consumed = 1 WHERE state = ? AND consumed = 0 AND expires_at > ?"
    )
    .run(state, now);
  if (info.changes === 0) return { ok: false, returnTo: null };
  const row = db.prepare("SELECT return_to FROM oauth_states WHERE state = ?").get(state) as
    | { return_to: string | null }
    | undefined;
  return { ok: true, returnTo: row?.return_to ?? null };
}

export async function exchangeGoogleCode(code: string) {
  const clientId = env("GOOGLE_CLIENT_ID");
  const clientSecret = env("GOOGLE_CLIENT_SECRET");
  const tokenUrl = env("GOOGLE_OAUTH_TOKEN_URL");
  const userInfoUrl = env("GOOGLE_OAUTH_USERINFO_URL");
  const callbackUrl = env("GOOGLE_CALLBACK_URL");

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: callbackUrl,
    }).toString(),
  });
  if (!tokenRes.ok) throw new Error("TOKEN_EXCHANGE_FAILED");
  const tokenData = (await tokenRes.json()) as any;
  if (!tokenData.access_token) throw new Error("NO_ACCESS_TOKEN");

  const uiRes = await fetch(userInfoUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!uiRes.ok) throw new Error("USERINFO_FAILED");
  const u = (await uiRes.json()) as any;
  const emailVerified = u.email_verified === true || u.verified_email === true;
  if (!u.email || !emailVerified) throw new Error("EMAIL_NOT_VERIFIED");

  const name = u.name || `${u.given_name || ""} ${u.family_name || ""}`.trim() || "Google User";
  const givenName = u.given_name || name.split(" ")[0] || "User";
  const familyName = u.family_name || name.split(" ").slice(1).join(" ") || givenName;
  return {
    email: String(u.email).toLowerCase(),
    name,
    givenName,
    familyName,
    avatar: u.picture || "",
    googleId: String(u.sub || u.id || u.email),
  };
}

export function upsertGoogleUser(profile: {
  email: string;
  name: string;
  givenName: string;
  familyName: string;
  avatar: string;
  googleId: string;
}): UserAccount {
  const id = `g_${profile.googleId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  const now = new Date().toISOString();
  let existing = db.prepare("SELECT id FROM users WHERE google_id = ?").get(profile.googleId) as { id: string } | undefined;
  if (!existing) {
    existing = db.prepare("SELECT id FROM users WHERE email = ?").get(profile.email) as { id: string } | undefined;
  }
  if (existing) {
    db.prepare(
      "UPDATE users SET google_id = ?, name = ?, given_name = ?, family_name = ?, picture = ?, avatar = ? WHERE id = ?"
    ).run(profile.googleId, profile.name, profile.givenName, profile.familyName, profile.avatar, profile.avatar, existing.id);
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(existing.id) as any;
    return rowToUser(row);
  }
  db.prepare(
    "INSERT INTO users (id, google_id, email, name, given_name, family_name, picture, role, avatar, district, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(id, profile.googleId, profile.email, profile.name, profile.givenName, profile.familyName, profile.avatar, "Google User", profile.avatar, "", now);
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
  return rowToUser(row);
}

function rowToUser(r: any): UserAccount {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role || "Google User",
    avatar: r.avatar || r.picture || "",
    district: r.district || "",
    createdAt: r.created_at,
  };
}

export function createSession(userId: string): string {
  const id = crypto.randomBytes(32).toString("hex");
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)").run(
    id,
    userId,
    expires,
    now
  );
  return id;
}

export function getSessionUser(sessionId: string | undefined): UserAccount | null {
  if (!sessionId) return null;
  const row = db
    .prepare(
      "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > ?"
    )
    .get(sessionId, new Date().toISOString()) as any;
  if (!row) return null;
  return rowToUser(row);
}

export function deleteSession(sessionId: string | undefined) {
  if (!sessionId) return;
  db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

export function buildAuthUrl(returnTo: string | null): string {
  const clientId = env("GOOGLE_CLIENT_ID");
  const authUrlBase = env("GOOGLE_OAUTH_AUTH_URL");
  const callbackUrl = env("GOOGLE_CALLBACK_URL");
  const state = createOAuthState(returnTo);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: "openid profile email",
    state,
  });
  return `${authUrlBase}?${params.toString()}`;
}