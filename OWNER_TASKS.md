# Owner tasks (running checklist)

This file is appended to continuously as the build proceeds. Items are
grouped by phase. Everything here is something only Arnob (or whoever holds
the relevant account) can do — the code side is already built or stubbed.

## Git / GitHub

- Remote `origin` is `https://github.com/Mahenul-Haque-Chowdhury/zero2brands.com.git`
  and every commit has been pushing successfully to `main` throughout the
  build — no action needed here.

## Phone OTP login (added after initial build)

- Login now accepts either email or a Bangladeshi phone number in the same
  field for password login, plus a separate "SMS code" tab that logs in with
  just a phone number and a 6-digit code (no password).
- **This needs the SMS gateway configured to actually send codes** — see the
  SMS gateway line in Phase 0 below. Until then, OTP requests are accepted
  (so the UI doesn't error) but no SMS goes out; check `sms_log` for
  `skipped_not_configured` rows if a code never arrives during testing.
- Migration `0004_otp_codes.sql` adds the `otp_codes` table — validated
  against a live local Postgres the same way the rest of the schema was:
  RLS confirmed deny-all for both `anon` and `authenticated` roles (only the
  service-role admin client can read/write it, same pattern as
  `bkash_tokens`), and the cleanup function runs correctly. Run
  `supabase db push` along with the rest of the schema once a real project
  exists.
- Codes are 6 digits, expire after 5 minutes, and cap at 5 verification
  attempts per code. Rate limited at 3 requests per phone per 15 minutes.
- Signup still requires email (unchanged) — this only adds phone as a second
  way to log in to an existing account, it does not enable phone-only signup.

## Phase 0 (all manual, from the plan — tracked here for visibility, not re-explained)

- Confirm Cloudflare DNS + SSL settings for zero2brands.com (Full, then Full Strict after Vercel is live).
- GitHub: branch protection on `main`, Dependabot alerts.
- Supabase: create project (region Singapore ap-southeast-1), record URL/anon/service-role keys and DB connection strings, enable Email auth provider, create storage buckets (`avatars` public; `lesson-images`, `resources`, `certificates` private), upgrade to Pro before real money.
- Google Cloud OAuth consent screen + client, add credentials to Supabase Auth providers.
- Bunny.net: Stream Video Library (Asia-only replication, 1440p/2160p disabled), Token Authentication key, allowed referrers, dev + prod libraries.
- bKash Merchant application (Tokenized Checkout / PGW) — start immediately, 2-4 week lead time. Ask about IP whitelisting and SNS IPN availability in the first conversation. Request sandbox credentials separately/immediately.
- Decide + provision the bKash IP-whitelisting fix (ask bKash to waive it, or stand up the DigitalOcean fixed-IP proxy) — see QUESTIONS_FOR_OWNER.md.
- Resend: verify domain, DNS records (SPF/DKIM/DMARC) grey-clouded in Cloudflare, API key, wire into Supabase Auth SMTP.
- SMS gateway signup (Alpha Net / MIM SMS / BulkSMSBD / REVE SMS), masked sender ID application. **Required for OTP login to actually send codes** — until `SMS_API_URL`/`SMS_API_KEY` are set, OTP requests are logged to `sms_log` as `skipped_not_configured` and no SMS goes out (the request still "succeeds" from the caller's perspective, per the anti-enumeration design, but no code arrives).
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

## Phase 16: Launch

Content load (all manual, from the plan):
- Upload all course videos, write descriptions, attach resources, write FAQ, add testimonials, finalize pricing.
- Verify every video plays, every resource downloads, durations are correct.

Switch to production:
- Set `BKASH_IS_SANDBOX=false`, the live bKash base URL, and live bKash credentials — **Production Vercel environment only**, never Preview/Development.
- Confirm the production server IP (or the fixed-IP proxy's IP, if you needed one — see QUESTIONS_FOR_OWNER.md) is whitelisted with bKash.
- Register the production callback URL with bKash: `https://zero2brands.com/api/payments/bkash/callback`.
- Remove `META_TEST_EVENT_CODE` from the Production environment.
- Update Supabase Auth Site URL and Redirect URLs to the production domain.
- Update Google OAuth authorized origins/redirect URIs to production, and **publish the OAuth consent screen from Testing to Production** (requires live privacy/terms pages, which this build has drafted but you must review and finalize first).
- Point the Bunny production library's allowed referrers at the production domain.
- Set `NEXT_PUBLIC_SITE_URL` to the production URL in Vercel.

Domain go-live:
- Vercel > Settings > Domains: add `zero2brands.com` and `www.zero2brands.com`, add the DNS records Vercel specifies in Cloudflare.
- Sequence matters: add the domain in Vercel, wait for the certificate to issue, THEN switch Cloudflare SSL to Full (Strict). Switching SSL mode first causes a redirect loop.
- 301 redirect www to non-www (the app's metadata already treats non-www as canonical).
- Verify HTTPS, valid certificate, no mixed content, and test from an actual Bangladeshi mobile connection (not a VPN).

Final checks before taking the site live:
- Submit the sitemap (already generated at `/sitemap.xml`) to Search Console.
- Verify the Meta Pixel fires correctly on production with the Pixel Helper browser extension.
- Confirm the CSP header is switched from report-only to enforcing (see `next.config.ts` — currently `Content-Security-Policy-Report-Only`; flip to `Content-Security-Policy` once you've reviewed a few days of report-only violations in Sentry/browser console) and that video playback and bKash checkout both still work under it.
- Confirm `/dashboard` and `/admin` redirect correctly when logged out and are not indexed (robots.ts already disallows both).
- Confirm the community directory is inaccessible to a signed-up-but-unpaid account (covered by the RLS integration tests, but re-verify by hand once too).
- **Run one real bKash transaction on live for a small amount.** Verify: payment recorded, enrollment created, confirmation email sent, confirmation SMS sent, Meta Purchase event received in Events Manager. Then refund it through `/admin/payments` and verify access is revoked.
- Confirm the reconciliation cron (`/api/cron/reconcile-payments`, runs every 15 minutes per `vercel.json`) is actually running and logging on Vercel once deployed — cron jobs only run in Production, not Preview.
- Confirm Cloudflare WAF rules and rate limiting are active as the second layer in front of `/api/*`.
- Set up uptime alerts on `/api/health` and the home page, sent somewhere you'll actually see promptly.

## Phase 17: Post-launch operations

All cron routes referenced in `vercel.json` are built and guarded by `CRON_SECRET` — you need to set `CRON_SECRET` in Vercel's environment variables (any long random string) before crons will authenticate successfully; Vercel automatically sends it as a Bearer token to routes listed in `vercel.json`'s crons array.

Week one: watch Sentry daily (once wired — see Phase 0.13), watch `/admin/reports` (the reconciliation view) daily, and answer support messages quickly. Early trust compounds in this market per the plan.

Week two onward: review the abuse watchlist at `/admin/reports/watchlist` (surfaces `audit_log` rows the nightly cron writes), the moderation queue at `/admin/reports`, Search Console coverage, Meta Event Match Quality, and confirm the store request pipeline (`/admin/store-requests`) is being worked.

(This file will keep growing as later phases add owner-only steps — payment go-live switches, content loading, DNS cutover, etc. See also QUESTIONS_FOR_OWNER.md for decisions that were defaulted and may need your review.)
