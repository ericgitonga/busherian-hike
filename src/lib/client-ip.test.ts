import { describe, expect, it } from "vitest";
import { clientIpFromHeaders } from "./client-ip";

// The DB-backed rate-limit primitives in rate-limit.ts (checkRateLimit/isLockedOut/
// recordAuthFailure) are covered by e2e (e2e/test_rate_limit.py), not here — per this project's
// "unit tests for pure logic, e2e for anything touching the DB" convention (see
// registrations-store.ts, which has no unit tests either). This file only covers the pure
// header-parsing helper, split into its own module for exactly that reason (see client-ip.ts).

describe("clientIpFromHeaders", () => {
  it("uses the first entry of a multi-value x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIpFromHeaders(headers)).toBe("1.2.3.4");
  });

  it("trims whitespace around the first entry", () => {
    const headers = new Headers({ "x-forwarded-for": "  1.2.3.4  ,5.6.7.8" });
    expect(clientIpFromHeaders(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(clientIpFromHeaders(headers)).toBe("9.9.9.9");
  });

  it("prefers x-forwarded-for over x-real-ip when both are present", () => {
    const headers = new Headers({
      "x-forwarded-for": "1.2.3.4",
      "x-real-ip": "9.9.9.9",
    });
    expect(clientIpFromHeaders(headers)).toBe("1.2.3.4");
  });

  it('falls back to "unknown" when neither header is present', () => {
    expect(clientIpFromHeaders(new Headers())).toBe("unknown");
  });

  it('falls back to "unknown" when x-forwarded-for is present but empty', () => {
    const headers = new Headers({ "x-forwarded-for": "" });
    expect(clientIpFromHeaders(headers)).toBe("unknown");
  });
});
