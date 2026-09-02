"use server";

import { headers } from "next/headers";
import {
  parseRegistration,
  type RegistrationFieldErrors,
} from "@/lib/registration";
import { parseMpesaPayment, type MpesaPaymentFieldErrors } from "@/lib/mpesa-payment";
import {
  getSlotsRemaining,
  insertRegistration,
  recordMpesaPayment,
} from "@/lib/registrations-store";
import { sendConfirmation } from "@/lib/confirmation";
import {
  checkRateLimit,
  clientIpFromHeaders,
  MPESA_SUBMIT_RATE_LIMIT,
  REGISTRATION_RATE_LIMIT,
} from "@/lib/rate-limit";

export type RegisterHikerResult =
  | { success: true; id: string }
  | { success: false; reason: "validation"; errors: RegistrationFieldErrors }
  | { success: false; reason: "full" }
  | { success: false; reason: "rate_limited" };

export async function registerHiker(
  input: unknown,
): Promise<RegisterHikerResult> {
  // Unlike the PIN routes, every submission counts here (not just "wrong" ones) — there's no
  // notion of a correct/incorrect registration, only real vs. spam, so the flood itself is what
  // this guards against.
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

  const id = await insertRegistration(result.data);
  return { success: true, id };
}

export type SubmitMpesaPaymentResult =
  | { success: true }
  | { success: false; reason: "validation"; errors: MpesaPaymentFieldErrors }
  | { success: false; reason: "not_found" }
  | { success: false; reason: "rate_limited" };

// Direct M-Pesa P2P (issue #70) has no webhook, so this is the payment-confirmation entry point
// instead — the hiker's own proof-of-payment submission, not machine-verified against Safaricom,
// same as career-transition/intake's mpesa_code. Idempotent by construction
// (recordMpesaPayment only fires sendConfirmation once, on the row's first submission).
export async function submitMpesaPayment(
  input: unknown,
): Promise<SubmitMpesaPaymentResult> {
  const ip = clientIpFromHeaders(await headers());
  if (!(await checkRateLimit("mpesa-submit", ip, MPESA_SUBMIT_RATE_LIMIT))) {
    return { success: false, reason: "rate_limited" };
  }

  const result = parseMpesaPayment(input);
  if (!result.success) {
    return { success: false, reason: "validation", errors: result.errors };
  }

  const { registrationId, payerPhone, mpesaCode } = result.data;
  const recorded = await recordMpesaPayment(registrationId, mpesaCode, payerPhone);

  if (recorded.status === "not_found") {
    return { success: false, reason: "not_found" };
  }

  if (recorded.status === "recorded") {
    await sendConfirmation({
      registrationId,
      name: recorded.name,
      phone: payerPhone,
      email: recorded.email ?? undefined,
      isTestRow: recorded.isTestRow,
    });
  }

  return { success: true };
}
