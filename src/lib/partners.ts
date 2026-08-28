export type Partner = { name: string; logoSrc?: string; linkHref?: string };

// Confirmed (extras/requirements.md) — Impala Club, Ngong Road: pick-up, drop-off, after-party,
// and parking. Logo is the club's own crest (see public/impala-club-logo.png).
export const PARTNERS: Partner[] = [
  {
    name: "Impala Club",
    logoSrc: "/impala-club-logo.png",
    linkHref: "https://www.impalaclub.co.ke/",
  },
];
