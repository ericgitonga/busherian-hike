// Fee confirmed (extras/requirements.md). Payment is direct M-Pesa P2P (issue #70, superseding
// the IntaSend Payment Link — #6/#7/#35). Jessica Rutto is collecting the registration fee
// (issue #78) — MPESA_RECIPIENT_PHONE/NAME below are the one place to edit if that changes.
export const PER_HIKER_FEE_KES = 1500;
export const MPESA_RECIPIENT_PHONE = "0723893192";
export const MPESA_RECIPIENT_NAME = "Jessica Rutto";

// Guests pay the same per-head rate as the registrant (issue #80) — the registrant plus their
// guestCount, not guestCount alone.
export function totalFeeKes(guestCount: number): number {
  return PER_HIKER_FEE_KES * (1 + guestCount);
}
