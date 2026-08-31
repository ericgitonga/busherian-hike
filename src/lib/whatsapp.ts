// PLACEHOLDER, deliberately shelved for now (issue #84, 2026-08-31) — no WhatsApp Business
// Solution Provider account exists yet (needs its own approval process, same friction class as
// the M-Pesa till — see extras/requirements.md). SMS (sms.ts) was wired up for real via
// SasaSignal without waiting on this; confirmation.ts no longer calls this function at all,
// rather than leaving it in the pipeline permanently no-op'd. Revisit once a BSP is chosen —
// this isn't guessing at a request shape that would need rewriting anyway.
export async function sendWhatsAppConfirmation(
  phone: string,
  message: string,
): Promise<boolean> {
  const token = process.env.WHATSAPP_API_TOKEN;
  if (!token) {
    console.log(
      `[whatsapp:skipped] no WHATSAPP_API_TOKEN configured — would have sent to ${phone}: ${message}`,
    );
    return false;
  }
  console.log(
    `[whatsapp:skipped] WHATSAPP_API_TOKEN is set but sending isn't implemented yet — would have sent to ${phone}: ${message}`,
  );
  return false;
}
