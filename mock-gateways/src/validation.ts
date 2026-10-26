import type { NextFunction, Request, Response } from 'express';

export class InputError extends Error {
  status = 400;
}

export function text(value: unknown, field: string, max: number, required = false): string {
  if (typeof value !== 'string') throw new InputError(`${field} must be a string`);
  const result = value.trim();
  if (required && !result) throw new InputError(`${field} is required`);
  if (result.length > max) throw new InputError(`${field} must be at most ${max} characters`);
  if (/[\u0000-\u001f\u007f]/.test(result)) throw new InputError(`${field} contains invalid characters`);
  return result;
}

export function amount(value: unknown, field = 'amount'): number {
  if (!(typeof value === 'number' || (typeof value === 'string' && /^\d+(?:\.\d{1,2})?$/.test(value.trim())))) {
    throw new InputError(`${field} must be a non-negative decimal amount`);
  }
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0 || result > 10_000_000) {
    throw new InputError(`${field} is outside the supported amount range`);
  }
  return result;
}

export function httpUrl(value: unknown, field: string, required = false): string {
  const result = text(value, field, 2048, required);
  if (!result) return result;
  let parsed: URL;
  try {
    parsed = new URL(result);
  } catch {
    throw new InputError(`${field} must be an absolute URL`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
    throw new InputError(`${field} must use HTTP or HTTPS`);
  }
  return result;
}

function check(value: unknown, field: string, depth: number): void {
  if (depth > 12) throw new InputError(`${field} is nested too deeply`);
  if (typeof value === 'string') {
    if (value.length > 4096) throw new InputError(`${field} is too long`);
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > 1000) throw new InputError(`${field} contains too many items`);
    value.forEach((item, index) => check(item, `${field}[${index}]`, depth + 1));
    return;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length > 100) throw new InputError(`${field} contains too many properties`);
    entries.forEach(([key, item]) => check(item, `${field}.${key}`, depth + 1));
  }
}

export function requestBounds(req: Request, _res: Response, next: NextFunction): void {
  try {
    check(req.body, 'body', 0);
    const queryEntries = [...new URLSearchParams(req.originalUrl.split('?')[1] || '').entries()];
    if (queryEntries.length > 32) throw new InputError('query contains too many parameters');
    for (const [key, value] of queryEntries) {
      text(key, 'query key', 128, true);
      text(value, `query.${key}`, 2048);
    }
    for (const segment of req.path.split('/')) text(segment, 'path segment', 256);
    next();
  } catch (error) {
    next(error);
  }
}
