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

// Empties (rather than NULLs — next_of_kin_* are NOT NULL columns) next-of-kin and contact
// fields. Idempotent: rows already purged just don't match the WHERE clause again. Everything
// else on the row (name, school, headcount fields, paid/checked-in state) is left intact —
// issue #9's scope is these specific fields, not full anonymisation.
export type Attendee = { id: string; name: string; checkedIn: boolean };

export async function getPaidAttendees(): Promise<Attendee[]> {
  const result = await db.execute(
    "SELECT id, name, checked_in FROM registrations WHERE paid = 1",
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    checkedIn: Number(row.checked_in) === 1,
  }));
}

// Idempotent: only touches rows not already checked in, so a duplicate sync (offline retry,
// double scan) never overwrites the original checked_in_at timestamp.
export async function markCheckedIn(registrationId: string): Promise<void> {
  await db.execute({
    sql: `UPDATE registrations
          SET checked_in = 1, checked_in_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
          WHERE id = ? AND checked_in = 0`,
    args: [registrationId],
  });
}

// Full rows, including next-of-kin numbers — gated behind ORGANISER_PIN at the route level
// (see src/app/api/export/registrations/route.ts), never called from anywhere public-facing.
export async function getAllRegistrations(): Promise<Record<string, unknown>[]> {
  const result = await db.execute("SELECT * FROM registrations ORDER BY created_at");
  return result.rows.map((row) => ({ ...row }));
}

export async function purgeContactFields(): Promise<number> {
  const result = await db.execute(
    `UPDATE registrations
     SET next_of_kin_name = '', next_of_kin_contact = '', email = NULL
     WHERE next_of_kin_name != '' OR next_of_kin_contact != '' OR email IS NOT NULL`,
  );
  return result.rowsAffected;
}
