// PLACEHOLDER — no SMS provider account exists yet. Africa's Talking needs its own SMS
// sender-ID business registration, same friction class as the M-Pesa till (see
// extras/requirements.md). No-ops until AFRICASTALKING_API_KEY is set; the real API call is
// deferred until that account exists, so this isn't guessing at a request shape that would
// need rewriting anyway.
export async function sendSmsConfirmation(
  phone: string,
  message: string,
): Promise<boolean> {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  if (!apiKey) {
    console.log(
      `[sms:skipped] no AFRICASTALKING_API_KEY configured — would have sent to ${phone}: ${message}`,
    );
    return false;
  }
  console.log(
    `[sms:skipped] AFRICASTALKING_API_KEY is set but sending isn't implemented yet — would have sent to ${phone}: ${message}`,
  );
  return false;
}
