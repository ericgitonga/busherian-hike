import { createHmac, timingSafeEqual } from "node:crypto";

// Constant-time string comparison — a plain `!==` short-circuits at the first mismatched
// character, letting response latency leak how many leading characters of a guess were
// correct. `timingSafeEqual` requires equal-length buffers; the length check below is the
// only shortcut left, which leaks only whether the *lengths* match, not any content.
export function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyPin(pin: unknown): boolean {
  const expected = process.env.ORGANISER_PIN;
  if (!expected || typeof pin !== "string") return false;
  return safeEqual(pin, expected);
}

export function verifyCronSecret(authHeader: string | null): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected || !authHeader) return false;
  return safeEqual(authHeader, `Bearer ${expected}`);
}

// Short-lived, server-issued organiser session (issue #27) — replaces persisting the raw
// ORGANISER_PIN in localStorage indefinitely. Stateless: an HMAC-signed expiry, keyed on
// ORGANISER_PIN itself (so rotating the PIN also invalidates every existing session, a nice
// side effect), rather than a separate session table/store. Shared by every PIN-gated organiser
// area (check-in, payments — issue #82) via its own separately-scoped cookie; the token itself
// doesn't encode which area it's for, only that the PIN was verified within the TTL.
export const CHECKIN_SESSION_COOKIE = "checkin_session";
export const PAYMENTS_SESSION_COOKIE = "payments_session";
const ORGANISER_SESSION_TTL_SECONDS = 4 * 60 * 60; // long enough to span one event day
export const CHECKIN_SESSION_MAX_AGE_SECONDS = ORGANISER_SESSION_TTL_SECONDS;
export const PAYMENTS_SESSION_MAX_AGE_SECONDS = ORGANISER_SESSION_TTL_SECONDS;

function signSessionExpiry(expiresAt: number, secret: string): string {
  return createHmac("sha256", secret).update(String(expiresAt)).digest("hex");
}

export function createOrganiserSessionToken(): string {
  const secret = process.env.ORGANISER_PIN;
  if (!secret) throw new Error("ORGANISER_PIN not set");
  const expiresAt = Math.floor(Date.now() / 1000) + ORGANISER_SESSION_TTL_SECONDS;
  return `${expiresAt}.${signSessionExpiry(expiresAt, secret)}`;
}

export function verifyOrganiserSessionToken(token: string | undefined | null): boolean {
  const secret = process.env.ORGANISER_PIN;
  if (!secret || !token) return false;

  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isInteger(expiresAt)) return false;
  if (!safeEqual(signature, signSessionExpiry(expiresAt, secret))) return false;

  return expiresAt > Math.floor(Date.now() / 1000);
}
