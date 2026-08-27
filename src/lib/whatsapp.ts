// PLACEHOLDER — no WhatsApp Business Solution Provider account exists yet (needs its own
// approval process, same friction class as the M-Pesa till — see extras/requirements.md).
// No-ops until WHATSAPP_API_TOKEN is set; the real API call is deferred until a BSP is chosen,
// so this isn't guessing at a request shape that would need rewriting anyway.
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
