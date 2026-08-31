import { randomUUID } from "node:crypto";

// SasaSignal (https://sasasignal.com/api) transactional SMS, wired up for real (issue #84,
// superseding the AFRICASTALKING_API_KEY placeholder — no Africa's Talking account was ever
// actually created). WhatsApp (whatsapp.ts) stays a placeholder/shelved and email (email.ts)
// stays a placeholder too; SMS no longer needs to wait on those (see SKILL.md's Payment
// confirmation section for why the three were originally kept in lockstep).
const SASASIGNAL_SEND_URL = "https://sasasignal.com/api/v1/sms/transactional/send";

// Fixed per-account value, not environment-specific — the Sender ID SasaSignal's own support
// confirmed for this account (2026-08-31, after "smsinfo" came back Failed post-acceptance —
// see issue #84), same across dev/preview/production. "SMS News" also works on this account per
// the same support response — either is fine, this one was just picked first.
export const SASASIGNAL_SENDER_ID = "SMSBiashara";

// KENYAN_PHONE_REGEX (registration.ts) accepts either "0712345678" or "+254712345678" as typed
// by a hiker. SasaSignal's docs are only explicit about the "+254xxxxxxxxx" form (airtime/buy's
// recipient_phone_number) — the transactional SMS send endpoint's expected recipient format
// isn't documented, so this normalizes to the one form SasaSignal does document rather than
// guessing the bare-0 form is also accepted. Verify against a real send if delivery fails.
export function toSasaSignalPhone(phone: string): string {
  return phone.startsWith("0") ? `+254${phone.slice(1)}` : phone;
}

export async function sendSmsConfirmation(
  phone: string,
  message: string,
): Promise<boolean> {
  const token = process.env.SASASIGNAL_API_TOKEN;
  if (!token) {
    console.log(
      `[sms:skipped] no SASASIGNAL_API_TOKEN configured — would have sent to ${phone}: ${message}`,
    );
    return false;
  }

  const body = new FormData();
  body.set("sender_id", SASASIGNAL_SENDER_ID);
  body.set("message", message);
  body.set("recipient", toSasaSignalPhone(phone));

  try {
    const response = await fetch(SASASIGNAL_SEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Required by SasaSignal's API — a fresh key per send so a retried request can't
        // double-send the same SMS.
        "Idempotency-Key": randomUUID(),
      },
      body,
    });

    const text = await response.text().catch(() => "");

    if (!response.ok) {
      console.log(
        `[sms:failed] SasaSignal responded ${response.status} sending to ${phone}: ${text}`,
      );
      return false;
    }

    // A 200 here only means SasaSignal *accepted* the send (their docs' initial status is
    // "Prequeued") — it can still fail delivery downstream (sender ID not approved, insufficient
    // float, etc.) with no error surfaced back to this call at all. Log the accepted response
    // (carries sasasignal_sms_id + sms_status) so a "no SMS arrived" report can be traced from
    // Vercel logs instead of needing a one-off diagnostic script, the way issue #84's rollout did.
    console.log(`[sms:accepted] SasaSignal accepted a send to ${phone}: ${text}`);
    return true;
  } catch (err) {
    console.log(
      `[sms:error] SasaSignal request failed sending to ${phone}: ${(err as Error).message}`,
    );
    return false;
  }
}
