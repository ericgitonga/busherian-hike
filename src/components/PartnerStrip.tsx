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
        {PARTNERS.map((partner) => {
          const content = partner.logoSrc ? (
            <Image
              src={partner.logoSrc}
              alt={partner.name}
              width={160}
              height={160}
              className="h-10 w-auto object-contain"
            />
          ) : (
            partner.name
          );

          return (
            <li key={partner.name} className="text-sm font-semibold text-zinc-800">
              {partner.linkHref ? (
                <a href={partner.linkHref} target="_blank" rel="noopener noreferrer">
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
