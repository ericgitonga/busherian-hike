"use server";

import { headers } from "next/headers";
import {
  parseRegistration,
  type RegistrationFieldErrors,
} from "@/lib/registration";
import { getSlotsRemaining, insertRegistration } from "@/lib/registrations-store";
import { checkRateLimit, clientIpFromHeaders, REGISTRATION_RATE_LIMIT } from "@/lib/rate-limit";

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
