# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org) (pre-1.0: MINOR = new features/user-facing
behaviour, PATCH = fixes/docs/housekeeping — see `SKILL.md`).

## [0.24.0] - 2026-08-29

### Added

- Kayjah Design Studio (https://kayjah.com/) added to the partner strip alongside Impala Club —
  logo (`public/kayjah-design-studio-logo.png`, cropped to its actual content — the original
  carried ~25% transparent vertical padding, the same issue found and fixed for
  `green-table-logo.png` in #63) + link, no additional venue-role copy (closes #68)

## [0.23.0] - 2026-08-29

### Added

- `registrations.is_test_row` column and a matching "this is a test registration" checkbox on
  `RegistrationForm`, shown only outside production (`VERCEL_ENV !== "production"`) — lets a
  manual check against a PR's live Preview mark its own submission for cleanup, the same way the
  automated e2e suite already does. `npm run db:cleanup-test-data` now deletes every
  `is_test_row = 1` row instead of matching one hardcoded fixture, so it catches ad-hoc manual
  test submissions too, while leaving every genuine row untouched (closes #66)

## [0.22.1] - 2026-08-29

### Fixed

- `e2e/run.py`'s `main()` now always runs `npm run db:cleanup-test-data` after the suite finishes,
  pass or fail — previously this only happened as a CI-only `if: always()` workflow step, so a
  local e2e run (required by SKILL.md's quality checklist) against the real shared
  Development/Preview/Production database left its test fixture rows behind unless cleaned up by
  hand. Found after 14 leftover "Wanjiru Kamau" rows accumulated in production (closes #65)

## [0.22.0] - 2026-08-29

### Added

- Eric Gitonga given the same treatment as Vecarian Plant and The Green Table: a real logo
  (`public/eric-gitonga-logo.png` — a dark card matching the `eric-gitonga-links` dark theme,
  reading "/Eric Gitonga" in an orange slash and cream Fraunces wordmark), replacing the
  name-only entry (closes #63)

### Fixed

- `public/green-table-logo.png` cropped to its actual content — the original PNG carried ~25%
  transparent padding baked into its canvas, so at the sponsor strip's shared `h-10` height it
  rendered visibly smaller than Vecarian Plant's and Eric Gitonga's edge-to-edge logos (closes
  #63)

### Changed

- Sponsor-strip logo sizing/order rebalanced: Vecarian Plant and Eric Gitonga reduced 10%
  (`h-10` → `h-9`), The Green Table enlarged 10% (`h-10` → `h-11`) and moved to the centre
  position (closes #63)

tag: `v0.22.0`

## [0.21.0] - 2026-08-28

### Added

- New `LandingHero.tsx` component, replacing the plain one-line header: the organiser's full
  promotional copy (hype opener, event renamed "Ngong Hills Hike and Socials" with AHS/AGHS
  house identity folded into supporting copy, Mbuzi/DJ Stretch/Impala Club highlights, a
  side-by-side pricing section for both ticket tiers, the slots-remaining counter, and the
  closing tagline) now sits above the registration form instead of it being the first thing on
  the page.
- `src/lib/registration.ts` gained `SHARED_TICKET_INCLUSIONS`/`HIKE_ONLY_INCLUSIONS` — the
  single source of truth for "what does this ticket get you", now referenced by both the hero's
  pricing cards and the registration success screen so the two can't drift out of sync (closes
  #56)

tag: `v0.21.0`

## [0.20.0] - 2026-08-28

### Added

- Vecarian Plant given the same treatment as Green Table: real wordmark logo
  (`public/vecarian-plant-logo.png`, sourced from vecarianplant.com) and a link to
  `https://vecarianplant.com/`, replacing the name-only entry. Renamed to their full registered
  name, "Vecarian Plant Limited", found on their site (closes #59)

tag: `v0.20.0`

## [0.19.0] - 2026-08-28

### Added

- Green Table (the pizza sponsor named in the organiser's own promotional copy) added to
  `SPONSORS` with their real logo (`public/green-table-logo.png`, sourced from
  `thegreentablepizza.com/logo.png`) and a link to `https://www.thegreentablepizza.com/`.
- `SponsorStrip.tsx`'s logo rendering switched from a fixed 120×40 box to the same
  fixed-height/auto-width, aspect-preserving one (`h-10 w-auto object-contain`) already used by
  `PartnerStrip` (#44), since Green Table's badge-shaped logo would otherwise be squished
  (closes #55)

tag: `v0.19.0`

## [0.18.0] - 2026-08-28

### Changed

- Capacity cap confirmed at 100 slots, replacing the placeholder cap of 10
  (`CAPACITY_CAP` in `src/lib/capacity.ts`) — the public "slots remaining" counter and
  `/api/capacity` pick it up automatically since they already read the constant directly
  (closes #54)

tag: `v0.18.0`

## [0.17.0] - 2026-08-28

### Changed

- Replaced the "attending after-party" checkbox with a two-way ticket-type choice — **Hike +
  Socials** or **Socials only** — both flat KES 1,500 (`PER_HIKER_FEE_KES` unchanged, no
  fee-tier logic needed since both cost the same). Superseded the previously-planned KES 2,000
  after-party surcharge (#46, closed as superseded).
- `db/schema.sql`'s `attending_after_party INTEGER` column replaced with `ticket_type TEXT`
  (`hike_and_socials` / `socials_only`, `CHECK`-constrained). Applied as a one-time `ALTER TABLE`
  directly against both the shared main database and the CI-only database (with the user's
  explicit go-ahead, since `CREATE TABLE IF NOT EXISTS` can't retroactively alter an
  already-provisioned table) — no real registration data existed yet to migrate.
- Registration success screen's fee-inclusions list is now conditional on ticket type: "Hike +
  Socials" keeps transport, park entry, a medal, and water/hydration, on top of what both tiers
  get (hot showers, pizza courtesy of Green Table, a small gift hamper, and parking at Impala
  Club); "Socials only" gets just the shared items (closes #53)

tag: `v0.17.0`

## [0.16.0] - 2026-08-28

### Added

- Fee-inclusions breakdown on the registration success screen (`RegistrationForm.tsx`): what the
  KES 1,500 hiking fee covers — transport to Ngong Hills and back, park entry fees, hot showers,
  a medal, water/hydration, and parking at Impala Club. Reads `PER_HIKER_FEE_KES` directly so it
  stays in sync if the fee changes again (closes #48)

tag: `v0.16.0`

## [0.15.0] - 2026-08-28

### Changed

- Per-hiker fee confirmed at KES 1,500, replacing the KES 1,200 placeholder
  (`PER_HIKER_FEE_KES` in `src/lib/payment.ts`) — the registration success screen picks it up
  automatically since it already reads the constant directly. `PAYMENT_LINK_URL` in the same
  file stays a dummy placeholder, unaffected, until #7 (blocked on a real IntaSend till)
  unblocks (closes #45)

tag: `v0.15.0`

## [0.14.0] - 2026-08-28

### Changed

- Venue partner confirmed as Impala Club, Ngong Road, replacing the "Royal Nairobi Golf Club"
  placeholder — `PARTNERS` now points at the club's real crest (`public/impala-club-logo.png`),
  links out to `https://www.impalaclub.co.ke/` (`PartnerStrip`/`Partner` gained the same
  `linkHref` support `SponsorStrip`/`Sponsor` already had), and the home page states its role
  (pick-up, drop-off, after-party, parking) alongside the hike date. `PartnerStrip`'s logo
  rendering switched from a fixed 120×40 box to a fixed-height, aspect-preserving one (`h-10
  w-auto object-contain`) so a square crest isn't stretched into a wordmark-shaped box (closes
  #44)

tag: `v0.14.0`

## [0.13.0] - 2026-08-28

### Added

- Confirmed-sponsors strip (`src/lib/sponsors.ts`, `SponsorStrip.tsx`) below the existing
  partner strip on the home page: Vecarian Plant (cash-sponsoring the Mbuzi/goat-roast budget)
  and Eric Gitonga (in kind, linking to his site) — deliberately separate from `PARTNERS`
  (Impala Club venue credit) and from the several approached-but-unconfirmed in-kind sponsors,
  which stay unticketed until each actually confirms (closes #47)

tag: `v0.13.0`

## [0.12.6] - 2026-08-27

### Security

- CI (`e2e.yml`) now fails the build if `ORGANISER_PIN`, `TURSO_AUTH_TOKEN`, or `CRON_SECRET`
  is found bundled into the client-shipped JavaScript (`.next/static`) — a cheap, mechanical
  guard against a future regression (an accidental `NEXT_PUBLIC_` prefix, or a server-only
  module getting imported into a Client Component) that nothing currently catches (closes #40).
  Verified against both a clean build (no false positive) and a deliberately injected leak
  (correctly detected and would fail the build).

tag: `v0.12.6`

## [0.12.5] - 2026-08-27

### Added

- Test coverage for `cron/purge-contact-fields` (closes #39) — was previously zero, unit or
  e2e. `src/app/api/cron/purge-contact-fields/route.test.ts` asserts: missing
  `Authorization` header → 401; wrong `CRON_SECRET` → 401; correct secret before the retention
  cutoff → `{purged: false, reason: "before retention cutoff"}` with `purgeContactFields` never
  called; correct secret past the cutoff → `{purged: true, count}` with `purgeContactFields`
  invoked. Runs the route handler directly with a mocked `registrations-store` module (avoids
  a real DB dependency) and `vi.setSystemTime` (avoids depending on the real 2026-09-19 event
  date, which is over a year past the retention window as of this fix).

tag: `v0.12.5`

## [0.12.4] - 2026-08-27

### Added

- `/checkin/mark` now returns `{ok: true, matched: boolean}` instead of always `{ok: true}`,
  distinguishing a real check-in from a no-op on a garbage/already-checked-in id — plus a
  minimal server-side log line (route, id, outcome; never the session token or PII) for
  post-event audit trail (closes #38)

tag: `v0.12.4`

## [0.12.3] - 2026-08-27

### Security

- CSV export (`/export`) is no longer vulnerable to formula/CSV injection (closes #29).
  `src/lib/csv.ts`'s `toCsv()` now prefixes any field beginning with `=`, `+`, `-`, `@`, tab, or
  CR with a literal `'` before RFC4180 escaping — the characters Excel and Google Sheets treat
  as the start of a formula on CSV import — so an attacker-controlled registrant `name` like
  `=HYPERLINK(...)` renders as inert text instead of executing when a committee member opens the
  export.

tag: `v0.12.3`

## [0.12.2] - 2026-08-27

### Security

- CI now runs against its own dedicated Turso database instead of production (closes #28). A
  second Turso database (`busherian-hike-ci`) was provisioned through the same Vercel
  Marketplace Turso integration, connected only to the unused `development` Vercel environment
  so it's fully decoupled from Preview/Production. `e2e.yml` no longer runs `vercel env pull` or
  needs `VERCEL_TOKEN` at all — it writes `.env.local` directly from four repository secrets
  (`TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` pointing at the CI database, `ORGANISER_PIN`/
  `CRON_SECRET` unchanged). A CI job can no longer read, write, or lose a single row of real
  registrant PII, regardless of any future supply-chain compromise in the dependency tree.

tag: `v0.12.2`

## [0.12.1] - 2026-08-27

### Security

- CI (`e2e.yml`, `unit.yml`) now runs `npm ci --ignore-scripts` — blocks a
  compromised/typosquatted transitive dependency's `postinstall` hook from running arbitrary
  code on a runner that later holds real `TURSO_AUTH_TOKEN`/`VERCEL_TOKEN` (part of #28; the
  short-term mitigation, not the full fix — CI still runs against the production database,
  since a genuinely separate CI/E2E Turso database is a real infra-provisioning decision left
  open in #28). Verified no dependency this project's build/test/e2e path needs relies on an
  install-time script.

tag: `v0.12.1`

## [0.12.0] - 2026-08-27

### Changed

- `/checkin` no longer persists the raw `ORGANISER_PIN` in `localStorage` indefinitely (closes
  #27). A correct PIN now sets a short-lived (4-hour), httpOnly, `SameSite=Strict`
  `checkin_session` cookie instead (`src/lib/auth.ts` — stateless, HMAC-signed, keyed on
  `ORGANISER_PIN` so rotating the PIN invalidates all outstanding sessions); `localStorage` only
  holds a non-secret "was this device unlocked" boolean now. `/checkin/mark` is authorized by
  that cookie alone (no PIN in its body at all), which also removes the need for any rate
  limiting on that route — there's nothing left to brute-force there. Added a `POST
  /api/checkin/lock` endpoint plus a **Lock** button to explicitly clear a device's session
  before its natural expiry.

### Security

- Same change as above, from a security angle: closes the "PIN cached forever in plaintext,
  readable via DevTools, retained indefinitely by any borrowed/shared device" gap from the
  adversarial audit (finding H1).

tag: `v0.12.0`

## [0.11.0] - 2026-08-27

### Added

- Rate limiting on PIN-gated routes (`/checkin/verify-pin`, `/checkin/mark`,
  `/export/registrations`) and public registration (`registerHiker`) — closes the brute-force
  volume gap left after v0.10.1's timing-safe comparison fix (closes #26). New `src/lib/
  rate-limit.ts` and `rate_limits` table (Turso-backed, no separate KV/Redis). PIN routes only
  consume the limit on a *wrong* PIN (5 per 15 minutes, per route+IP) so real high-frequency
  check-in-scanner traffic is never throttled; registration consumes on every submission
  (5 per hour per IP), since there's no correct/incorrect distinction there.

tag: `v0.11.0`

## [0.10.1] - 2026-08-27

### Security

- Replaced the `!==` comparison of `ORGANISER_PIN`/`CRON_SECRET` against submitted values
  (`/checkin/verify-pin`, `/checkin/mark`, `/export/registrations`,
  `/cron/purge-contact-fields`) with a constant-time comparison (`crypto.timingSafeEqual` via a
  new `src/lib/auth.ts`), closing a timing-attack side channel that let response latency leak
  how many leading characters of a guess were correct (closes #24)

tag: `v0.10.1`

## [0.10.0] - 2026-08-27

### Added

- `/export`: PIN-gated (same `ORGANISER_PIN` as `/checkin`) full-dataset CSV download,
  including next-of-kin numbers — "only Luchiri and named committee members" from the brief
  (closes #11)

tag: `v0.10.0`

## [0.9.0] - 2026-08-27

### Added

- Organiser check-in page (`/checkin`): offline-capable QR scanning against the paid-attendee
  list (html5-qrcode, service-worker-cached shell, localStorage-cached data and pending-sync
  queue), PIN-gated (`ORGANISER_PIN`, shared secret — not in the original issue text, added
  deliberately since the page otherwise had zero protection) (closes #10)

tag: `v0.9.0`

## [0.8.0] - 2026-08-27

### Added

- Privacy notice (`/privacy`) naming Luchiri Omoto as data controller of record (placeholder,
  pending his confirmation), linked from the home page and from a next-of-kin consent hint on
  the registration form
- Daily Vercel Cron job (`GET /api/cron/purge-contact-fields`) that empties next-of-kin and
  contact fields 30 days after the event (placeholder retention window), secured by
  `CRON_SECRET` (closes #9)

tag: `v0.8.0`

## [0.7.0] - 2026-08-27

### Added

- Payment-confirmation pipeline (`src/lib/confirmation.ts`): QR code generation, shared
  message text, and WhatsApp/SMS/email sending — each provider a placeholder that no-ops until
  its own credentials are configured. Not wired to a trigger yet (that's issue #7); standalone
  and unit-tested for #7 to call once it exists (closes #8)

tag: `v0.7.0`

## [0.6.0] - 2026-08-27

### Added

- IntaSend Payment Link CTA on the registration success screen (KES 1,200 per hiker,
  placeholder) — non-functional until the real till passes IntaSend's business-registration
  checks (closes #6)

tag: `v0.6.0`

## [0.5.0] - 2026-08-27

### Added

- Static partner-logo strip on the home page showing the placeholder partner ("Royal Nairobi
  Golf Club"), no CMS — a single swappable array (closes #5)

tag: `v0.5.0`

## [0.4.0] - 2026-08-27

### Added

- Public "slots remaining" counter on the home page, backed by a `GET /api/capacity` endpoint
  that exposes a count only, never underlying rows, per the brief
- Hard capacity cap of 10 hikers (placeholder, `src/lib/capacity.ts`), counted against paid
  registrations only; `registerHiker` now refuses new registrations once slots run out
  (closes #4)

tag: `v0.4.0`

## [0.3.0] - 2026-08-27

### Added

- Registrations data store: one Turso (serverless SQLite) table holding every registration
  field plus payment/check-in state, provisioned via the Vercel Marketplace integration; the
  registration form now actually persists submissions instead of only validating them
  (closes #3)

tag: `v0.3.0`

## [0.2.0] - 2026-08-27

### Added

- Registration form on the home page capturing all brief fields — name, age group, school,
  year left, guest count, next-of-kin name+contact, bus toggle, after-party toggle, and an
  optional email address — with client- and server-side validation via Zod (closes #2)

tag: `v0.2.0`

## [0.1.1] - 2026-08-27

### Added

- Documented the live production URL in README, now that Vercel is connected and deployed
  (closes #13)

tag: `v0.1.1`

## [0.1.0] - 2026-08-27

### Added

- Initial project scaffold: repo, branch protection, CI (e2e gate on every PR), versioning and
  issue-first workflow (closes #1)

tag: `v0.1.0`
