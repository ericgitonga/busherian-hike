import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import { RETENTION_DAYS } from "@/lib/retention";

export const metadata: Metadata = {
  title: "Privacy Notice — Ngong Hills Hike & After Party",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-white px-4 py-12">
      <main className="w-full max-w-lg">
        <Breadcrumb
          data-testid="privacy-breadcrumb"
          items={[{ label: "Register", href: "/" }, { label: "Privacy Notice" }]}
        />
        <h1 className="text-2xl font-semibold text-zinc-900">Privacy Notice</h1>
        <div
          data-testid="privacy-content"
          className="mt-6 flex flex-col gap-4 text-sm leading-6 text-zinc-700"
        >
          <p>
            This notice covers the data collected through this site&apos;s registration form
            for the Ngong Hills Hike & After Party, 19 September 2026.
          </p>

          <section>
            <h2 className="font-semibold text-zinc-900">Data controller</h2>
            <p>
              <strong>Luchiri Omoto</strong> (Alliance High School, AHS) is the data controller
              of record for this event.{" "}
              <em>
                (Placeholder — this is provisional pending Luchiri&apos;s own confirmation; it is
                not yet finalised, and full contact details will be added here once it is.)
              </em>
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-zinc-900">What we collect, and why</h2>
            <p>
              Name, age group, school, year left, guest count, bus/after-party preferences, and
              an optional email address — collected to confirm alumni status, organise transport
              and catering, and send confirmation details. Next-of-kin name and contact are
              collected for emergency purposes only, in case something goes wrong on the hike.
            </p>
            <p className="mt-2">
              <strong>If you list a next-of-kin contact, please make sure they&apos;re okay
              being listed</strong> — this is their personal data, provided by you rather than
              by them directly, and it is only ever used to reach them in an emergency.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-zinc-900">Retention</h2>
            <p>
              Next-of-kin details and any contact information (including your email address) are
              deleted {RETENTION_DAYS} days after the event — long enough to cover a late injury
              report, no longer than that. Other registration details (name, school, year left,
              and similar) are kept only as an internal headcount record.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-zinc-900">Your rights</h2>
            <p>
              Under the Data Protection Act 2019, you can ask to see, correct, or have your data
              deleted before the retention window above. Contact the data controller above to
              exercise these rights.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
