"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { registerHiker, submitMpesaPayment } from "@/app/actions";
import {
  AGE_GROUP_OPTIONS,
  HIKE_ONLY_INCLUSIONS,
  MEDIA_CONSENT_VALUES,
  SCHOOL_OPTIONS,
  SHARED_TICKET_INCLUSIONS,
  TICKET_TYPE_OPTIONS,
  type RegistrationFieldErrors,
} from "@/lib/registration";
import type { MpesaPaymentFieldErrors } from "@/lib/mpesa-payment";
import {
  MPESA_RECIPIENT_NAME,
  MPESA_RECIPIENT_PHONE,
  PER_HIKER_FEE_KES,
  totalFeeKes,
} from "@/lib/payment";

const initialMpesaValues = { payerPhone: "", mpesaCode: "" };

const initialValues = {
  name: "",
  ageGroup: "",
  school: "",
  yearLeft: "",
  guestCount: "0",
  nextOfKinName: "",
  nextOfKinContact: "",
  needsBus: false,
  ticketType: "hike_and_socials" as (typeof TICKET_TYPE_OPTIONS)[number]["value"],
  email: "",
  termsAccepted: false,
  mediaConsent: "" as "" | (typeof MEDIA_CONSENT_VALUES)[number],
  isTestRow: false,
};

type FieldName = keyof typeof initialValues;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-zinc-900">
      {label}
      {children}
      {error && (
        <span className="text-xs font-normal text-red-600" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

const inputClass =
  "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-normal text-zinc-900 focus:border-zinc-500 focus:outline-none";

export default function RegistrationForm({
  isTestEnvironment,
}: {
  isTestEnvironment: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RegistrationFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [full, setFull] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const [mpesaValues, setMpesaValues] = useState(initialMpesaValues);
  const [mpesaErrors, setMpesaErrors] = useState<MpesaPaymentFieldErrors>({});
  const [mpesaSubmitting, setMpesaSubmitting] = useState(false);
  const [mpesaRateLimited, setMpesaRateLimited] = useState(false);
  const [mpesaGenericError, setMpesaGenericError] = useState(false);

  function update<K extends FieldName>(field: K, value: (typeof initialValues)[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function updateMpesa<K extends keyof typeof initialMpesaValues>(
    field: K,
    value: (typeof initialMpesaValues)[K],
  ) {
    setMpesaValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const result = await registerHiker({
      ...values,
      yearLeft: values.yearLeft,
      guestCount: values.guestCount,
      email: values.email,
    });

    setSubmitting(false);

    if (!result.success) {
      if (result.reason === "full") {
        setFull(true);
      } else if (result.reason === "rate_limited") {
        setRateLimited(true);
      } else {
        setErrors(result.errors);
      }
      return;
    }

    setRegistrationId(result.id);
    setSubmitted(true);
  }

  async function handleMpesaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!registrationId) return;

    setMpesaSubmitting(true);
    setMpesaErrors({});
    setMpesaGenericError(false);

    const result = await submitMpesaPayment({
      registrationId,
      payerPhone: mpesaValues.payerPhone,
      mpesaCode: mpesaValues.mpesaCode,
    });

    setMpesaSubmitting(false);

    if (!result.success) {
      if (result.reason === "rate_limited") {
        setMpesaRateLimited(true);
      } else if (result.reason === "validation") {
        setMpesaErrors(result.errors);
      } else {
        setMpesaGenericError(true);
      }
      return;
    }

    router.push("/confirmation");
  }

  if (full) {
    return (
      <div
        data-testid="registration-full"
        className="rounded-md border border-amber-200 bg-amber-50 px-4 py-6 text-center text-amber-900"
      >
        <p className="font-semibold">Sorry, we&apos;re fully booked.</p>
        <p className="mt-1 text-sm">
          All slots for the hike have been claimed.
        </p>
      </div>
    );
  }

  if (rateLimited) {
    return (
      <div
        data-testid="registration-rate-limited"
        className="rounded-md border border-amber-200 bg-amber-50 px-4 py-6 text-center text-amber-900"
      >
        <p className="font-semibold">Too many attempts.</p>
        <p className="mt-1 text-sm">Please wait a bit and try again.</p>
      </div>
    );
  }

  const guestCount = Number(values.guestCount) || 0;
  const totalFee = totalFeeKes(guestCount);

  return (
    <>
      <form
        data-testid="registration-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* display: contents keeps the parent's flex/gap layout — locking the fields via a
            fieldset shouldn't introduce an extra box. */}
        <fieldset disabled={submitted} className="contents">
          <Field label="Full name" error={errors.name}>
            <input
              data-testid="field-name"
              className={inputClass}
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>

          <Field label="Age group" error={errors.ageGroup}>
            <select
              data-testid="field-ageGroup"
              className={inputClass}
              value={values.ageGroup}
              onChange={(e) => update("ageGroup", e.target.value)}
            >
              <option value="">Select…</option>
              {AGE_GROUP_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="School" error={errors.school}>
            <select
              data-testid="field-school"
              className={inputClass}
              value={values.school}
              onChange={(e) => update("school", e.target.value)}
            >
              <option value="">Select…</option>
              {SCHOOL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Year left" error={errors.yearLeft}>
            <input
              data-testid="field-yearLeft"
              className={inputClass}
              inputMode="numeric"
              value={values.yearLeft}
              onChange={(e) => update("yearLeft", e.target.value)}
            />
          </Field>

          <Field label="Number of guests" error={errors.guestCount}>
            <input
              data-testid="field-guestCount"
              className={inputClass}
              inputMode="numeric"
              value={values.guestCount}
              onChange={(e) => update("guestCount", e.target.value)}
            />
          </Field>

          <Field label="Next-of-kin name" error={errors.nextOfKinName}>
            <input
              data-testid="field-nextOfKinName"
              className={inputClass}
              value={values.nextOfKinName}
              onChange={(e) => update("nextOfKinName", e.target.value)}
            />
          </Field>

          <Field label="Next-of-kin contact" error={errors.nextOfKinContact}>
            <input
              data-testid="field-nextOfKinContact"
              className={inputClass}
              placeholder="0712345678"
              value={values.nextOfKinContact}
              onChange={(e) => update("nextOfKinContact", e.target.value)}
            />
          </Field>
          <p data-testid="next-of-kin-hint" className="-mt-2 text-xs text-zinc-500">
            Emergency contact only — please confirm they&apos;re okay being listed. See our{" "}
            <Link
              href="/privacy"
              data-testid="next-of-kin-privacy-link"
              className="underline hover:text-zinc-700"
            >
              Privacy Notice
            </Link>
            .
          </p>

          <label className="flex items-center gap-2 text-sm font-medium text-zinc-900">
            <input
              data-testid="field-needsBus"
              type="checkbox"
              checked={values.needsBus}
              onChange={(e) => update("needsBus", e.target.checked)}
            />
            I need a seat on the bus
          </label>

          <fieldset
            data-testid="field-ticketType"
            className="flex flex-col gap-1 text-sm font-medium text-zinc-900"
          >
            <legend className="mb-1">Ticket type — KES {PER_HIKER_FEE_KES} either way</legend>
            {TICKET_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 font-normal">
                <input
                  data-testid={`ticket-type-${option.value}`}
                  type="radio"
                  name="ticketType"
                  value={option.value}
                  checked={values.ticketType === option.value}
                  onChange={() => update("ticketType", option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>

          <Field label="Email (optional)" error={errors.email}>
            <input
              data-testid="field-email"
              className={inputClass}
              type="email"
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-2 border-t border-zinc-200 pt-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Acknowledgement and Declaration
            </h2>
            <label className="flex items-start gap-2 text-sm font-normal text-zinc-900">
              <input
                data-testid="field-termsAccepted"
                type="checkbox"
                className="mt-0.5"
                checked={values.termsAccepted}
                onChange={(e) => update("termsAccepted", e.target.checked)}
              />
              <span>
                I have read and agree to the{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="underline hover:text-zinc-700"
                >
                  Terms and Conditions, Participant Waiver and Data Protection Notice
                </Link>
                .
              </span>
            </label>
            {errors.termsAccepted && (
              <span className="text-xs font-normal text-red-600" role="alert">
                {errors.termsAccepted}
              </span>
            )}
          </div>

          <fieldset
            data-testid="field-mediaConsent"
            className="flex flex-col gap-1 text-sm font-medium text-zinc-900"
          >
            <legend className="mb-1">Photograph and Media Consent</legend>
            <p className="mb-1 text-xs font-normal text-zinc-500">
              Please select one. Declining does not prevent you from taking part.
            </p>
            <label className="flex items-start gap-2 font-normal">
              <input
                data-testid="media-consent-yes"
                type="radio"
                name="mediaConsent"
                value="yes"
                className="mt-0.5"
                checked={values.mediaConsent === "yes"}
                onChange={() => update("mediaConsent", "yes")}
              />
              <span>
                <strong>Yes — I consent.</strong> I expressly consent to the Organiser using
                photographs, video recordings and/or audio recordings in which I am identifiable
                for the promotional and communications purposes described in the Terms &amp;
                Conditions.
              </span>
            </label>
            <label className="flex items-start gap-2 font-normal">
              <input
                data-testid="media-consent-no"
                type="radio"
                name="mediaConsent"
                value="no"
                className="mt-0.5"
                checked={values.mediaConsent === "no"}
                onChange={() => update("mediaConsent", "no")}
              />
              <span>
                <strong>No — I do not consent.</strong> I do not consent to the use of
                identifiable photographs, video recordings or audio recordings of me for
                promotional or marketing purposes.
              </span>
            </label>
            {errors.mediaConsent && (
              <span className="text-xs font-normal text-red-600" role="alert">
                {errors.mediaConsent}
              </span>
            )}
          </fieldset>

          {isTestEnvironment && (
            <label className="flex items-center gap-2 text-sm font-medium text-amber-700">
              <input
                data-testid="field-isTestRow"
                type="checkbox"
                checked={values.isTestRow}
                onChange={(e) => update("isTestRow", e.target.checked)}
              />
              This is a test registration (auto-removed by cleanup, not a real signup)
            </label>
          )}

          <button
            data-testid="submit-registration"
            type="submit"
            disabled={submitting || submitted}
            className="mt-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50"
          >
            {submitted ? "Registered" : submitting ? "Submitting…" : "Register"}
          </button>
        </fieldset>
      </form>

      {submitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div
            data-testid="registration-success"
            role="dialog"
            aria-modal="true"
            aria-label="Complete your payment"
            className="max-h-full w-full max-w-md overflow-y-auto rounded-md border border-green-200 bg-green-50 px-4 py-6 text-center text-green-900 shadow-xl"
          >
            <p className="font-semibold">You&apos;re registered!</p>
            <p className="mt-1 text-sm">
              Send KES {totalFee} via M-Pesa to {MPESA_RECIPIENT_PHONE} (
              {MPESA_RECIPIENT_NAME}) to confirm your spot
              {guestCount > 0
                ? ` for you and ${guestCount} guest${guestCount === 1 ? "" : "s"}`
                : ""}
              .
            </p>
            <div data-testid="fee-inclusions" className="mt-4 text-left text-xs text-green-800">
              <p className="font-medium">
                Your KES {totalFee} ({PER_HIKER_FEE_KES} × {1 + guestCount}) covers:
              </p>
              <ul className="mt-1 list-inside list-disc">
                {values.ticketType === "hike_and_socials" &&
                  HIKE_ONLY_INCLUSIONS.map((item) => <li key={item}>{item}</li>)}
                {SHARED_TICKET_INCLUSIONS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <form
              data-testid="mpesa-payment-form"
              onSubmit={handleMpesaSubmit}
              className="mt-4 flex flex-col gap-3 text-left"
              noValidate
            >
              <p className="text-xs font-medium text-green-900">
                Already sent it? Enter the number you paid from and the M-Pesa transaction code
                from the confirmation SMS.
              </p>
              <Field label="Your M-Pesa phone number" error={mpesaErrors.payerPhone}>
                <input
                  data-testid="field-payerPhone"
                  className={inputClass}
                  placeholder="0712345678"
                  value={mpesaValues.payerPhone}
                  onChange={(e) => updateMpesa("payerPhone", e.target.value)}
                />
              </Field>
              <Field label="M-Pesa transaction code" error={mpesaErrors.mpesaCode}>
                <input
                  data-testid="field-mpesaCode"
                  className={inputClass}
                  value={mpesaValues.mpesaCode}
                  onChange={(e) => updateMpesa("mpesaCode", e.target.value)}
                />
              </Field>
              {mpesaRateLimited && (
                <p
                  data-testid="mpesa-rate-limited"
                  className="text-xs font-normal text-red-600"
                  role="alert"
                >
                  Too many attempts. Please wait a bit and try again.
                </p>
              )}
              {mpesaGenericError && (
                <p className="text-xs font-normal text-red-600" role="alert">
                  Something went wrong — please try again, or contact the organiser directly.
                </p>
              )}
              <button
                data-testid="submit-mpesa-payment"
                type="submit"
                disabled={mpesaSubmitting}
                className="rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50"
              >
                {mpesaSubmitting ? "Submitting…" : "Submit payment proof"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
