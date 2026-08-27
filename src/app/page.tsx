import RegistrationForm from "@/components/RegistrationForm";
import SlotsRemaining from "@/components/SlotsRemaining";
import { CAPACITY_CAP } from "@/lib/capacity";
import { getSlotsRemaining } from "@/lib/registrations-store";

// Without this, Next.js would prerender the slots-remaining count once at build time and
// serve that stale number forever — this page must re-query on every request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const remaining = await getSlotsRemaining();

  return (
    <div className="flex flex-1 flex-col items-center bg-white px-4 py-12">
      <main className="w-full max-w-lg">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">
            AHS/AGHS Alumni Hike
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Ngong Hills, Main Gate to Kona Baridi — 19 September 2026
          </p>
          <SlotsRemaining remaining={remaining} cap={CAPACITY_CAP} />
        </header>
        <RegistrationForm />
      </main>
    </div>
  );
}
