import { buildConfirmationMessage } from "@/lib/confirmation-message";
import { sendEmailConfirmation } from "@/lib/email";
import { generateRegistrationQrCode } from "@/lib/qr";
import { sendSmsConfirmation } from "@/lib/sms";

export type ConfirmationInput = {
  registrationId: string;
  name: string;
  phone: string;
  email?: string;
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
  const qrDataUrl = await generateRegistrationQrCode(input.registrationId);
  const message = buildConfirmationMessage(input.name);

  const smsSent = await sendSmsConfirmation(input.phone, message);

  const emailSent = input.email
    ? await sendEmailConfirmation(input.email, input.name, qrDataUrl)
    : false;

  return { smsSent, emailSent };
}
