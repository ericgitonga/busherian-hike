import { timingSafeEqual } from "node:crypto";

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
