import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mocked so this route's DB dependency (purgeContactFields -> @/lib/registrations-store ->
// @/lib/db) never actually loads — @/lib/db throws at import time without TURSO_* env vars,
// which the unit-test CI job deliberately never sets (see auth.test.ts/client-ip.test.ts for
// the same pattern elsewhere in this project).
vi.mock("@/lib/registrations-store", () => ({
  purgeContactFields: vi.fn(),
}));

import { purgeContactFields } from "@/lib/registrations-store";
import { GET } from "./route";

const ORIGINAL_CRON_SECRET = process.env.CRON_SECRET;

function request(authHeader?: string): Request {
  const headers = new Headers();
  if (authHeader !== undefined) headers.set("authorization", authHeader);
  return new Request("http://localhost/api/cron/purge-contact-fields", { headers });
}

describe("GET /api/cron/purge-contact-fields", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = "test-cron-secret";
    vi.mocked(purgeContactFields).mockReset();
  });

  afterEach(() => {
    process.env.CRON_SECRET = ORIGINAL_CRON_SECRET;
    vi.useRealTimers();
  });

  it("rejects a request with no Authorization header", async () => {
    const res = await GET(request());
    expect(res.status).toBe(401);
    expect(purgeContactFields).not.toHaveBeenCalled();
  });

  it("rejects a request with the wrong secret", async () => {
    const res = await GET(request("Bearer wrong-secret"));
    expect(res.status).toBe(401);
    expect(purgeContactFields).not.toHaveBeenCalled();
  });

  it("does not purge before the retention cutoff, even with the correct secret", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-27T00:00:00Z")); // event is 2026-09-19 — well before cutoff
    const res = await GET(request("Bearer test-cron-secret"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      purged: false,
      reason: "before retention cutoff",
    });
    expect(purgeContactFields).not.toHaveBeenCalled();
  });

  it("purges and reports the count once past the retention cutoff", async () => {
    vi.mocked(purgeContactFields).mockResolvedValue(3);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-01-01T00:00:00Z")); // well past any realistic cutoff
    const res = await GET(request("Bearer test-cron-secret"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ purged: true, count: 3 });
    expect(purgeContactFields).toHaveBeenCalledOnce();
  });
});
