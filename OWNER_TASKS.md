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

## Phase 2 (database)

- You will need to create the actual Supabase project (see Phase 0) before `supabase db push` can run. Once the project exists:
  1. `supabase link --project-ref <ref>`
  2. `supabase db push` to apply `0001_schema.sql` then `0002_rls_policies.sql` in order.
  3. Run the verification queries at the bottom of `0002_rls_policies.sql` (GUARD 1, GUARD 2, CHECK 3-5) and the manual penetration checks.
  4. Regenerate types: `npm run db:types` (needs `SUPABASE_PROJECT_ID` env var set locally, or run the `supabase gen types` command directly with your project ref).
  5. Load `supabase/seed.sql` for local/dev testing data.

(This file will keep growing as later phases add owner-only steps — payment go-live switches, content loading, DNS cutover, etc. See also QUESTIONS_FOR_OWNER.md for decisions that were defaulted and may need your review.)
