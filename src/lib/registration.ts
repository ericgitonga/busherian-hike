import { z } from "zod";

export const SCHOOL_OPTIONS = ["AHS", "AGHS"] as const;

export const AGE_GROUP_OPTIONS = [
  "Under 18",
  "18–29",
  "30–39",
  "40–49",
  "50–59",
  "60+",
] as const;

const KENYAN_PHONE_REGEX = /^(?:\+254|0)[17]\d{8}$/;

const currentYear = new Date().getUTCFullYear();

export const registrationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  ageGroup: z.enum(AGE_GROUP_OPTIONS, {
    message: "Select an age group",
  }),
  school: z.enum(SCHOOL_OPTIONS, {
    message: "Select AHS or AGHS",
  }),
  yearLeft: z.coerce
    .number()
    .int("Enter a valid year")
    .gte(1950, "Enter a valid year")
    .lte(currentYear, "Enter a valid year"),
  guestCount: z.coerce
    .number()
    .int("Enter a whole number")
    .min(0, "Guest count can't be negative")
    .max(10, "Contact the organiser for more than 10 guests"),
  nextOfKinName: z.string().trim().min(1, "Next-of-kin name is required"),
  nextOfKinContact: z
    .string()
    .trim()
    .regex(KENYAN_PHONE_REGEX, "Enter a valid phone number, e.g. 0712345678"),
  needsBus: z.boolean(),
  attendingAfterParty: z.boolean(),
  email: z
    .union([z.literal(""), z.email("Enter a valid email address")])
    .optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export type RegistrationFieldErrors = Partial<
  Record<keyof RegistrationInput, string>
>;

export function parseRegistration(input: unknown):
  | { success: true; data: RegistrationInput }
  | { success: false; errors: RegistrationFieldErrors } {
  const result = registrationSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: RegistrationFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof RegistrationInput | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { success: false, errors };
}
