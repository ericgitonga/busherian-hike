import Image from "next/image";
import { SPONSORS } from "@/lib/sponsors";

export default function SponsorStrip() {
  return (
    <div
      data-testid="sponsor-strip"
      className="mt-6 flex flex-col items-center gap-2 border-t border-zinc-200 pt-6"
    >
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        With thanks to
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-4">
        {SPONSORS.map((sponsor) => {
          const content = sponsor.logoSrc ? (
            <Image
              src={sponsor.logoSrc}
              alt={sponsor.name}
              width={160}
              height={160}
              className="h-10 w-auto object-contain"
            />
          ) : (
            sponsor.name
          );

          return (
            <li key={sponsor.name} className="text-sm font-semibold text-zinc-800">
              {sponsor.linkHref ? (
                <a
                  href={sponsor.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-600"
                >
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
