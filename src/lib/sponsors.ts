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

// Only confirmed sponsors go here (issue #47) — no placeholder entry to swap; it grows one
// confirmed name at a time as each contribution actually locks in.
// Order and per-logo size are a deliberate visual call, not derived from confirmation date —
// Green Table centred and enlarged in row 1; Vecarian Plant and Kayjah flank it, both reduced to
// balance it (issue #68 — Kayjah took the row-1 slot Eric Gitonga previously held, near-identical
// logo aspect ratio, ~4.7:1 either way). Row 2 (Eric Gitonga, Impala Club — moved here from the
// now-removed partner strip, issue #74 — and ZBOM) is a full row of three, so it relies on plain
// auto-placement, no gridColStart needed: only a partial row needs the explicit left/right
// col-start override, same reasoning as en-mascaradores' mascot grid. ZBOM has no linkHref yet
// (issue #75) — SponsorStrip renders it as a plain, non-clickable logo until one is confirmed.
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
  },
  {
    name: "Impala Club",
    logoSrc: "/impala-club-logo.png",
    linkHref: "https://www.impalaclub.co.ke/",
  },
  {
    name: "ZBOM",
    logoSrc: "/zbom-logo.png",
  },
];
