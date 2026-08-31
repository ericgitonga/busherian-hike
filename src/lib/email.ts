// PLACEHOLDER, kept structurally identical to whatsapp.ts even though a real Resend integration
// (see umoja-voices' src/lib/email.ts) would be low-friction here. The "all three channels flip
// on together" reasoning this used to share with sms.ts no longer applies — SMS was wired up
// for real via SasaSignal (issue #84) without waiting on this one; email just hasn't been asked
// for yet. No-ops until RESEND_API_KEY is set.
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
