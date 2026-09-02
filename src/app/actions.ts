"use server";

import { headers } from "next/headers";
import {
  parseRegistration,
  type RegistrationFieldErrors,
} from "@/lib/registration";
import {
  parseCompleteRegistration,
  type CompleteRegistrationFieldErrors,
} from "@/lib/complete-registration";
import {
  getSlotsRemaining,
  insertCompleteRegistration,
  updateSmsStatus,
} from "@/lib/registrations-store";
import { sendConfirmation } from "@/lib/confirmation";
import {
  checkRateLimit,
  clientIpFromHeaders,
  COMPLETE_REGISTRATION_RATE_LIMIT,
  REGISTRATION_RATE_LIMIT,
} from "@/lib/rate-limit";

export type ValidateRegistrationResult =
  | { success: true }
  | { success: false; reason: "validation"; errors: RegistrationFieldErrors }
  | { success: false; reason: "full" }
  | { success: false; reason: "rate_limited" };

// The "Register" click (issue #106) — validates the main form and checks capacity, but writes
// nothing to the database. It only ever gates whether the payment modal opens; the modal itself
// holds every already-typed field in client state until (and only until) the M-Pesa proof is
// also submitted, so abandoning the flow anywhere before that point leaves nothing behind. This
// is a client-experience gate, not a security boundary — completeRegistration below re-validates
// everything from scratch rather than trusting that this step already ran.
export async function validateRegistration(
  input: unknown,
): Promise<ValidateRegistrationResult> {
  const ip = clientIpFromHeaders(await headers());
  if (!(await checkRateLimit("register", ip, REGISTRATION_RATE_LIMIT))) {
    return { success: false, reason: "rate_limited" };
  }

  const result = parseRegistration(input);
  if (!result.success) {
    return { success: false, reason: "validation", errors: result.errors };
  }

  if ((await getSlotsRemaining()) <= 0) {
    return { success: false, reason: "full" };
  }

  return { success: true };
}

export type CompleteRegistrationResult =
  | { success: true }
  | { success: false; reason: "validation"; errors: CompleteRegistrationFieldErrors }
  | { success: false; reason: "full" }
  | { success: false; reason: "rate_limited" };

// The M-Pesa proof submit (issue #106) — the *only* place a registration row is ever written.
// Re-validates every field from scratch (both the main registration fields and the M-Pesa proof,
// via the combined schema) rather than trusting validateRegistration's earlier pass, then
// re-checks capacity (slots could have filled between the two steps), then performs the single
// insert with mpesa_code/payer_phone already set, then fires the confirmation immediately.
export async function completeRegistration(
  input: unknown,
): Promise<CompleteRegistrationResult> {
  const ip = clientIpFromHeaders(await headers());
  if (!(await checkRateLimit("complete-registration", ip, COMPLETE_REGISTRATION_RATE_LIMIT))) {
    return { success: false, reason: "rate_limited" };
  }

  const result = parseCompleteRegistration(input);
  if (!result.success) {
    return { success: false, reason: "validation", errors: result.errors };
  }

  if ((await getSlotsRemaining()) <= 0) {
    return { success: false, reason: "full" };
  }

  const row = await insertCompleteRegistration(result.data);

  const confirmationResult = await sendConfirmation({
    registrationId: row.id,
    name: row.name,
    phone: result.data.payerPhone,
    email: row.email ?? undefined,
    isTestRow: row.isTestRow,
  });
  // 'failed' here is what api/cron/retry-failed-sms and /payments's Resend button both act on
  // (issue #96) — a real send attempt that came back false, as opposed to a test row's
  // deliberate 'skipped' (never attempted at all, see confirmation.ts).
  await updateSmsStatus(
    row.id,
    row.isTestRow ? "skipped" : confirmationResult.smsSent ? "sent" : "failed",
  );

  return { success: true };
}
