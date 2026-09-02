import { z } from "zod";
import { KENYAN_PHONE_REGEX, registrationSchema } from "@/lib/registration";

// Combines every main registration field with the M-Pesa proof fields into one schema — the
// single write only ever happens once both are valid together (issue #106), so there's no
// longer a separate "registration" schema and "mpesa payment" schema validated at different
// times against different existing rows. `...registrationSchema.shape` rather than `.extend()`/
// `.merge()` to avoid depending on which of those Zod v4 still exposes identically.
export const completeRegistrationSchema = z.object({
  ...registrationSchema.shape,
  payerPhone: z
    .string()
    .trim()
    .regex(KENYAN_PHONE_REGEX, "Enter a valid phone number, e.g. 0712345678"),
  mpesaCode: z
    .string()
    .transform((value) => value.replace(/[^A-Za-z0-9]/g, ""))
    .refine((value) => value.length > 0, { message: "Enter your M-Pesa transaction code" })
    .refine((value) => value.length <= 50, { message: "M-Pesa transaction code is too long" }),
});

export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>;

export type CompleteRegistrationFieldErrors = Partial<
  Record<keyof CompleteRegistrationInput, string>
>;

// The M-Pesa-specific field names, so a caller (RegistrationForm.tsx) can split a combined
// error object between the main form (still visible if the modal has to close to show one — a
// registration-field error at this point means the earlier validateRegistration pass and this
// one disagreed, which should only happen under a race/tamper, not normal use) and the modal.
export const MPESA_FIELD_KEYS = ["payerPhone", "mpesaCode"] as const;

export function parseCompleteRegistration(input: unknown):
  | { success: true; data: CompleteRegistrationInput }
  | { success: false; errors: CompleteRegistrationFieldErrors } {
  const result = completeRegistrationSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: CompleteRegistrationFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof CompleteRegistrationInput | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { success: false, errors };
}
