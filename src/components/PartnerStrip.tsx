import Image from "next/image";
import { PARTNERS } from "@/lib/partners";

export default function PartnerStrip() {
  return (
    <div
      data-testid="partner-strip"
      className="mt-10 flex flex-col items-center gap-2 border-t border-zinc-200 pt-6"
    >
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        In partnership with
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-4">
        {PARTNERS.map((partner) => (
          <li key={partner.name} className="text-sm font-semibold text-zinc-800">
            {partner.logoSrc ? (
              <Image
                src={partner.logoSrc}
                alt={partner.name}
                width={120}
                height={40}
              />
            ) : (
              partner.name
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
