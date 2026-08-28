// Confirmed (extras/requirements.md) — 100 slots.
export const CAPACITY_CAP = 100;

export function computeSlotsRemaining(paidCount: number): number {
  return Math.max(0, CAPACITY_CAP - paidCount);
}
