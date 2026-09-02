import { buildConfirmationMessage } from "@/lib/confirmation-message";
import { sendEmailConfirmation } from "@/lib/email";
import { generateRegistrationQrCode } from "@/lib/qr";
import { sendSmsConfirmation } from "@/lib/sms";

export type ConfirmationInput = {
  registrationId: string;
  name: string;
  phone: string;
  email?: string;
  // When true, skips SasaSignal/Resend entirely rather than just logging the send — a test
  // registration (RegistrationForm's "this is a test registration" checkbox) should never
  // consume real SMS float, whether the submission came from a local e2e run (which carries the
  // real SASASIGNAL_API_TOKEN in .env.local, same as Preview/production) or a manual Preview
  // quality-checklist check (issue #97).
  isTestRow?: boolean;
};

export type ConfirmationResult = {
  smsSent: boolean;
  emailSent: boolean;
};

// Called by submitMpesaPayment (src/app/actions.ts) once the hiker submits their M-Pesa
// transaction code — payment is direct M-Pesa P2P now, not an IntaSend webhook (issue #70,
// superseding #7), so the phone number is whatever they typed in as their own payer number at
// that point, not something this function looks up itself.
//
// WhatsApp is shelved for now (issue #84) — sendWhatsAppConfirmation (whatsapp.ts) still exists
// as a placeholder but isn't called from here; revisit once there's a BSP account to wire it up
// for real, the same way SMS just was.
export async function sendConfirmation(
  input: ConfirmationInput,
): Promise<ConfirmationResult> {
  if (input.isTestRow) {
    console.log(
      `[confirmation:skipped-test-row] registration ${input.registrationId} is a test row — not sending real SMS/email`,
    );
    return { smsSent: false, emailSent: false };
  }

  const qrDataUrl = await generateRegistrationQrCode(input.registrationId);
  const message = buildConfirmationMessage(input.name);

  const smsSent = await sendSmsConfirmation(input.phone, message);

  const emailSent = input.email
    ? await sendEmailConfirmation(input.email, input.name, qrDataUrl)
    : false;

  return { smsSent, emailSent };
}
