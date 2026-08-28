import SlotsRemaining from "@/components/SlotsRemaining";
import { CAPACITY_CAP } from "@/lib/capacity";
import { PER_HIKER_FEE_KES } from "@/lib/payment";
import {
  HIKE_ONLY_INCLUSIONS,
  SHARED_TICKET_INCLUSIONS,
  TICKET_TYPE_OPTIONS,
} from "@/lib/registration";

export default function LandingHero({ remaining }: { remaining: number }) {
  return (
    <header className="mb-8 text-center">
      <p
        data-testid="hero-tagline"
        className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-800 uppercase"
      >
        Watu!! Msimalize Mshahara ya August.
      </p>

      <h1 className="text-2xl font-semibold text-zinc-900">
        Ngong Hills Hike and Socials
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Hosted by Aggrey &amp; Stevenson houses — 19 September 2026
      </p>

      <ul
        data-testid="hero-highlights"
        className="mx-auto mt-4 flex max-w-sm flex-col gap-1 text-left text-sm text-zinc-700"
      >
        <li>🐐 We have a Mbuzi</li>
        <li>🎧 We have the DJ — Old Boy DJ Stretch, on the decks for the after-party</li>
        <li data-testid="venue-info">
          🚐 Pick-up, drop-off, secure parking, and hot showers — all at Impala Club, Ngong
          Road, our after-party venue
        </li>
      </ul>

      <div className="mt-6">
        <p className="text-sm font-semibold text-zinc-900">
          Best part is… the damage.
        </p>
        <div
          data-testid="hero-pricing"
          className="mx-auto mt-3 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          {TICKET_TYPE_OPTIONS.map((option) => (
            <div
              key={option.value}
              data-testid={`pricing-card-${option.value}`}
              className="flex-1 rounded-md border border-zinc-200 p-4 text-left"
            >
              <p className="text-sm font-semibold text-zinc-900">{option.label}</p>
              <p className="mt-1 text-lg font-bold text-zinc-900">
                KES {PER_HIKER_FEE_KES}
              </p>
              <ul className="mt-2 list-inside list-disc text-xs text-zinc-600">
                {option.value === "hike_and_socials" &&
                  HIKE_ONLY_INCLUSIONS.map((item) => <li key={item}>{item}</li>)}
                {SHARED_TICKET_INCLUSIONS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <SlotsRemaining remaining={remaining} cap={CAPACITY_CAP} />

      <p data-testid="hero-closing-tagline" className="mt-4 text-xs text-zinc-500 italic">
        An ACR, Jointea and Socials FRFR event!
      </p>
    </header>
  );
}
