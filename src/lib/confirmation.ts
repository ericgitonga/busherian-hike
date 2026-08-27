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

// Called by the payment webhook (issue #7, not built yet) once it has the payer's phone number
// from IntaSend's webhook payload — that number doesn't exist anywhere in this app until then
// (the registration form itself never collects it, per the brief), so it's a required
// parameter here rather than something this function looks up itself.
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
