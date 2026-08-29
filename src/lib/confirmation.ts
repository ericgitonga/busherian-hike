import { buildConfirmationMessage } from "@/lib/confirmation-message";
import { sendEmailConfirmation } from "@/lib/email";
import { generateRegistrationQrCode } from "@/lib/qr";
import { sendSmsConfirmation } from "@/lib/sms";
import { sendWhatsAppConfirmation } from "@/lib/whatsapp";

export type ConfirmationInput = {
  registrationId: string;
  name: string;
  phone: string;
  email?: string;
};

export type ConfirmationResult = {
  whatsappSent: boolean;
  smsSent: boolean;
  emailSent: boolean;
};

// Called by submitMpesaPayment (src/app/actions.ts) once the hiker submits their M-Pesa
// transaction code — payment is direct M-Pesa P2P now, not an IntaSend webhook (issue #70,
// superseding #7), so the phone number is whatever they typed in as their own payer number at
// that point, not something this function looks up itself.
export async function sendConfirmation(
  input: ConfirmationInput,
): Promise<ConfirmationResult> {
  const qrDataUrl = await generateRegistrationQrCode(input.registrationId);
  const message = buildConfirmationMessage(input.name);

  const [whatsappSent, smsSent] = await Promise.all([
    sendWhatsAppConfirmation(input.phone, message),
    sendSmsConfirmation(input.phone, message),
  ]);

  const emailSent = input.email
    ? await sendEmailConfirmation(input.email, input.name, qrDataUrl)
    : false;

  return { whatsappSent, smsSent, emailSent };
}
