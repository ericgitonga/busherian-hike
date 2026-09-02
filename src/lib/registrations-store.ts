import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { computeSlotsRemaining } from "@/lib/capacity";
import type { CompleteRegistrationInput } from "@/lib/complete-registration";

export type CompletedRegistration = {
  id: string;
  name: string;
  email: string | null;
  isTestRow: boolean;
};

// The only place a registration row is ever written (issue #106) — mpesa_code/payer_phone are
// set at insert time, not via a later UPDATE, since the M-Pesa proof submit is now the single
// point a write happens at all. Abandoning the flow anywhere before that point (closing the
// tab, never sending the money) therefore leaves nothing behind to clean up. Unlike the old
// two-step insert-then-update flow, there's no idempotency guard against a genuine double-submit
// creating two rows — there's no existing row to de-duplicate against here, only the client's
// own disable-while-submitting button state, the same level of protection a plain insert
// (registerHiker's, before this issue) always had.
export async function insertCompleteRegistration(
  input: CompleteRegistrationInput,
): Promise<CompletedRegistration> {
  const id = randomUUID();
  await db.execute({
    sql: `INSERT INTO registrations (
      id, name, age_group, school, year_left, guest_count,
      next_of_kin_name, next_of_kin_contact, needs_bus,
      ticket_type, email, is_test_row, terms_accepted, media_consent,
      mpesa_code, payer_phone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      input.ticketType,
      input.email || null,
      input.isTestRow ? 1 : 0,
      input.termsAccepted ? 1 : 0,
      input.mediaConsent,
      input.mpesaCode,
      input.payerPhone,
    ],
  });
  return { id, name: input.name, email: input.email || null, isTestRow: !!input.isTestRow };
}

// Headcount, not row count (issue #82) — CAPACITY_CAP is confirmed as 100 people
// (extras/requirements.md), and a paid registration's guests count against it the same as the
// registrant themselves.
export async function getPaidCount(): Promise<number> {
  const result = await db.execute(
    "SELECT COALESCE(SUM(1 + guest_count), 0) as n FROM registrations WHERE paid = 1",
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
// double scan) never overwrites the original checked_in_at timestamp. Returns whether a row was
// actually matched — a garbage or already-checked-in id is a silent no-op otherwise, with no way
// for the caller to tell that apart from a real check-in (issue #38).
export async function markCheckedIn(registrationId: string): Promise<boolean> {
  const result = await db.execute({
    sql: `UPDATE registrations
          SET checked_in = 1, checked_in_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
          WHERE id = ? AND checked_in = 0`,
    args: [registrationId],
  });
  return result.rowsAffected > 0;
}

export type SmsStatus = "sent" | "failed" | "skipped";

export type PaymentListRow = {
  id: string;
  name: string;
  school: string;
  ticketType: string;
  guestCount: number;
  paid: boolean;
  mpesaCode: string | null;
  payerPhone: string | null;
  smsStatus: SmsStatus | null;
};

// For the PIN-gated "mark paid" list (issue #82) — deliberately narrower than
// getAllRegistrations: no next-of-kin name/contact or email, so this can't be used as a
// backdoor around the full export's "only Luchiri and named committee members" framing while
// still giving whoever's collecting payment enough (name, school, guest count, the M-Pesa proof
// already on file) to find the right row and cross-check it against what they actually
// received.
export async function getRegistrationsForPayments(): Promise<PaymentListRow[]> {
  const result = await db.execute(
    `SELECT id, name, school, ticket_type, guest_count, paid, mpesa_code, payer_phone, sms_status
     FROM registrations ORDER BY name`,
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    school: String(row.school),
    ticketType: String(row.ticket_type),
    guestCount: Number(row.guest_count),
    paid: Number(row.paid) === 1,
    mpesaCode: row.mpesa_code ? String(row.mpesa_code) : null,
    payerPhone: row.payer_phone ? String(row.payer_phone) : null,
    smsStatus: row.sms_status ? (String(row.sms_status) as SmsStatus) : null,
  }));
}

// Written once, right after sendConfirmation's one real attempt at insert time (issue #106) —
// 'failed' rows are what the retry cron (issue #96,
// api/cron/retry-failed-sms) and /payments's manual Resend button both act on. A test row is
// written 'skipped' rather than left NULL, so it's visibly distinct from "never attempted yet"
// (a registration with no mpesa proof submitted at all) and so the retry cron's
// `WHERE sms_status = 'failed'` query never touches it.
export async function updateSmsStatus(
  registrationId: string,
  status: SmsStatus,
): Promise<void> {
  await db.execute({
    sql: "UPDATE registrations SET sms_status = ? WHERE id = ?",
    args: [status, registrationId],
  });
}

export type ResendSmsTarget = { name: string; payerPhone: string; isTestRow: boolean };

// Only a row that's actually reached the mpesa-proof step (payer_phone IS NOT NULL) has
// anything to resend — one that hasn't gets NULL back, same "not ready yet" signal whether the
// caller is the manual Resend button or the retry cron.
export async function getResendSmsTarget(
  registrationId: string,
): Promise<ResendSmsTarget | null> {
  const result = await db.execute({
    sql: `SELECT name, payer_phone, is_test_row FROM registrations
          WHERE id = ? AND payer_phone IS NOT NULL`,
    args: [registrationId],
  });
  const row = result.rows[0];
  if (!row) return null;
  return {
    name: String(row.name),
    payerPhone: String(row.payer_phone),
    isTestRow: Number(row.is_test_row) === 1,
  };
}

export type FailedSmsRow = { id: string; name: string; payerPhone: string };

// Backs the retry cron (issue #96) — every row whose most recent send attempt failed. A test
// row is never 'failed' (confirmation.ts writes 'skipped' for those, see
// src/app/actions.ts/confirmation.ts), so this can never accidentally spend real float on one.
export async function getFailedSmsRegistrations(): Promise<FailedSmsRow[]> {
  const result = await db.execute(
    "SELECT id, name, payer_phone FROM registrations WHERE sms_status = 'failed'",
  );
  return result.rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    payerPhone: String(row.payer_phone),
  }));
}

// Idempotent, same reasoning as markCheckedIn/recordMpesaPayment: guards on paid = 0 so marking
// an already-paid row again is a silent no-op rather than clobbering the original paid_at.
export async function markPaid(registrationId: string): Promise<boolean> {
  const result = await db.execute({
    sql: `UPDATE registrations
          SET paid = 1, paid_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
          WHERE id = ? AND paid = 0`,
    args: [registrationId],
  });
  return result.rowsAffected > 0;
}

// Full rows, including next-of-kin numbers — gated behind ORGANISER_PIN at the route level
// (see src/app/api/export/registrations/route.ts), never called from anywhere public-facing.
export async function getAllRegistrations(): Promise<Record<string, unknown>[]> {
  const result = await db.execute("SELECT * FROM registrations ORDER BY created_at");
  return result.rows.map((row) => ({ ...row }));
}

// Irreversible, unlike every other mutation in this file — used for a mistaken/duplicate
// registration removed at the organiser's request (issue #98). No capacity bookkeeping needed:
// getPaidCount() sums live from `paid = 1` rows on every read, so deleting a paid row frees its
// slot(s) the instant it's gone, the same way marking one paid consumes them.
export async function deleteRegistration(registrationId: string): Promise<boolean> {
  const result = await db.execute({
    sql: "DELETE FROM registrations WHERE id = ?",
    args: [registrationId],
  });
  return result.rowsAffected > 0;
}

export async function purgeContactFields(): Promise<number> {
  const result = await db.execute(
    `UPDATE registrations
     SET next_of_kin_name = '', next_of_kin_contact = '', email = NULL
     WHERE next_of_kin_name != '' OR next_of_kin_contact != '' OR email IS NOT NULL`,
  );
  return result.rowsAffected;
}
