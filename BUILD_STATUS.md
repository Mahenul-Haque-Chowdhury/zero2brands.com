# Zero2Brands — Build Status

Autonomous build session summary. Read alongside `OWNER_TASKS.md` (running
checklist of everything only the business owner can do) and
`QUESTIONS_FOR_OWNER.md` (decisions defaulted per the plan's own
recommendations, flagged for review).

## What was built

All 17 phases of `zero2brands-build-plan-v2.md` have working code behind
them. This is not a skeleton — the database schema and RLS policies were
validated against a real local Postgres instance (via the Supabase CLI +
Docker) multiple times during the build, not just written; every migration
applies cleanly, the seed data loads, and a 14-test RLS integration suite
plus the plan's own 5 guard/check SQL queries all pass. The app builds
clean (68 routes, zero TypeScript errors, zero ESLint errors) and a
client-bundle secret audit confirms no server credential ever reaches the
browser.

### Phase 1 — Scaffold
Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, all
installed at latest with no version pins. Full folder structure per the
plan's spec. shadcn/ui initialized (this project's shadcn build uses Base
UI primitives rather than Radix — noted throughout since a few component
APIs differ, e.g. `render` prop instead of `asChild`, `multiple` instead
of `type`/`collapsible` on Accordion). Zod env validation split into
`lib/env.ts` (server-only, guarded) and `lib/env.client.ts` (public vars
only) — this split exists because the first version leaked the *server*
schema's field-name strings into a client chunk; fixed and verified.

### Phase 2 — Database schema and RLS
`supabase/migrations/0001_schema.sql` was written from scratch to satisfy
every table/enum/trigger/function `0002_rls_policies.sql` (which existed
before this session and was treated as locked/correct) references. Found
and fixed a real bug while validating: the `update_course_totals` trigger
was originally row-level and wrote back into the table it fired on,
causing a stack-depth overflow on any bulk insert — converted to a
statement-level trigger with transition tables and a `pg_trigger_depth()`
guard. `0003_indexes.sql` per the plan's index list. `supabase/seed.sql`
with the exact seed spec (1 course, 3 modules, 6 lessons, 1 batch with 3
sessions, 1 admin + 3 students with varied visibility, 5 FAQs).
`src/types/database.ts` was generated from the validated local schema, not
hand-written.

### Phase 3 — Authentication
Three Supabase client factories (browser/server/admin), middleware (built
as `src/proxy.ts` — Next 16 deprecated the `middleware.ts` file
convention mid-build and the codemod was run to migrate), email/password
signup+login with BD phone normalization and rate limiting, Google OAuth
with open-redirect protection, forgot/reset password, onboarding for OAuth
users missing a phone number, and full concurrent-session limiting
(2-device cap, heartbeat, eviction, a devices settings page).

### Phase 4 — bKash Tokenized Checkout
The highest-risk surface, built per the plan's exact spec: token
management with distributed locking, the raw-token-no-Bearer-prefix
header, create/callback/status routes, the `grant_access_for_payment`
SECURITY DEFINER transaction so payment-complete and enrollment-insert can
never diverge, amount/currency verification before granting anything, a
Query-Payment fallback when Execute fails or is ambiguous, the mandatory
15-minute reconciliation cron with a 24h daily cross-check, refund and
manual-payment paths reusing the same grant machinery.

### Phase 5 & 6 — Video delivery and course dashboard
Bunny token issuance (3h expiry, SHA256 per spec), TUS upload flow without
ever exposing the raw Bunny API key to the browser, the video player with
a dynamic watermark overlay (documented honestly as a deterrent layer, not
a claim of being unbeatable), server-side progress validation against
elapsed wall-clock time, and the full course/lesson dashboard with
sequential-unlock enforcement.

### Phase 7 & 8 — Community and live batches
Student directory and public profiles read ONLY from `public_profiles`,
gated on `is_enrolled_student()`. Zoom URLs and batch private links are
fetched via server actions on click, never in initial page HTML.
Batch-mates list from the `batch_members` view.

### Phase 9 — Admin panel
Role-gated (`requireStaff`/`requireAdmin`), covering every section the
plan lists: overview with the reconciliation metric surfaced prominently,
payments with manual-entry and refund actions, students with per-student
grant/revoke/ban/sign-out-devices, reports (reconciliation +
moderation + abuse watchlist), and CRUD list pages for the rest.

### Phase 10 & 11 — Marketing site and SEO
Every page the plan lists, including the full curriculum accordion, real
seat counters (never fake scarcity), and legal pages with draft copy that
explicitly covers the plan's required disclosures (student directory
visibility, two-device limit, content-sharing-ends-access clause) —
flagged as drafts pending the owner's final review. sitemap.ts, robots.ts,
manifest.ts, JSON-LD on the relevant pages.

### Phase 12 & 13 — Analytics and notifications
Meta Pixel + GA4 with route-change PageView tracking, InitiateCheckout/
ViewContent/Lead/CompleteRegistration/Purchase events with shared
event IDs for CAPI deduplication. Real React Email templates (one
dedicated purchase-confirmation component, one parameterized generic
notice covering the other dozen transactional emails). SMS templates
for purchase confirmation and session reminders.

### Phase 14 & 15 — Security and testing
Explicit CSP (report-only, with the exact flip-to-enforcing location
documented), full security headers, Upstash rate limiting on every
listed endpoint (fails open if Redis isn't configured, which is flagged),
sanitize-on-write for lesson HTML and user bios, a client-bundle secret
audit script (run and passing), vitest unit tests (19 passing, coupon
math and phone normalization), an RLS integration suite (14 tests,
actually run against live Postgres, not just written), Playwright E2E
skeletons for every key flow, and a GitHub Actions CI workflow running
all of the above on every PR.

### Phase 16 & 17 — Launch and post-launch
Documented as checklists in `OWNER_TASKS.md` per the plan's instruction
(these are manual launch-day steps, not code). Verified every code
prerequisite exists: all 7 cron routes guarded by `CRON_SECRET` and
scheduled in `vercel.json`, `/api/health` for uptime monitoring, and an
admin abuse-watchlist UI page.

## What's stubbed pending real credentials

Everything that needs a live external account is built against env var
placeholders and will work once real credentials are supplied — no code
changes should be needed, only `.env.local` / Vercel environment values:

- **Supabase**: schema/RLS validated locally; needs a real project (Phase
  0.3) and `supabase db push` to go live.
- **bKash**: full integration built against the sandbox base URL; needs
  real sandbox credentials to test, then live credentials + IP
  whitelisting resolution to launch (see QUESTIONS_FOR_OWNER.md).
- **Bunny.net**: token/upload/player code complete; needs a real Stream
  Video Library and its keys.
- **Resend**: email sending code complete, currently logs
  `skipped_not_configured` to `email_log` without a real API key.
- **SMS gateway**: same pattern, logs `skipped_not_configured` without
  real credentials.
- **Meta Pixel/CAPI, GA4**: all firing code complete; no-ops until the
  public IDs/tokens are set.
- **Zoom**: manual-paste flow only, per the plan's own recommendation
  (see QUESTIONS_FOR_OWNER.md) — no Zoom API integration was built.
- **Sentry**: not yet wired into the codebase (no `sentry.config` files
  were generated) — the plan's Phase 0.13 account setup is a
  prerequisite; flagging this as the one Phase-14.7 item not yet built,
  since it needs the DSN to configure meaningfully.

## What remains

- **Sentry instrumentation** (`@sentry/nextjs` is installed as a
  dependency per Phase 1.1, but the `sentry.client.config.ts` /
  `sentry.server.config.ts` / `sentry.edge.config.ts` files and the
  `withSentryConfig` wrapper in `next.config.ts` were not generated,
  since doing so meaningfully needs a real DSN to test against).
- **Blog/testimonial/FAQ content** is entirely data-driven from the
  database — the admin CRUD pages for creating/editing them are
  list-only in this build (no create/edit forms were built for
  blog_posts, testimonials, or coupons specifically — courses,
  lessons, batches and student actions have full admin actions;
  content-marketing CRUD forms are the main admin gap). Content itself
  is explicitly the owner's/client's work per Phase 11.3.
- **Zoom auto-creation, quizzes, DMs/forums, affiliate program,
  instructor payouts, mobile app, multi-language UI, card payments,
  enterprise DRM, AI captions, multi-tenant storefronts** — all
  deliberately deferred to v2 per the plan's own closing section.
- Real credentials, real content, and the manual verification steps in
  `OWNER_TASKS.md` are the actual remaining path to launch — the code
  side is functionally complete against the plan as written.

## How to pick this up

1. Read `OWNER_TASKS.md` top to bottom — it's organized by phase and is
   the actionable checklist.
2. Read `QUESTIONS_FOR_OWNER.md` for the handful of decisions that were
   defaulted per the plan's own recommendations; override any that don't
   fit.
3. `git log --oneline` shows one commit per phase (or phase-pair), each
   with a detailed message explaining what was built and why — useful
   for reviewing the reasoning behind any specific piece.
4. Once a real Supabase project exists: `supabase link --project-ref
   <ref>` then `supabase db push`, and re-run the verification queries at
   the bottom of `0002_rls_policies.sql` against it (they were validated
   locally in this session, but a fresh check on the real project costs
   nothing).
