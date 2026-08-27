import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { computeSlotsRemaining } from "@/lib/capacity";
import type { RegistrationInput } from "@/lib/registration";

export async function insertRegistration(
  input: RegistrationInput,
): Promise<string> {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO registrations (
      id, name, age_group, school, year_left, guest_count,
      next_of_kin_name, next_of_kin_contact, needs_bus,
      attending_after_party, email
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.name,
      input.ageGroup,
      input.school,
      input.yearLeft,
      input.guestCount,
      input.nextOfKinName,
      input.nextOfKinContact,
      input.needsBus ? 1 : 0,
      input.attendingAfterParty ? 1 : 0,
      input.email || null,
    ],
  });
  return id;
}

export async function getPaidCount(): Promise<number> {
  const result = await db.execute(
    "SELECT COUNT(*) as n FROM registrations WHERE paid = 1",
  );
  return Number(result.rows[0].n);
}

export async function getSlotsRemaining(): Promise<number> {
  return computeSlotsRemaining(await getPaidCount());
}
