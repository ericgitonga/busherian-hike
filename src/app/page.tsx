import Link from "next/link";
import LandingHero from "@/components/LandingHero";
import PartnerStrip from "@/components/PartnerStrip";
import RegistrationForm from "@/components/RegistrationForm";
import SponsorStrip from "@/components/SponsorStrip";
import { getSlotsRemaining } from "@/lib/registrations-store";

// Without this, Next.js would prerender the slots-remaining count once at build time and
// serve that stale number forever — this page must re-query on every request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const remaining = await getSlotsRemaining();
  // VERCEL_ENV is unset outside Vercel (local dev, CI) — treated as non-production too, so the
  // toggle is available everywhere real hikers aren't (issue #66).
  const isTestEnvironment = process.env.VERCEL_ENV !== "production";

  return (
    <div className="flex flex-1 flex-col items-center bg-white px-4 py-12">
      <main className="w-full max-w-lg">
        <LandingHero remaining={remaining} />
        <RegistrationForm isTestEnvironment={isTestEnvironment} />
        <PartnerStrip />
        <SponsorStrip />
        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link
            href="/privacy"
            data-testid="privacy-link"
            className="underline hover:text-zinc-700"
          >
            Privacy Notice
          </Link>
        </p>
      </main>
    </div>
  );
}
