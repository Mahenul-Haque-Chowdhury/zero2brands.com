# Owner tasks (running checklist)

This file is appended to continuously as the build proceeds. Items are
grouped by phase. Everything here is something only Arnob (or whoever holds
the relevant account) can do — the code side is already built or stubbed.

## Git / GitHub

- **Push to GitHub is currently blocked in this environment.** The sandbox's
  auto-mode classifier refuses `git push` (and refused `git remote add`
  once, though a retry succeeded) citing "Data Exfiltration" / "Remote
  Repoint" policy reasons — this is a safety restriction in the coding
  agent's sandbox, not a Git/GitHub problem. The remote `origin` has been
  set to `https://github.com/Mahenul-Haque-Chowdhury/zero2brands.com.git`
  and every phase is committed locally on `main`. **You need to either:**
  1. Run `git push -u origin main` yourself from a normal terminal (recommended), or
  2. Grant a Bash permission rule in Claude Code settings allowing `git push`,
     then ask the agent to push again.
  All commits are safe and waiting locally in `L:\zero2brands\.git`.

## Phase 0 (all manual, from the plan — tracked here for visibility, not re-explained)

- Confirm Cloudflare DNS + SSL settings for zero2brands.com (Full, then Full Strict after Vercel is live).
- GitHub: branch protection on `main`, Dependabot alerts.
- Supabase: create project (region Singapore ap-southeast-1), record URL/anon/service-role keys and DB connection strings, enable Email auth provider, create storage buckets (`avatars` public; `lesson-images`, `resources`, `certificates` private), upgrade to Pro before real money.
- Google Cloud OAuth consent screen + client, add credentials to Supabase Auth providers.
- Bunny.net: Stream Video Library (Asia-only replication, 1440p/2160p disabled), Token Authentication key, allowed referrers, dev + prod libraries.
- bKash Merchant application (Tokenized Checkout / PGW) — start immediately, 2-4 week lead time. Ask about IP whitelisting and SNS IPN availability in the first conversation. Request sandbox credentials separately/immediately.
- Decide + provision the bKash IP-whitelisting fix (ask bKash to waive it, or stand up the DigitalOcean fixed-IP proxy) — see QUESTIONS_FOR_OWNER.md.
- Resend: verify domain, DNS records (SPF/DKIM/DMARC) grey-clouded in Cloudflare, API key, wire into Supabase Auth SMTP.
- SMS gateway signup (Alpha Net / MIM SMS / BulkSMSBD / REVE SMS), masked sender ID application.
- Zoom Server-to-Server OAuth app + credentials. Decision already defaulted (see QUESTIONS_FOR_OWNER.md): manual paste of Zoom links for launch.
- Meta Business Manager, dataset + CAPI access token, domain verification, Facebook Page + Instagram.
- GA4 property + Search Console verification.
- Vercel Pro account linked to GitHub repo.
- Sentry account + DSN.
- 2FA on every service account; shared password manager.

## Phase 1

- Add all env vars to Vercel (Production / Preview / Development separately). bKash sandbox creds in Preview+Development, live creds in Production only.

## Phase 5/14 (storage buckets)

- The weekly backup-export cron (`/api/cron/backup-export`) uploads CSV
  snapshots of `payments`, `enrollments` and `profiles` to a Supabase
  Storage bucket named `backups`. This bucket is not in the original
  Phase 0.3 list — create it (private) in addition to `avatars`,
  `lesson-images`, `resources`, `certificates`.

## Phase 2 (database)

- The full migration set (`0001_schema.sql`, `0002_rls_policies.sql`,
  `0003_indexes.sql`) plus `supabase/seed.sql` was validated against a real
  local Postgres instance via `supabase start` (Docker) in this session —
  not just written, actually applied and exercised. All 5 of the plan's own
  guard/check queries pass (RLS on every table, search_path pinned on every
  SECURITY DEFINER function, the three gated views run with owner rights,
  privileged profile columns are unwritable by `authenticated`, and only
  `coupons`/`bkash_tokens` are the intentional deny-all tables). Access
  functions (`has_course_access`, `is_enrolled_student`, `public_profiles`
  view gating) were also spot-tested with the seeded users and behaved
  correctly (paid user sees the directory, unpaid user sees nothing).
  `src/types/database.ts` was generated from this locally-validated schema,
  so it is real, not hand-written.
- You still need to create the actual Supabase **project** (see Phase 0) to
  get a production/staging database. Once it exists:
  1. `supabase link --project-ref <ref>`
  2. `supabase db push` to apply the three migrations in order against the real project.
  3. Re-run the verification queries at the bottom of `0002_rls_policies.sql` (GUARD 1, GUARD 2, CHECK 3-5) and the manual penetration checks against that project too — a fresh confirmation costs nothing.
  4. Regenerate types against the real project: `npx supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts` (the `db:types` script expects `SUPABASE_PROJECT_ID` set).
  5. Do NOT run `supabase/seed.sql` against production — it creates fake auth users with a shared test password. It's for local/dev only (`supabase db reset` runs it automatically).

(This file will keep growing as later phases add owner-only steps — payment go-live switches, content loading, DNS cutover, etc. See also QUESTIONS_FOR_OWNER.md for decisions that were defaulted and may need your review.)
