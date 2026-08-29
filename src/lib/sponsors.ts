export type Sponsor = {
  name: string;
  logoSrc?: string;
  linkHref?: string;
  logoHeightClass?: string;
};

// Only confirmed sponsors go here (issue #47) — unlike PARTNERS, this list has no placeholder
// entry to swap; it grows one confirmed name at a time as each contribution actually locks in.
// Order and per-logo size are a deliberate visual call, not derived from confirmation date —
// Green Table centred and enlarged, the other two slightly reduced to balance it.
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
    name: "Eric Gitonga",
    logoSrc: "/eric-gitonga-logo.png",
    linkHref: "https://eric-gitonga-links.vercel.app/",
    logoHeightClass: "h-9",
  },
];
