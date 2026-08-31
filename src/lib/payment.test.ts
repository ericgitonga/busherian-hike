import { describe, expect, it } from "vitest";
import { PER_HIKER_FEE_KES, totalFeeKes } from "./payment";

describe("totalFeeKes", () => {
  it("charges just the per-hiker rate with no guests", () => {
    expect(totalFeeKes(0)).toBe(PER_HIKER_FEE_KES);
  });

  it("charges the registrant plus each guest at the same per-head rate", () => {
    expect(totalFeeKes(2)).toBe(PER_HIKER_FEE_KES * 3);
  });

  it("charges up to the max of 10 guests", () => {
    expect(totalFeeKes(10)).toBe(PER_HIKER_FEE_KES * 11);
  });
});
