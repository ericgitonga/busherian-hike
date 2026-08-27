"use server";

import {
  parseRegistration,
  type RegistrationFieldErrors,
} from "@/lib/registration";

export type RegisterHikerResult =
  | { success: true }
  | { success: false; errors: RegistrationFieldErrors };

// No data store exists yet (tracked in issue #3) — this validates the submission but does not
// persist it. Swap in a real write once the registrations table lands.
export async function registerHiker(
  input: unknown,
): Promise<RegisterHikerResult> {
  const result = parseRegistration(input);
  if (!result.success) {
    return { success: false, errors: result.errors };
  }
  return { success: true };
}
