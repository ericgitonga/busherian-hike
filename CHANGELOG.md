# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org) (pre-1.0: MINOR = new features/user-facing
behaviour, PATCH = fixes/docs/housekeeping — see `SKILL.md`).

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
