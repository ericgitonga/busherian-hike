export type Sponsor = {
  name: string;
  logoSrc?: string;
  linkHref?: string;
  logoHeightClass?: string;
  // Tailwind grid-column-start override for SponsorStrip's 3-column grid — only needed to pull
  // an item onto its own row at a specific column, since grid auto-placement alone can't express
  // "centred under the row above" (same reasoning as en-mascaradores' mascot grid: left/right
  // items need an explicit col-start, only the auto-flowing ones can rely on placement order).
  gridColStart?: string;
};

// Only confirmed sponsors go here (issue #47) — unlike PARTNERS, this list has no placeholder
// entry to swap; it grows one confirmed name at a time as each contribution actually locks in.
// Order and per-logo size are a deliberate visual call, not derived from confirmation date —
// Green Table centred and enlarged in row 1; Vecarian Plant and Kayjah flank it, both reduced to
// balance it (issue #68 — Kayjah took the row-1 slot Eric Gitonga previously held, near-identical
// logo aspect ratio, ~4.7:1 either way); Eric Gitonga moved to its own row 2, centred under Green
// Table via gridColStart.
export const SPONSORS: Sponsor[] = [
  {
    name: "Vecarian Plant Limited",
    logoSrc: "/vecarian-plant-logo.png",
    linkHref: "https://vecarianplant.com/",
    logoHeightClass: "h-9",
  },
  {
    name: "The Green Table",
    logoSrc: "/green-table-logo.png",
    linkHref: "https://www.thegreentablepizza.com/",
    logoHeightClass: "h-11",
  },
  {
    name: "Kayjah Design Studio",
    logoSrc: "/kayjah-design-studio-logo.png",
    linkHref: "https://kayjah.com/",
    logoHeightClass: "h-9",
  },
  {
    name: "Eric Gitonga",
    logoSrc: "/eric-gitonga-logo.png",
    linkHref: "https://eric-gitonga-links.vercel.app/",
    logoHeightClass: "h-9",
    gridColStart: "col-start-2",
  },
];
