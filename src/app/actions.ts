"use server";

import {
  parseRegistration,
  type RegistrationFieldErrors,
} from "@/lib/registration";
import { insertRegistration } from "@/lib/registrations-store";

export type RegisterHikerResult =
  | { success: true; id: string }
  | { success: false; errors: RegistrationFieldErrors };

export async function registerHiker(
  input: unknown,
): Promise<RegisterHikerResult> {
  const result = parseRegistration(input);
  if (!result.success) {
    return { success: false, errors: result.errors };
  }
  const id = await insertRegistration(result.data);
  return { success: true, id };
}
