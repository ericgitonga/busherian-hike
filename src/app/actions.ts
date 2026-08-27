"use server";

import {
  parseRegistration,
  type RegistrationFieldErrors,
} from "@/lib/registration";
import { getSlotsRemaining, insertRegistration } from "@/lib/registrations-store";

export type RegisterHikerResult =
  | { success: true; id: string }
  | { success: false; reason: "validation"; errors: RegistrationFieldErrors }
  | { success: false; reason: "full" };

export async function registerHiker(
  input: unknown,
): Promise<RegisterHikerResult> {
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
