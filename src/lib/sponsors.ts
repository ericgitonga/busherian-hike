export type Sponsor = { name: string; logoSrc?: string; linkHref?: string };

// Only confirmed sponsors go here (issue #47) — unlike PARTNERS, this list has no placeholder
// entry to swap; it grows one confirmed name at a time as each contribution actually locks in.
export const SPONSORS: Sponsor[] = [
  {
    name: "Vecarian Plant Limited",
    logoSrc: "/vecarian-plant-logo.png",
    linkHref: "https://vecarianplant.com/",
  },
  { name: "Eric Gitonga", linkHref: "https://eric-gitonga-links.vercel.app/" },
  {
    name: "The Green Table",
    logoSrc: "/green-table-logo.png",
    linkHref: "https://www.thegreentablepizza.com/",
  },
];
