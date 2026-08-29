import { z } from "zod";
import { KENYAN_PHONE_REGEX } from "@/lib/registration";

// Same pattern as career-transition/intake's mpesa_code handling: alphanumeric-only, proof of
// payment logged for later manual reconciliation against the real M-Pesa statement — not
// verified against Safaricom automatically (issue #70).
export const mpesaPaymentSchema = z.object({
  registrationId: z.string().trim().min(1),
  payerPhone: z
    .string()
    .trim()
    .regex(KENYAN_PHONE_REGEX, "Enter a valid phone number, e.g. 0712345678"),
  mpesaCode: z
    .string()
    .transform((value) => value.replace(/[^A-Za-z0-9]/g, ""))
    .refine((value) => value.length > 0, {
      message: "Enter your M-Pesa transaction code",
    })
    .refine((value) => value.length <= 50, {
      message: "M-Pesa transaction code is too long",
    }),
});

export type MpesaPaymentInput = z.infer<typeof mpesaPaymentSchema>;

export type MpesaPaymentFieldErrors = Partial<
  Record<keyof MpesaPaymentInput, string>
>;

export function parseMpesaPayment(input: unknown):
  | { success: true; data: MpesaPaymentInput }
  | { success: false; errors: MpesaPaymentFieldErrors } {
  const result = mpesaPaymentSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: MpesaPaymentFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof MpesaPaymentInput | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { success: false, errors };
}
