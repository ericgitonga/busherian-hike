// PLACEHOLDER, kept structurally identical to whatsapp.ts/sms.ts even though a real Resend
// integration (see umoja-voices' src/lib/email.ts) would be low-friction here — deliberately
// deferred so all three confirmation channels flip on together rather than email silently
// working while WhatsApp/SMS don't. No-ops until RESEND_API_KEY is set.
export async function sendEmailConfirmation(
  to: string,
  name: string,
  qrDataUrl: string,
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `[email:skipped] no RESEND_API_KEY configured — would have sent to ${to} (${name}, QR attached: ${qrDataUrl.length} bytes)`,
    );
    return false;
  }
  console.log(
    `[email:skipped] RESEND_API_KEY is set but sending isn't implemented yet — would have sent to ${to}`,
  );
  return false;
}
