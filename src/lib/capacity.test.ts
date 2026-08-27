import { describe, expect, it } from "vitest";
import { CAPACITY_CAP, computeSlotsRemaining } from "./capacity";

describe("computeSlotsRemaining", () => {
  it("returns the full cap when nobody has paid", () => {
    expect(computeSlotsRemaining(0)).toBe(CAPACITY_CAP);
  });

  it("subtracts the paid count from the cap", () => {
    expect(computeSlotsRemaining(3)).toBe(CAPACITY_CAP - 3);
  });

  it("clamps at zero once the paid count reaches the cap", () => {
    expect(computeSlotsRemaining(CAPACITY_CAP)).toBe(0);
  });

  it("never goes negative if the paid count somehow exceeds the cap", () => {
    expect(computeSlotsRemaining(CAPACITY_CAP + 5)).toBe(0);
  });
});
