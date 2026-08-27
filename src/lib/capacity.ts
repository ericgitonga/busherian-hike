// PLACEHOLDER (extras/requirements.md) — real cap pending from Luchiri. This is the one place
// to edit once the real number arrives.
export const CAPACITY_CAP = 10;

export function computeSlotsRemaining(paidCount: number): number {
  return Math.max(0, CAPACITY_CAP - paidCount);
}
