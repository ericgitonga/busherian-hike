import { timingSafeEqual } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { safeEqual, verifyCronSecret, verifyPin } from "./auth";

vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();
  return { ...actual, timingSafeEqual: vi.fn(actual.timingSafeEqual) };
});

describe("safeEqual", () => {
  it("returns true for identical strings", () => {
    expect(safeEqual("abc123", "abc123")).toBe(true);
  });

  it("returns false for different strings of the same length", () => {
    expect(safeEqual("abc123", "abc124")).toBe(false);
  });

  it("returns false for different-length strings without throwing", () => {
    expect(() => safeEqual("short", "a-lot-longer")).not.toThrow();
    expect(safeEqual("short", "a-lot-longer")).toBe(false);
  });

  it("returns false comparing against an empty string", () => {
    expect(safeEqual("abc", "")).toBe(false);
  });

  it("is backed by crypto.timingSafeEqual, not a fast-exit operator", () => {
    // Regression guard against a future revert to `!==`/`===`.
    vi.mocked(timingSafeEqual).mockClear();
    safeEqual("abc123", "abc123");
    expect(timingSafeEqual).toHaveBeenCalled();
  });
});

describe("verifyPin", () => {
  const ORIGINAL_ENV = process.env.ORGANISER_PIN;

  beforeEach(() => {
    process.env.ORGANISER_PIN = "12345678";
  });

  afterEach(() => {
    process.env.ORGANISER_PIN = ORIGINAL_ENV;
  });

  it("accepts the correct pin", () => {
    expect(verifyPin("12345678")).toBe(true);
  });

  it("rejects an incorrect pin", () => {
    expect(verifyPin("00000000")).toBe(false);
  });

  it("rejects a non-string pin without throwing", () => {
    expect(() => verifyPin(undefined)).not.toThrow();
    expect(verifyPin(undefined)).toBe(false);
    expect(verifyPin(12345678)).toBe(false);
    expect(verifyPin(null)).toBe(false);
  });

  it("rejects any pin when ORGANISER_PIN is unset", () => {
    delete process.env.ORGANISER_PIN;
    expect(verifyPin("12345678")).toBe(false);
  });
});

describe("verifyCronSecret", () => {
  const ORIGINAL_ENV = process.env.CRON_SECRET;

  beforeEach(() => {
    process.env.CRON_SECRET = "test-cron-secret";
  });

  afterEach(() => {
    process.env.CRON_SECRET = ORIGINAL_ENV;
  });

  it("accepts the correct bearer header", () => {
    expect(verifyCronSecret("Bearer test-cron-secret")).toBe(true);
  });

  it("rejects an incorrect bearer header", () => {
    expect(verifyCronSecret("Bearer wrong-secret")).toBe(false);
  });

  it("rejects a missing header without throwing", () => {
    expect(() => verifyCronSecret(null)).not.toThrow();
    expect(verifyCronSecret(null)).toBe(false);
  });

  it("rejects any header when CRON_SECRET is unset", () => {
    delete process.env.CRON_SECRET;
    expect(verifyCronSecret("Bearer test-cron-secret")).toBe(false);
  });
});
