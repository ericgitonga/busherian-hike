"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { registerHiker } from "@/app/actions";
import {
  AGE_GROUP_OPTIONS,
  HIKE_ONLY_INCLUSIONS,
  SCHOOL_OPTIONS,
  SHARED_TICKET_INCLUSIONS,
  TICKET_TYPE_OPTIONS,
  type RegistrationFieldErrors,
} from "@/lib/registration";
import { PAYMENT_LINK_URL, PER_HIKER_FEE_KES } from "@/lib/payment";

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

export default function RegistrationForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<RegistrationFieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [full, setFull] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  function update<K extends FieldName>(field: K, value: (typeof initialValues)[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
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

    setSubmitted(true);
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

  if (submitted) {
    return (
      <div
        data-testid="registration-success"
        className="rounded-md border border-green-200 bg-green-50 px-4 py-6 text-center text-green-900"
      >
        <p className="font-semibold">You&apos;re registered!</p>
        <p className="mt-1 text-sm">
          Pay KES {PER_HIKER_FEE_KES} via IntaSend to confirm your spot.
        </p>
        <a
          data-testid="payment-link"
          href={PAYMENT_LINK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838]"
        >
          Pay KES {PER_HIKER_FEE_KES}
        </a>
        <div data-testid="fee-inclusions" className="mt-4 text-left text-xs text-green-800">
          <p className="font-medium">Your KES {PER_HIKER_FEE_KES} covers:</p>
          <ul className="mt-1 list-inside list-disc">
            {values.ticketType === "hike_and_socials" &&
              HIKE_ONLY_INCLUSIONS.map((item) => <li key={item}>{item}</li>)}
            {SHARED_TICKET_INCLUSIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-xs text-green-800">
          Confirmation details are coming soon — hold tight.
        </p>
      </div>
    );
  }

  return (
    <form
      data-testid="registration-form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      noValidate
    >
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
        <Link href="/privacy" className="underline hover:text-zinc-700">
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

      <button
        data-testid="submit-registration"
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Register"}
      </button>
    </form>
  );
}
