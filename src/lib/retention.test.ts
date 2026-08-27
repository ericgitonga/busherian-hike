import { describe, expect, it } from "vitest";
import { isPastRetentionWindow, retentionCutoffDate, RETENTION_DAYS } from "./retention";

describe("retentionCutoffDate", () => {
  it("is exactly RETENTION_DAYS after the event date", () => {
    const cutoff = retentionCutoffDate();
    const expected = new Date("2026-09-19T00:00:00Z");
    expected.setUTCDate(expected.getUTCDate() + RETENTION_DAYS);
    expect(cutoff.getTime()).toBe(expected.getTime());
  });
});

describe("isPastRetentionWindow", () => {
  it("is false before the cutoff", () => {
    expect(isPastRetentionWindow(new Date("2026-09-19T00:00:00Z"))).toBe(false);
  });

  it("is false the instant before the cutoff", () => {
    const justBefore = new Date(retentionCutoffDate().getTime() - 1);
    expect(isPastRetentionWindow(justBefore)).toBe(false);
  });

  it("is true exactly at the cutoff", () => {
    expect(isPastRetentionWindow(retentionCutoffDate())).toBe(true);
  });

  it("is true well after the cutoff", () => {
    expect(isPastRetentionWindow(new Date("2027-01-01T00:00:00Z"))).toBe(true);
  });
});
