# Zero2Brands: Complete Production Build Plan (v2)

**Project:** Zero2Brands, an account-based clothing business coaching platform for Bangladesh
**Domain:** zero2brands.com (owned, on Cloudflare)
**Tech partner:** GrayVally Software Solutions
**Operator:** single admin at launch, multi-role ready
**Revised:** 18 September 2026

## What changed in v2

1. **bKash Merchant (Tokenized Checkout) replaces SSLCommerz** as the payment gateway. This is a structural change, not a swap. bKash has no server-to-server IPN in the standard flow, so access is granted from a server-side Execute Payment call with Query Payment as the safety net.
2. **Lifetime access** on all recorded course content. No expiry dates, no expiry cron, no expiry emails.
3. **Students are visible to each other.** A student directory, public student profiles, and batch-mate visibility, with RLS written to allow it safely.
4. **One course at launch.** Schema stays multi-course capable, marketing site treats the single course as the hero.
5. **Live batches sold separately in the same platform.** The recorded course is one product, live batch cohorts are another. A student can hold either or both.

---

## How to use this document

Every task is tagged:

- **[YOU]** Arnob does it manually, outside code. Account signups, dashboard config, DNS, credentials, verification.
- **[BUILD]** Written in code.
- **[CLIENT]** The business owner supplies something before the task can proceed.

Phase 0 is entirely manual and blocks everything else.

---

## Product definition, locked

**Product 1: Recorded course.** One course at launch. Student pays once, gets lifetime access to all video, image, text and resource lessons. Self-paced.

**Product 2: Live batch.** Seat-limited cohort with scheduled Zoom sessions over a fixed period. Sold separately. Has its own price, start date and seat cap. Recordings of each session are added afterwards and visible only to that batch.

A single user can hold the recorded course, one or more batches, or both. Batches recur, so batch two, batch three and so on are separate purchasable products.

**Social layer.** Students can see each other: a directory of enrolled students, public profile cards showing name, district, business name and avatar, and a batch-mates list inside each batch. This is a deliberate retention feature, so build it properly rather than bolting it on.

**Featured GrayVally section.** A dedicated store-building page, a CTA in the student dashboard once course progress passes 80 percent, and a lead form routing to GrayVally.

**Content types:** video, image, text, downloadable resources. Quizzes deferred to v2.

---

# PHASE 0: Accounts, services and manual setup

All **[YOU]**. Budget three to four days of your own time, but note bKash onboarding runs for weeks in the background.

## 0.1 Domain and DNS

**[YOU]** Confirm zero2brands.com nameservers point to Cloudflare and the zone is active. Done.

**[YOU]** Do not add DNS records yet. Vercel specifies them in Phase 16.

**[YOU]** Cloudflare > SSL/TLS: leave on Full for now. Switch to **Full (Strict)** only after Vercel is serving the domain, otherwise you get redirect loops.

**[YOU]** Cloudflare > SSL/TLS > Edge Certificates: enable **Always Use HTTPS**, **Automatic HTTPS Rewrites**, set **Minimum TLS Version 1.2**, enable **HSTS** max-age 6 months, includeSubDomains off initially.

**[YOU]** bKash requires a valid SSL certificate on the merchant site before they approve integration. Cloudflare plus Vercel covers this, but note it as a prerequisite they check.

**[YOU]** Buy zero2brands.com.bd if available. Low priority, run in parallel.

## 0.2 GitHub

**[YOU]** Private repo `zero2brands`. Add the Next.js `.gitignore` before the first commit.

**[YOU]** Branch protection on `main`: require pull request, no force push.

**[YOU]** Enable Dependabot alerts.

## 0.3 Supabase

**[YOU]** New project. Region **Singapore (ap-southeast-1)**, lowest latency to Dhaka.

**[YOU]** Record and store securely: project URL, `anon` key, `service_role` key, direct Postgres connection string (port 5432), pooler string (port 6543, transaction mode), database password.

**[YOU]** Authentication > Providers: enable **Email**. Disable email confirmations until Resend SMTP is wired in Phase 3.

**[YOU]** Authentication > URL Configuration: Site URL `http://localhost:3000` for now.

**[YOU]** **Upgrade to Pro before taking real money.** Free tier has daily backups only and no point-in-time recovery. You are storing payment records. This is not optional.

**[YOU]** Storage buckets:
- `avatars` (public, since students see each other, avatars must be publicly readable)
- `lesson-images` (private)
- `resources` (private)
- `certificates` (private)

## 0.4 Google OAuth

**[YOU]** Google Cloud Console, new project `Zero2Brands`.

**[YOU]** OAuth consent screen:
- User type: External
- App name: Zero2Brands
- Support email: client's business email
- Home page: `https://zero2brands.com`
- Privacy policy: `https://zero2brands.com/privacy`
- Terms: `https://zero2brands.com/terms`
- Authorized domains: `zero2brands.com` plus the Supabase project domain
- Scopes: `userinfo.email`, `userinfo.profile`, `openid` only. Extra scopes trigger a verification review and weeks of delay.
- Keep in Testing during development. **Publish to Production before launch.**

**[YOU]** Credentials > OAuth client ID > Web application:
- Authorized JavaScript origins: `http://localhost:3000`, `https://zero2brands.com`, `https://www.zero2brands.com`
- Authorized redirect URI: `https://<supabase-project-ref>.supabase.co/auth/v1/callback`

That redirect is the Supabase callback, not your app route. Getting this wrong is the commonest OAuth failure.

**[YOU]** Supabase > Authentication > Providers > Google: paste Client ID and Secret, enable, save.

**[YOU]** The privacy and terms pages must exist and be reachable before publishing the consent screen. Google checks.

## 0.5 Bunny.net video

**[YOU]** Sign up, add payment method. $1 monthly minimum.

**[YOU]** Create Stream Video Library `zero2brands-lessons`.

**[YOU]** Replication regions: **Asia only** (Singapore, and Mumbai if offered). Leave everything else off. **Replication zones cannot be removed once configured.** Get this right on the first pass.

**[YOU]** Encoding settings:
- Enable 360p, 480p, 720p, 1080p
- **Disable 1440p and 2160p.** Premium encoding bills at $0.150 per minute of output. Your audience is on mid-range Android over mobile data.
- Standard encoding stays free

**[YOU]** Player settings:
- Enable **Token Authentication**, copy the **Token Authentication Key**
- Disable direct play URLs
- Allowed Referrers: `zero2brands.com`, `localhost`
- Enable **Block direct URL file access**

**[YOU]** Record: Library ID, Stream API key, Token Authentication Key, CDN hostname (`vz-xxxxxxxx.b-cdn.net`), Account API key.

**[YOU]** Create `zero2brands-lessons-dev` with identical settings so test uploads stay out of production.

## 0.6 bKash Merchant account and Tokenized Checkout

This replaces SSLCommerz entirely. **Start this on day one.** It is the longest lead-time item in the project.

**[YOU]** Apply for a **bKash Merchant Account** with PGW (Payment Gateway) access. Approach bKash directly or through their merchant onboarding portal. Required documents:
- Trade licence (client's)
- TIN certificate
- BIN or VAT registration if applicable
- Bank account details in the business name
- NID of the proprietor or directors
- Business address proof
- Website URL with valid SSL for their review
- A description of what you are selling

**[YOU]** Specify you need **Tokenized Checkout** (PGW), not just a personal or agent number. Tokenized Checkout is the API product. Approval typically takes two to four weeks and may involve a compliance call.

**[YOU]** Request **sandbox credentials immediately**, before full approval. bKash issues these separately and you build against them. Public sandbox credentials float around in demo repos, but get your own so testing reflects your account configuration.

**[YOU]** Credentials bKash will issue, separately for sandbox and live:
- `app_key` (also called API key)
- `app_secret` (secret key)
- `username`
- `password`

All four are needed for the Grant Token call. Store them as secrets.

**[YOU]** Base URLs:
- Sandbox: `https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout`
- Live: `https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout`

Verify the current version path against bKash's developer portal at integration time, since they version these.

**[YOU]** **IP whitelisting.** bKash restricts live API calls to whitelisted server IPs. Vercel serverless functions do not have stable outbound IPs. This is a genuine architectural problem and you must resolve it before launch. Options:

1. Ask bKash whether they will whitelist a range or waive it for your account. Some merchants get this.
2. Route bKash API calls through a small fixed-IP proxy: a DigitalOcean droplet in Singapore running a minimal authenticated relay. You already run droplets, so this is the pragmatic answer.
3. Use a static-IP egress service (QuotaGuard, Fixie).

**Decide this in Phase 0, not at launch.** If you need the proxy, budget it into Phase 4. Ask bKash the whitelisting question in your very first conversation with them.

**[YOU]** Confirm with bKash: per-transaction fee, settlement cycle, whether refunds are API-driven or manual, and the daily or monthly transaction ceiling on your merchant tier.

**[YOU]** Callback URL to register: `https://zero2brands.com/api/payments/bkash/callback`

**[YOU]** Ask whether your account supports **IPN via SNS-signed webhooks**. Newer bKash integrations offer this. If available, take it, because it gives you a server-push confirmation channel and makes reconciliation far more reliable. If not available, the Query Payment polling in Phase 4 is your fallback and it works.

## 0.7 Resend email

**[YOU]** Sign up at resend.com. Add and verify domain `zero2brands.com`.

**[YOU]** Add in Cloudflare DNS: SPF TXT, DKIM records (usually three CNAMEs), DMARC TXT starting at `v=DMARC1; p=none; rua=mailto:dmarc@zero2brands.com`, tightening to `p=quarantine` after two clean weeks.

**[YOU]** Set these records to **DNS only** (grey cloud). Proxying breaks mail verification.

**[YOU]** Send from `noreply@zero2brands.com`, reply-to `support@zero2brands.com`.

**[YOU]** Create an API key scoped to sending.

**[YOU]** Configure Supabase Auth to send through Resend SMTP: Project Settings > Auth > SMTP Settings. Supabase's built-in sender has tight rate limits and poor deliverability to Bangladeshi inboxes.

## 0.8 SMS gateway

**[YOU]** Sign up with a Bangladeshi provider: Alpha Net, MIM SMS, BulkSMSBD, or REVE SMS. Compare on masking support and per-SMS price.

**[YOU]** Apply for a **masked sender ID** so messages show `Zero2Brands`. Requires trade licence, takes a few days. Non-masked works immediately as fallback.

**[YOU]** Confirm Unicode (Bangla) support if needed. Unicode SMS costs more and has a 70-character segment limit versus 160 for English.

**[YOU]** Record: API endpoint, API key or username and password, sender ID. Buy a test credit bundle.

## 0.9 Zoom

**[YOU]** Zoom **Pro** minimum (meetings over 40 minutes). **Business** if the client wants cloud recording and over 100 participants.

**[YOU]** Zoom Marketplace > Develop > Build App > **Server-to-Server OAuth**. Not the deprecated JWT app.

**[YOU]** Scopes: `meeting:write:admin`, `meeting:read:admin`, `user:read:admin`.

**[YOU]** Record Account ID, Client ID, Client Secret.

**[CLIENT]** Decision: auto-create Zoom meetings from the platform, or create manually and paste links? **Recommendation: manual paste for launch**, auto-create in v1.1. Manual is one text field and zero integration risk.

## 0.10 Meta Pixel and Conversions API

**[YOU]** Meta Business Manager account for Zero2Brands.

**[YOU]** Business Settings > Data Sources > Datasets > Add. Name `Zero2Brands Web`. Record the **Dataset ID**.

**[YOU]** Events Manager > dataset > Settings > Conversions API > **Generate access token**. Record it, treat as a secret.

**[YOU]** Turn **Automatic Advanced Matching off**. You send hashed match keys server-side instead, which is more accurate and controllable.

**[YOU]** Business Settings > Brand Safety > Domains > add and verify `zero2brands.com` via DNS TXT in Cloudflare. Required for Aggregated Event Measurement.

**[YOU]** Aggregated Event Measurement: configure the 8 priority events once the pixel fires. Rank `Purchase` first.

**[YOU]** Create the Facebook Page and grab the handle today. Create the Instagram business account and link it.

## 0.11 Google Analytics and Search Console

**[YOU]** GA4 property for zero2brands.com. Record the Measurement ID.

**[YOU]** Enable Enhanced Measurement on the data stream.

**[YOU]** Search Console property, verify via DNS TXT in Cloudflare.

**[YOU]** Skip Google Tag Manager. Hardcode GA4 and the Meta pixel. One less layer, faster page.

## 0.12 Vercel

**[YOU]** Account linked to the GitHub repo. **Pro plan required**, Hobby does not permit commercial use.

**[YOU]** Do not add the custom domain yet. Phase 16.

## 0.13 Error monitoring

**[YOU]** Sentry account, Next.js project, record the DSN.

## 0.14 Fixed-IP proxy, if bKash requires whitelisting

**[YOU]** If bKash will not waive IP whitelisting: provision a small DigitalOcean droplet in Singapore (the cheapest tier is ample). It runs a minimal authenticated HTTP relay that forwards only to the bKash base URL, rejects everything else, and requires a shared secret header. Note its static IP and give it to bKash for whitelisting.

**[YOU]** Harden it: UFW allowing only 443 inbound, fail2ban, automatic security updates, key-only SSH. It holds no secrets itself, it only relays, but it is an internet-facing box sitting in your payment path.

## 0.15 Content and decisions from the client

**[CLIENT]** Before Phase 6 testing:
- Final course structure: module names, lesson names, order
- At least three real lesson videos for testing
- Course price in BDT
- Batch one price, schedule, seat limit
- Refund policy text
- Terms of service and privacy policy content, or approval of your draft
- Logo files (SVG plus PNG fallbacks), brand colours, fonts
- Founder photo and bio
- Real testimonials if any exist
- Business address, phone, email, trade licence number for the footer

**[CLIENT]** Already decided, recorded here so nobody relitigates:
- Recorded course access: **lifetime**
- Students visible to each other: **yes**
- Courses at launch: **one**, more later
- Live batches: **yes, sold separately, same platform**
- Payment: **bKash only at launch**

**[CLIENT]** Still open, needed before Phase 10:
- Is the GrayVally storefront included in the course price or an upsell? Recommendation: upsell, with the CTA appearing at 80 percent course progress.
- Does a live batch include the recorded course, or are they fully independent? Recommendation: batch includes recorded access, priced accordingly. It is a better offer and the schema already supports granting both from one payment.

---

# PHASE 1: Repository scaffold and environment

## 1.1 Initialise

**[BUILD]**

```bash
npx create-next-app@latest zero2brands --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**[BUILD]** Dependencies:

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install date-fns date-fns-tz
npm install lucide-react framer-motion gsap
npm install resend
npm install sonner nanoid
npm install @sentry/nextjs
npm install isomorphic-dompurify
npm install @upstash/redis @upstash/ratelimit
```

```bash
npm install -D prettier prettier-plugin-tailwindcss
npm install -D vitest @vitejs/plugin-react
npm install -D @playwright/test
npm install -D supabase
```

**[BUILD]** shadcn/ui init, then add: button, input, label, card, dialog, dropdown-menu, form, select, table, tabs, sonner, avatar, badge, separator, sheet, skeleton, alert, progress, accordion, textarea, checkbox, switch, tooltip, popover, calendar, command, scroll-area.

## 1.2 Folder structure

**[BUILD]**

```
src/
  app/
    (marketing)/
      page.tsx
      about/
      course/                    # single course, not /courses
      batches/
      batches/[slug]/
      build-your-store/
      blog/
      blog/[slug]/
      contact/  faq/
      privacy/  terms/  refund-policy/
      verify/[certificateNumber]/
      payment/success/
      payment/failed/
      payment/cancelled/
      layout.tsx
    (auth)/
      login/  signup/
      forgot-password/  reset-password/
      onboarding/
      auth/callback/route.ts
      layout.tsx
    (dashboard)/
      dashboard/
      dashboard/course/
      dashboard/course/[lessonSlug]/
      dashboard/my-batches/
      dashboard/my-batches/[slug]/
      dashboard/community/            # student directory
      dashboard/community/[username]/ # public student profile
      dashboard/resources/
      dashboard/certificates/
      dashboard/store-request/
      dashboard/settings/
      dashboard/settings/devices/
      dashboard/billing/
      layout.tsx
    (admin)/
      admin/
      admin/courses/  admin/courses/[id]/
      admin/lessons/
      admin/batches/  admin/batches/[id]/
      admin/students/ admin/students/[id]/
      admin/payments/
      admin/leads/    admin/store-requests/
      admin/coupons/
      admin/blog/     admin/settings/
      admin/reports/
      layout.tsx
    api/
      payments/bkash/create/route.ts
      payments/bkash/callback/route.ts
      payments/bkash/status/route.ts
      payments/bkash/ipn/route.ts        # only if bKash SNS webhooks available
      video/token/route.ts
      video/progress/route.ts
      session/heartbeat/route.ts
      meta/capi/route.ts
      cron/[job]/route.ts
      health/route.ts
    sitemap.ts  robots.ts  manifest.ts
    not-found.tsx  error.tsx  global-error.tsx  layout.tsx
  components/
    ui/  marketing/  dashboard/  admin/  video/  community/  shared/
  lib/
    supabase/ client.ts  server.ts  admin.ts  middleware.ts
    bkash/    client.ts  token.ts  types.ts
    bunny/    token.ts   api.ts
    email/    resend.ts  templates/
    sms/      gateway.ts
    analytics/ meta-pixel.ts  meta-capi.ts  ga4.ts
    auth/     guards.ts
    ratelimit/ index.ts
    utils/  constants/  validations/
  types/ database.ts  index.ts
  hooks/
  middleware.ts
supabase/
  migrations/
  seed.sql
```

## 1.3 Environment variables

**[BUILD]** `.env.local` plus a committed `.env.example` with the same keys and empty values.

```
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
DIRECT_URL=

# Bunny Stream
BUNNY_STREAM_LIBRARY_ID=
BUNNY_STREAM_API_KEY=
BUNNY_STREAM_TOKEN_KEY=
BUNNY_STREAM_CDN_HOSTNAME=
BUNNY_ACCOUNT_API_KEY=

# bKash Tokenized Checkout
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_IS_SANDBOX=true
BKASH_PROXY_URL=            # only if IP whitelisting requires it
BKASH_PROXY_SECRET=

# Resend
RESEND_API_KEY=
EMAIL_FROM="Zero2Brands <noreply@zero2brands.com>"
EMAIL_REPLY_TO=support@zero2brands.com

# SMS
SMS_API_URL=
SMS_API_KEY=
SMS_SENDER_ID=

# Zoom (only if auto-creating meetings)
ZOOM_ACCOUNT_ID=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

# Meta
NEXT_PUBLIC_META_PIXEL_ID=
META_CAPI_ACCESS_TOKEN=
META_TEST_EVENT_CODE=

# Google
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
GOOGLE_SITE_VERIFICATION=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Upstash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Security
CRON_SECRET=
```

**[BUILD]** Zod env validation module that fails the build on a missing variable. Validate server and client vars separately, never import server vars into a client component.

**[YOU]** Add all of these to Vercel > Settings > Environment Variables, separately for Production, Preview and Development. bKash sandbox credentials in Preview and Development, live credentials in Production only.

## 1.4 Config

**[BUILD]** `next.config.ts`: remote image patterns for the Bunny CDN host and Supabase storage host, `poweredByHeader: false`, security headers (Phase 14), Sentry wrapper.

**[BUILD]** npm scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`, `db:types`, `db:push`, `db:reset`.

---

# PHASE 2: Database schema and Row Level Security

Write every table as a migration file in `supabase/migrations/`. Never click tables together in the Supabase UI.

## 2.1 Enums

**[BUILD]**

```
user_role:            'student' | 'instructor' | 'admin' | 'superadmin'
enrollment_status:    'active' | 'revoked'
payment_status:       'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded'
payment_gateway:      'bkash' | 'manual' | 'free'
lesson_type:          'video' | 'image' | 'text' | 'resource'
batch_status:         'upcoming' | 'enrolling' | 'running' | 'completed' | 'cancelled'
product_type:         'course' | 'batch' | 'bundle'
store_request_status: 'new' | 'contacted' | 'in_progress' | 'delivered' | 'declined'
lead_source:          'organic' | 'facebook' | 'referral' | 'webinar' | 'other'
profile_visibility:   'public' | 'students_only' | 'private'
```

`enrollment_status` has no `expired` value. Access is lifetime.

## 2.2 Core tables

**[BUILD]**

**`profiles`**
- `id` uuid PK references `auth.users(id)` on delete cascade
- `username` text unique (slug, auto-generated from name, used in `/dashboard/community/[username]`)
- `full_name` text
- `email` text unique not null
- `phone` text unique
- `phone_verified` boolean default false
- `avatar_url` text
- `role` user_role default 'student'
- `bio` text
- `district` text
- `facebook_url` text
- `business_name` text
- `business_category` text
- `visibility` profile_visibility default 'students_only'
- `show_facebook` boolean default false
- `onboarding_completed` boolean default false
- `is_banned` boolean default false
- `ban_reason` text
- `admin_notes` text
- `last_seen_at` timestamptz
- `created_at`, `updated_at`

`visibility` is what makes the social layer safe. Default `students_only` means only other enrolled students see the profile. `private` hides it from the directory entirely, and students must be able to set that themselves.

**`public_profiles` VIEW**
Selects only `id, username, full_name, avatar_url, district, business_name, business_category, bio, facebook_url (only when show_facebook), created_at` from profiles where `visibility <> 'private'` and `is_banned = false`. **The directory and profile pages read this view, never the base table.** Email, phone and admin notes must never be reachable by another student.

**`courses`**
- `id` uuid PK
- `slug` text unique not null
- `title`, `subtitle`, `description` text
- `outcomes` jsonb, `requirements` jsonb
- `thumbnail_url` text
- `trailer_video_id` text (Bunny GUID, free ungated preview)
- `price_bdt` integer not null
- `compare_at_price_bdt` integer
- `is_published` boolean default false
- `is_primary` boolean default false (the single hero course at launch)
- `sequential_unlock` boolean default true
- `sort_order` integer
- `total_lessons` integer default 0 (trigger-maintained)
- `total_duration_seconds` integer default 0 (trigger-maintained)
- `seo_title`, `seo_description`, `og_image_url` text
- `created_at`, `updated_at`

No `access_duration_days`. Access is lifetime.

**`modules`**
- `id` uuid PK, `course_id` FK cascade
- `title`, `description` text
- `sort_order` integer not null
- `is_published` boolean default false
- unique (course_id, sort_order)

**`lessons`**
- `id` uuid PK, `module_id` FK cascade, `course_id` FK (denormalised for access checks)
- `slug` text not null
- `title`, `description` text
- `type` lesson_type default 'video'
- `bunny_video_id` text
- `duration_seconds` integer default 0
- `content_html` text (sanitised server-side on write)
- `image_paths` jsonb (private bucket paths)
- `sort_order` integer not null
- `global_order` integer (computed across the whole course, used for sequential unlocking)
- `is_preview` boolean default false
- `is_published` boolean default false
- unique (course_id, slug), unique (module_id, sort_order)

**`lesson_resources`**
- `id` uuid PK, `lesson_id` FK cascade
- `title` text, `storage_path` text, `file_size_bytes` bigint, `mime_type` text
- `download_count` integer default 0, `sort_order` integer

**`products`**
- `id` uuid PK
- `type` product_type not null
- `course_id` uuid FK nullable, `batch_id` uuid FK nullable
- `title` text not null, `price_bdt` integer not null
- `is_active` boolean default true
- check: exactly one of course_id / batch_id set for non-bundle types

**`bundle_items`**
- `bundle_product_id` FK, `course_id` nullable, `batch_id` nullable
- Used when one purchase grants several things.

**`enrollments`** (recorded course, lifetime)
- `id` uuid PK
- `user_id` FK cascade, `course_id` FK cascade
- `payment_id` FK nullable (null when granted manually)
- `status` enrollment_status default 'active'
- `granted_at` timestamptz default now()
- `revoked_at` timestamptz, `revoked_reason` text
- `completed_at` timestamptz
- `progress_percent` integer default 0 (trigger-maintained)
- unique (user_id, course_id)

No `expires_at`.

**`batches`**
- `id` uuid PK, `slug` text unique
- `course_id` FK nullable (batch may follow the course curriculum)
- `title`, `description`, `thumbnail_url` text
- `price_bdt` integer not null, `compare_at_price_bdt` integer
- `includes_course_access` boolean default true
- `seat_limit` integer not null
- `seats_taken` integer default 0 (trigger-maintained)
- `enrollment_opens_at`, `enrollment_closes_at` timestamptz
- `starts_at` timestamptz not null, `ends_at` timestamptz
- `status` batch_status default 'upcoming'
- `schedule_note` text
- `instructor_id` FK profiles
- `seo_title`, `seo_description` text

**`batch_private_links`**
Separate table so RLS can gate it cleanly rather than trying to hide columns on a public row.
- `batch_id` PK FK cascade
- `whatsapp_group_url`, `facebook_group_url`, `telegram_url` text

**`batch_enrollments`**
- `id` uuid PK, `user_id` FK cascade, `batch_id` FK cascade
- `payment_id` FK nullable
- `status` enrollment_status default 'active'
- `granted_at` timestamptz default now()
- `revoked_at` timestamptz, `revoked_reason` text
- `attendance_count` integer default 0
- unique (user_id, batch_id)

**`live_sessions`**
- `id` uuid PK, `batch_id` FK cascade
- `title`, `description` text
- `scheduled_at` timestamptz not null
- `duration_minutes` integer default 90
- `zoom_meeting_id`, `zoom_join_url`, `zoom_password` text
- `recording_bunny_video_id` text
- `is_cancelled` boolean default false
- `sort_order` integer

**`session_attendance`**
- `id` uuid PK, `live_session_id` FK cascade, `user_id` FK cascade
- `joined_at` timestamptz, `marked_by` FK profiles
- unique (live_session_id, user_id)

**`payments`**
Reshaped for bKash.
- `id` uuid PK
- `user_id` FK, `product_id` FK
- `merchant_invoice_number` text unique not null (your ID, sent to bKash)
- `gateway` payment_gateway not null
- `bkash_payment_id` text unique (bKash `paymentID` from Create Payment)
- `bkash_trx_id` text (bKash `trxID`, only exists after a successful Execute)
- `bkash_payer_reference` text
- `bkash_customer_msisdn` text (payer's bKash number, returned on execute)
- `amount_bdt` integer not null
- `discount_bdt` integer default 0
- `coupon_id` FK nullable
- `status` payment_status default 'pending'
- `bkash_create_response` jsonb
- `bkash_execute_response` jsonb
- `bkash_query_response` jsonb
- `paid_at`, `refunded_at` timestamptz
- `refund_reason`, `failure_reason` text
- `ip_address` inet, `user_agent` text
- `created_at`, `updated_at`

**`bkash_tokens`**
bKash id_tokens live one hour, refresh tokens 28 days. Serverless has no shared memory, so cache the token centrally.
- `id` int PK default 1 (single row, enforced by a check constraint)
- `id_token` text, `refresh_token` text
- `id_token_expires_at`, `refresh_token_expires_at` timestamptz
- `updated_at` timestamptz

Lock this table to service_role only. An exposed id_token is a live payment credential.

**`coupons`** and **`coupon_redemptions`**: code, discount type and value, max uses, per-user cap, product scope, date window, active flag, redemption join rows.

**`lesson_progress`**
- `id` uuid PK, `user_id` FK cascade, `lesson_id` FK cascade, `course_id` FK
- `watched_seconds`, `last_position_seconds` integer default 0
- `is_completed` boolean default false, `completed_at` timestamptz
- `first_viewed_at`, `last_viewed_at` timestamptz
- unique (user_id, lesson_id)

**`lesson_notes`**
- `id` uuid PK, `user_id` FK cascade, `lesson_id` FK cascade
- `content` text
- unique (user_id, lesson_id)

**`active_sessions`**
- `id` uuid PK, `user_id` FK cascade
- `session_token_hash` text unique not null
- `device_fingerprint`, `user_agent` text, `ip_address` inet
- `last_heartbeat_at` timestamptz default now()
- `created_at` timestamptz default now()

**`video_access_log`**
- `id` uuid PK, `user_id` FK, `lesson_id` FK, `bunny_video_id` text
- `ip_address` inet, `user_agent` text, `token_issued_at` timestamptz default now()

**`store_requests`**
- `id` uuid PK, `user_id` FK nullable
- `full_name`, `phone` text not null, `email` text
- `business_name`, `product_category`, `budget_range`, `message` text
- `status` store_request_status default 'new'
- `assigned_to` FK nullable, `internal_notes` text, `source` text
- `created_at`, `updated_at`

**`leads`**
- `id` uuid PK, `full_name`, `phone`, `email` text
- `source` lead_source, UTM columns
- `converted_user_id` FK nullable
- `created_at`

**`certificates`**
- `id` uuid PK, `user_id` FK, `course_id` FK nullable, `batch_id` FK nullable
- `certificate_number` text unique not null (`Z2B-2026-0001`)
- `issued_at` timestamptz, `pdf_storage_path` text, `is_revoked` boolean default false

**`reports`** (community moderation)
- `id` uuid PK, `reporter_id` FK, `reported_user_id` FK
- `reason` text, `status` text default 'open', `admin_notes` text
- `created_at`

**`blog_posts`**, **`faqs`**, **`testimonials`**, **`site_settings`**, **`audit_log`**, **`email_log`**, **`sms_log`** as standard: published flags, sort orders, SEO columns on posts, actor plus before and after jsonb on the audit log, recipient plus provider message ID plus status on the logs.

## 2.3 Triggers and functions

**[BUILD]**

`handle_new_user()` on `auth.users` insert. Creates the profile, copies name and avatar from `raw_user_meta_data` (covers Google OAuth), and generates a unique `username` slug with a numeric suffix on collision.

`set_updated_at()` on every table with that column.

`update_course_totals()` on lessons change. Also recomputes `global_order` across the course.

`update_enrollment_progress()` on `lesson_progress` change. Recalculates `progress_percent`, sets `completed_at` at 100.

`update_batch_seats()` on `batch_enrollments` change. Recalculates `seats_taken` and **raises an exception if it would exceed `seat_limit`**, so an overselling race cannot happen at the application layer.

`has_course_access(uid, course_id)` returns boolean. True if an active enrollment exists, OR the user has an active batch enrollment for a batch with `includes_course_access = true` and matching `course_id`, OR the user is admin. **Single source of truth, used inside RLS policies.** No expiry check, because access is lifetime.

`has_batch_access(uid, batch_id)` returns boolean.

`is_admin(uid)` returns boolean.

`is_enrolled_student(uid)` returns boolean. True if the user has any active enrollment or batch enrollment. **This gates the student directory**, so only paying students see other students.

`can_access_lesson(uid, lesson_id)` returns boolean. Wraps `has_course_access` and, when the course has `sequential_unlock`, additionally requires that the previous lesson by `global_order` is completed. Enforcing unlock order server-side matters, hiding links is not enforcement.

`generate_certificate_number()` sequential.

All of these `SECURITY DEFINER` with `search_path` pinned to `public`. An unpinned search_path on a SECURITY DEFINER function is a privilege escalation vector.

Removed from v1: `expire_enrollments()`. Not needed.
Retained: `cleanup_stale_sessions()`.

## 2.4 Row Level Security

**[BUILD]** Enable RLS on **every table**. A table with RLS off is a full leak through the anon key, which is public by design.

**`profiles`**
- select: own row; admins all. **Not** other students, they read `public_profiles` instead.
- update: own row only, and **revoke column-level UPDATE on `role`, `is_banned`, `admin_notes` from `authenticated`**. A policy cannot restrict which columns are written, only a column grant can.
- insert: none (trigger only). delete: none.

**`public_profiles` (view)**
- Create with `security_invoker = true`. A view created without it runs as its owner and **bypasses RLS entirely**, which would expose every student's phone number. This is the single easiest way to leak the whole profiles table, so test it explicitly.
- select: `is_enrolled_student(auth.uid())` OR `is_admin(auth.uid())`. A signed-up-but-unpaid user cannot browse the student list.

**`courses`**
- select: `is_published = true` for anyone; admins all
- write: admins only

**`modules`, `lessons`**
- select: `has_course_access(auth.uid(), course_id) OR is_preview = true OR is_admin(auth.uid())`
- Public curriculum display uses a separate view `course_outline_public` exposing only `id, module_id, title, sort_order, duration_seconds, type, is_preview`. **Never `bunny_video_id` or `content_html`.** `security_invoker = true`, granted to anon.
- write: admins only

**`lesson_resources`**
- select: `has_course_access` on the parent lesson's course

**`enrollments`, `batch_enrollments`**
- select: own rows, or admin
- insert, update, delete: service_role and admin only. **A client must never insert an enrollment.**

**`batch_members` (view)**
- Joins `batch_enrollments` to `public_profiles`, exposing username, full_name, avatar_url, district, business_name.
- `security_invoker = true`
- select: `has_batch_access(auth.uid(), batch_id)`

**`payments`**
- select: own rows, or admin
- insert, update: service_role only. The client never sets `status` or `amount_bdt`.

**`bkash_tokens`**
- No policies at all. Revoke everything from `anon` and `authenticated`. service_role only.

**`batches`**
- select: anyone where status is not 'cancelled'
- write: admins only

**`batch_private_links`**
- select: `has_batch_access(auth.uid(), batch_id)` or admin. Nothing else.

**`live_sessions`**
- select: `has_batch_access(auth.uid(), batch_id)` or admin
- The Zoom URL is additionally never rendered into public HTML. Fetch it through a server action on click.

**`lesson_progress`, `lesson_notes`**
- select, insert, update: own rows only

**`active_sessions`**
- select: own rows (so a student can see and revoke their devices)
- write: service_role only

**`video_access_log`, `audit_log`, `email_log`, `sms_log`**
- select: admins only. insert: service_role only.

**`store_requests`, `leads`, `reports`**
- insert: anyone (reports: authenticated only). Rate limit at the route, not the database.
- select, update: admins only

**`coupons`**
- **No public select at all.** Validation happens in a server action returning only the computed discount. Exposing this table lets anyone enumerate every discount code.

**`blog_posts`, `faqs`, `testimonials`**
- select: published rows public. write: admins only.

**`certificates`**
- select: own rows. Public verification goes through a dedicated route returning only name, course and date.

## 2.5 Indexes

**[BUILD]**

```
enrollments (user_id, status)
enrollments (course_id)
batch_enrollments (user_id, status)
batch_enrollments (batch_id, status)
lessons (course_id, sort_order)
lessons (course_id, global_order)
lessons (module_id, sort_order)
modules (course_id, sort_order)
lesson_progress (user_id, course_id)
payments (user_id, created_at desc)
payments (status, created_at desc)
payments (bkash_payment_id)
payments (merchant_invoice_number)
active_sessions (user_id, last_heartbeat_at)
video_access_log (user_id, token_issued_at desc)
live_sessions (batch_id, scheduled_at)
profiles (username)
profiles (visibility) where is_banned = false
blog_posts (published_at desc) where is_published
```

## 2.6 Types and seed

**[BUILD]** `npx supabase gen types typescript --project-id <ref> > src/types/database.ts`, committed, regenerated after every migration.

**[BUILD]** `seed.sql`: one course, three modules, six lessons, one batch with three sessions, an admin user, three student users with varied visibility settings so you can test the directory, and a few FAQs.

---

# PHASE 3: Authentication

## 3.1 Supabase clients

**[BUILD]** Three factories, and keeping them separate matters:
- `client.ts` browser, anon key
- `server.ts` server components and route handlers, anon key plus request cookies, so RLS applies as the logged-in user
- `admin.ts` service_role, **bypasses RLS entirely**

**[BUILD]** `import 'server-only'` at the top of `admin.ts`, `lib/bkash/*`, `lib/bunny/token.ts`, `lib/sms/*`. The build then fails if one is ever pulled into a client bundle, which is the difference between a mistake and a catastrophe.

**[BUILD]** Use the admin client in exactly three places: the bKash payment routes, admin mutations after an explicit role check, and cron jobs.

## 3.2 Middleware

**[BUILD]** Refresh the Supabase session every request, redirect unauthenticated users from `/dashboard/*` to `/login?next=`, redirect non-admins from `/admin/*`, redirect authenticated users away from `/login`, block banned users to `/suspended`, and gate `/dashboard/*` on `onboarding_completed`.

**[BUILD]** Update `last_seen_at` at most once per five minutes, not on every request.

**Do not** make middleware the only check. Every page and route handler re-checks server-side.

## 3.3 Email and password

**[BUILD]** Signup: full name, email, phone, password. Phone regex `^(?:\+?88)?01[3-9]\d{8}$`, normalised to `01XXXXXXXXX` before storing so duplicate detection works.

**[BUILD]** Minimum 8 characters. Skip complexity theatre, it pushes people to `Password1!`. Check against a common-password list. Enable Supabase's leaked password protection.

**[BUILD]** Email verification, forgot password, reset password.

**[BUILD]** Rate limit login: 5 failures per email per 15 minutes, 20 per hour per IP.

## 3.4 Google OAuth

**[BUILD]** `/auth/callback/route.ts` exchanges the code and redirects. **Validate the `next` param** is a relative path starting with `/` and not `//evil.com`, or you have an open redirect.

**[BUILD]** Google users arrive with no phone number. `/onboarding` collects phone, district, business name and visibility preference, then sets `onboarding_completed`. The client needs phone numbers to run this business, so make phone required.

## 3.5 Concurrent session limiting

**[BUILD]** Your main anti-sharing control, and it matters more now that access is lifetime. A shared login is forever, not for a year.

On login: hash the session identifier, insert into `active_sessions` with device fingerprint (a stable hash of user agent, screen metrics and timezone), user agent and IP.

Count sessions with `last_heartbeat_at > now() - interval '5 minutes'`. **Limit 2.** Phone plus laptop works, sharing with four friends does not. On exceed, delete the oldest and sign that device out.

**[BUILD]** Client heartbeats to `/api/session/heartbeat` every 60 seconds while the tab is visible. If the response says revoked, sign out with a clear message: "You were signed out because your account was used on another device."

**[BUILD]** `/dashboard/settings/devices` lists active devices with a sign-out button. This turns a restriction into a feature and prevents support complaints.

## 3.6 Role guards

**[BUILD]** `lib/auth/guards.ts`: `requireUser()`, `requireAdmin()`, `requireOnboarded()`, `requireCourseAccess(courseId)`, `requireLessonAccess(lessonId)`, `requireBatchAccess(batchId)`, `requireEnrolledStudent()`. Call at the top of every protected page and route. Never check `role === 'admin'` inline, you will eventually miss one.

---

# PHASE 4: Payments, bKash Tokenized Checkout

The highest-risk surface in the project, and structurally different from SSLCommerz. Read this phase fully before writing any of it.

## 4.1 How bKash differs, and what it means

SSLCommerz pushes an IPN to your server. bKash Tokenized Checkout **does not**, in the standard flow. The payment is finalised by *your* server calling **Execute Payment** after the customer returns to your callback URL.

The consequences:

**There is a failure window.** If the customer completes payment in the bKash UI but their browser dies before hitting your callback, or your Execute call times out, money may have moved while your database still says `processing`. **Query Payment is how you resolve this**, and the reconciliation job is mandatory, not optional.

**Execute is not idempotent in your favour.** Calling Execute twice on the same paymentID errors the second time. Handle it: if Execute fails for any reason, immediately call Query Payment to find the true state rather than assuming failure.

**Tokens expire.** The `id_token` lives one hour, the refresh token 28 days. Serverless has no shared memory, so cache the token centrally with a lock so ten concurrent requests do not each call Grant Token.

**IP whitelisting.** Settled in Phase 0.6. If bKash requires it, all API calls route through your fixed-IP proxy.

## 4.2 Token management

**[BUILD]** `lib/bkash/token.ts`:

1. Read the cached token. If `id_token_expires_at` is more than 60 seconds away, return it.
2. If expired but the refresh token is valid, call **Refresh Token** (`POST /token/refresh`) with `app_key`, `app_secret` and the refresh token, plus `username` and `password` headers.
3. If the refresh token is also expired, call **Grant Token** (`POST /token/grant`) with `app_key` and `app_secret` in the body and `username` and `password` as headers.
4. Store the new `id_token`, `refresh_token` and both expiries. Subtract 60 seconds of safety margin when computing expiry from their `expires_in`.
5. Wrap in a distributed lock (Redis `SET NX` with a short TTL) so concurrent invocations do not stampede the endpoint.

**[BUILD]** Every subsequent call sends headers `Authorization: <id_token>` and `X-APP-Key: <app_key>`. The Authorization header is the raw token with **no `Bearer` prefix**, which trips people up.

**[BUILD]** Set a 30-second timeout on all bKash calls, which is their documented expectation.

## 4.3 Create Payment

**[BUILD]** `POST /api/payments/bkash/create`

1. `requireUser()`, `requireOnboarded()`
2. Validate the product exists and is active
3. Check the user does not already hold active access. If they do, return a friendly message rather than taking their money twice. This matters more with lifetime access.
4. Validate any coupon **server-side**: exists, active, in date window, under max uses, under per-user cap, meets minimum, applies to this product. Compute the discount server-side. **Never accept a discount or amount from the client.**
5. Compute the final amount from `products.price_bdt` minus the validated discount.
6. Generate `merchant_invoice_number`, e.g. `Z2B-` plus a nanoid. Insert the `payments` row as `pending` with user, product, amount, coupon, IP and user agent.
7. Call **Create Payment** (`POST /create`):
   - `mode`: `0011` (checkout without an agreement, correct for one-off course sales)
   - `payerReference`: the student's phone number
   - `callbackURL`: `https://zero2brands.com/api/payments/bkash/callback`
   - `amount`: string with two decimals, e.g. `"4999.00"`
   - `currency`: `"BDT"`
   - `intent`: `"sale"`
   - `merchantInvoiceNumber`: your generated ID
8. Store the returned `paymentID`, save the full response to `bkash_create_response`, set status `processing`.
9. Return `bkashURL`. The client redirects the customer there.
10. Fire `InitiateCheckout` (browser) and the CAPI counterpart with a shared `event_id`.

## 4.4 Callback and Execute

**[BUILD]** `GET /api/payments/bkash/callback`

bKash redirects the customer back with `paymentID` and `status` (`success`, `failure`, or `cancel`).

1. Read `paymentID` and `status` from the query string.
2. Look up the payment by `bkash_payment_id`. If not found, log and redirect to a generic failure page. Never trust the query string alone.
3. **Idempotency first.** If already `completed`, skip to the success redirect. Customers refresh and hit back.
4. If `status` is not `success`, mark `cancelled` or `failed` with the reason and redirect. Do not call Execute.
5. Call **Execute Payment** (`POST /execute`) with the `paymentID`.
6. **If Execute succeeds** and `transactionStatus` is `Completed`:
   - **Verify the amount.** Compare the returned `amount` against `payments.amount_bdt`. On mismatch, mark failed with `amount_mismatch`, alert admin, grant nothing.
   - Verify `currency` is `BDT`.
   - Proceed to grant (4.5).
7. **If Execute fails or times out**, do not assume failure. Call **Query Payment** (`POST /payment/status`). If Query reports completed, treat as success and grant. If Query reports anything else, mark failed with the reason. If Query itself fails, leave the payment `processing` and let reconciliation handle it, then show the customer the pending screen.
8. Redirect to `/payment/success?invoice=...`, `/payment/failed`, or `/payment/cancelled`.

## 4.5 Granting access

**[BUILD]** Runs inside a single Postgres transaction, ideally as one `SECURITY DEFINER` function, so a payment can never be marked complete without the matching enrollment.

1. Update the payment: status `completed`, store `bkash_trx_id`, `bkash_customer_msisdn`, `paid_at`, full `bkash_execute_response`.
2. Insert the enrollment:
   - Product type `course`: insert `enrollments`, no expiry.
   - Product type `batch`: insert `batch_enrollments`, and **if the batch has `includes_course_access = true`, also insert the `enrollments` row** for the linked course.
   - Product type `bundle`: iterate `bundle_items`.
   - Use `on conflict do nothing` so a retry cannot duplicate.
3. Increment coupon `used_count`, insert `coupon_redemptions`.
4. Insert an `audit_log` entry.

After the transaction commits, outside it:
5. Fire the CAPI `Purchase` event with the `event_id` matching the browser event.
6. Queue the confirmation email and SMS. An email failure must never roll back an enrollment.

## 4.6 The success page

**[BUILD]** The success page **grants nothing**. It looks up the payment by invoice number and:
- `completed`: show success, link straight into the course.
- `processing`: show "We are confirming your payment" and poll `/api/payments/bkash/status` every 3 seconds for up to 90 seconds. If it resolves, redirect. If not, show the invoice number and a support contact.

This is the correct behaviour for a gateway without an IPN. It handles the real failure window rather than pretending it does not exist.

## 4.7 Reconciliation, mandatory

**[BUILD]** Cron every 15 minutes:

1. Find payments in `processing` older than 10 minutes.
2. For each, call **Query Payment**.
3. If completed, run the grant path in 4.5 (idempotent, so a race with the callback is harmless), and email the student that access is now active.
4. If failed or cancelled, mark accordingly.
5. If still unknown after 24 hours, flag on the admin reconciliation report for manual review.

**Without this job, customers will pay and receive nothing.** It is the safety net the missing IPN leaves behind.

**[BUILD]** A daily cross-check: any `completed` payment with no matching enrollment, and any enrollment with no payment. Surface both on the admin report.

## 4.8 Optional IPN

**[BUILD]** If bKash enabled SNS-signed webhooks on your account, build `/api/payments/bkash/ipn`: verify the SNS signature against their certificate, parse, and run the same idempotent grant path. Treat it as an accelerator for reconciliation, not a replacement. Keep the polling job regardless.

## 4.9 Refunds

**[BUILD]** Admin action calling bKash **Refund** (`POST /payment/refund`) with `paymentID`, `trxID`, `amount`, `sku` and `reason`. Store the response. Then mark the payment `refunded` and set the enrollment `revoked` with a reason, in one transaction, plus an audit entry.

**[BUILD]** Refunds may be asynchronous. Build a **Refund Status** check and a small job polling pending refunds until resolved.

**[BUILD]** Separate admin action to revoke access without refunding, for terms violations such as content sharing.

## 4.10 Manual payment

**[BUILD]** A large share of Bangladeshi customers will send money to a personal bKash number and message on Facebook instead of using the gateway. Build for it or the client will be editing the database by hand within a week.

Admin screen: select or create a student, select product, enter amount, bKash reference number, note. Creates a `payments` row with gateway `manual`, status `completed`, plus the enrollment and an audit entry.

## 4.11 Testing

**[BUILD]** Never test against live credentials. Sandbox base URL, sandbox credentials, bKash's sandbox wallet numbers and OTP.

**[YOU]** Before launch, run **one real low-value transaction** on live, verify the whole chain, then refund it and verify revocation.

---

# PHASE 5: Video delivery and content security

## 5.1 The threat model, stated plainly

You cannot stop screen recording. Anyone can point a second phone at a monitor. What you can and must stop:

- **Link sharing.** The dominant attack in this market. Someone pastes a URL into a 200-person Messenger group.
- **Account sharing.** One purchase, five users. More costly now that access is lifetime.
- **Access after refund.**
- **Hotlinking and embedding elsewhere.**
- **Bulk download** via a script pulling the HLS manifest.

Short-lived signed tokens plus session limits plus watermarking handle all of those, and watermarking makes the leaks you cannot prevent **traceable**, which is most of the deterrent.

## 5.2 Token issuance

**[BUILD]** `POST /api/video/token`

1. `requireUser()`
2. Look up the lesson, confirm published.
3. Access check via `can_access_lesson`, which covers course access, preview lessons, batch-granted access and sequential unlocking. Otherwise 403 and log the attempt.
4. **Verify the user's session is live in `active_sessions`.** If stale, 401 and force re-auth. This is what stops a shared login streaming on five devices.
5. Rate limit: 40 token requests per user per hour. Normal viewing needs a handful, a scraper needs hundreds.
6. Generate the Bunny token: SHA256 of `token_key + video_id + expiry_unix`, formatted per Bunny's embed token spec. **Expiry 3 hours.** Long enough to watch without interruption, short enough that a leaked URL is worthless by the time it spreads.
7. Insert a `video_access_log` row.
8. Return the signed embed URL and the expiry.

**Never** put the token key in client code, never generate tokens client-side, never return a permanent URL.

## 5.3 Player

**[BUILD]** Bunny iframe embed with the signed URL. Do not build a custom HLS player. Theirs handles adaptive bitrate and mobile correctly and is free.

**[BUILD]** **Dynamic watermark**, the highest-value measure here. A semi-transparent overlay showing the student's phone number, repositioning every 25 seconds, `pointer-events: none`, above the iframe.

Be honest about its limit: someone can load the signed URL directly and bypass a CSS overlay. So **also** enable Bunny's own server-side watermark if your library supports it, since that burns into the stream. Use both, the overlay for visible deterrence and the server-side one for durability.

**[BUILD]** Cheap friction, worth adding, but do not believe it stops anyone technical: context menu disabled on the player container, common shortcuts swallowed, playback paused on `visibilitychange` (which also improves progress accuracy), and CSP `frame-ancestors 'self'`.

**[BUILD]** Do **not** add devtools detection loops or debugger traps. Trivially bypassed, they hurt low-end devices and make the product feel hostile.

## 5.4 Progress tracking

**[BUILD]** Listen to Bunny player events via `postMessage`. Debounce, send to `/api/video/progress` every 15 seconds and on pause, end and unmount.

**[BUILD]** Server-side, validate the increment against elapsed wall-clock time plus a margin. Otherwise a student posts `watched_seconds: 99999` and instantly earns a certificate, and with sequential unlocking they would also skip the whole course.

**[BUILD]** Complete at 90 percent or on `ended`. Store `last_position_seconds` for resume.

## 5.5 Upload flow

**[BUILD]** Direct-to-Bunny upload using **TUS resumable**, so a 500 MB file does not die at 80 percent on a flaky Dhaka connection.

Server creates the Bunny video object and returns the upload endpoint plus a short-lived signature. The browser uploads **directly to Bunny**, never proxied through Vercel. Server then stores the GUID.

**[BUILD]** Poll encoding status in the admin UI. A lesson cannot publish until encoding finishes, or students see a broken player. Pull duration from Bunny after encoding rather than asking the client to type it.

## 5.6 Image, text and resource lessons

**[BUILD]** Images in the private bucket, served via signed URLs generated server-side after the same access check. Never make the bucket public.

**[BUILD]** Text lessons: **sanitise on write**, server-side, strict allowlist. The client will paste from Word and Facebook. An XSS in a lesson body runs inside every student's authenticated session.

**[BUILD]** Resources: private bucket, signed URL on demand after access check, increment `download_count`, log it. Optionally stamp PDFs with the student's name server-side via pdf-lib.

---

# PHASE 6: Course delivery experience

## 6.1 Dashboard

**[BUILD]** `/dashboard`: continue-watching card deep-linked to the exact lesson and timestamp, course progress ring, upcoming live sessions with countdown, a few recently joined students from the community, and the GrayVally CTA once progress passes 80 percent.

**[BUILD]** `/dashboard/course` the player shell. One course at launch, so this is a direct route rather than an index. Sidebar shows the module and lesson tree with completion ticks and durations, collapsing into a sheet on mobile.

**[BUILD]** `/dashboard/course/[lessonSlug]`: player or image or text content, description, attached resources, mark-complete, previous and next, and a private notes field per lesson. Notes are genuinely valued and cheap to build.

**[BUILD]** Sequential unlocking driven by `courses.sequential_unlock`, enforced in `can_access_lesson`. Locked lessons render visibly locked with the reason, rather than being hidden, so the student understands the path.

**[BUILD]** Test the player on a real mid-range Android over mobile data. That is your actual user, not a resized desktop window.

## 6.2 Certificates

**[BUILD]** On completion, generate the PDF server-side, store it, create the `certificates` row with a sequential number.

**[BUILD]** Public `/verify/[certificateNumber]` returning only name, course and date. Students post these to Facebook, which is free marketing, so make the design good.

## 6.3 Resource library

**[BUILD]** `/dashboard/resources` aggregating every downloadable the student can access. Supplier lists, costing sheets, templates. High perceived value for a business course.

---

# PHASE 7: Community and student visibility

New in v2. Build it deliberately, because a social layer done carelessly leaks personal data.

## 7.1 Student directory

**[BUILD]** `/dashboard/community` listing students, reading **only** from `public_profiles`. Gated on `is_enrolled_student()`, so signed-up-but-unpaid users see nothing.

**[BUILD]** Card shows avatar, name, district, business name and category. Filter by district and category, search by name or business. Paginate, do not load every student at once.

**[BUILD]** Never expose email or phone in the directory, the API response, or the page source. Check the actual network payload, not just the rendered UI.

## 7.2 Public student profile

**[BUILD]** `/dashboard/community/[username]`: avatar, name, bio, district, business name and category, Facebook link only if `show_facebook` is true, member-since date, and courses or batches completed. Nothing else.

**[BUILD]** Respect `visibility`. A `private` profile returns 404 to other students, and the student sets this themselves in settings.

## 7.3 Batch-mates

**[BUILD]** Inside `/dashboard/my-batches/[slug]`, a members list reading the `batch_members` view, gated on `has_batch_access`. This is the strongest version of the social feature, because cohort peers are the ones students actually want to know.

## 7.4 Privacy controls

**[BUILD]** `/dashboard/settings` lets a student choose visibility (public, students only, private), edit bio and business details, and toggle whether their Facebook link is shown.

**[BUILD]** Default new students to `students_only`. Do not default to `public`. Explain the setting in one plain sentence.

**[CLIENT]** State clearly in the terms and at signup that other students will see their name, district and business name. Consent should be informed, not buried.

## 7.5 Moderation

**[BUILD]** Admin can hide a profile from the directory and ban a user. Banned users disappear from `public_profiles` automatically via the view's filter.

**[BUILD]** A report button on profiles writing to `reports` for admin review. Cheap now, painful to retrofit after the first incident.

**Deferred to v2:** comments, direct messaging, forums, posts. Those need real moderation tooling and the client is one person. Directory and batch-mates only at launch.

---

# PHASE 8: Live batches

## 8.1 Public pages

**[BUILD]** `/batches` listing upcoming and enrolling batches with start date, seats remaining and price.

**[BUILD]** `/batches/[slug]` sales page: what it covers, schedule, instructor, a **real** seat counter driven by `seats_taken` (never fake scarcity), whether recorded course access is included, FAQ, and enrol CTA. Handle four states: not yet open, open, full, closed.

## 8.2 Enrolled experience

**[BUILD]** `/dashboard/my-batches/[slug]`: session schedule in Asia/Dhaka, a join button appearing 15 minutes before and disappearing an hour after each session, gated group links, past session recordings, attendance record, and the batch-mates list from 7.3.

**[BUILD]** Fetch the Zoom URL through a server action on click. **Never render it into the initial HTML.** If it is in the page source it will be shared.

## 8.3 Reminders

**[BUILD]** Cron: email 24 hours before a session, SMS 1 hour before. SMS is what actually gets read here, so do not skip it. Log every send to prevent duplicates on cron retry.

## 8.4 Attendance and recordings

**[BUILD]** Record attendance when a student clicks join. Admin can also mark manually.

**[BUILD]** After each session the client uploads the recording via the same TUS flow, attached to the `live_sessions` row, visible only to that batch, played through the same signed-token player.

---

# PHASE 9: Admin panel

Built for one person now, structured for a team later. Every money-touching or access-touching action writes to `audit_log`.

**[BUILD]** `/admin` overview: revenue today, this week, this month; new enrollments; active students; **payments stuck in processing** (the bKash-specific metric that matters most); new leads; new store requests; upcoming sessions.

**[BUILD]** `/admin/courses` CRUD, drag-to-reorder modules and lessons, publish and unpublish, duplicate, sequential-unlock toggle.

**[BUILD]** `/admin/lessons` upload and edit with encoding status.

**[BUILD]** `/admin/batches` CRUD, session scheduling, seat management, private links, attendance.

**[BUILD]** `/admin/students` searchable and filterable by course, batch, district, status. Detail page: profile, enrollments, payments, per-lesson progress, active devices, video access log, community visibility. Actions: grant access manually, revoke, reset password, ban, unban, sign out all devices, hide from directory.

**[BUILD]** `/admin/payments` filters by status, gateway, date. Detail view showing the bKash create, execute and query responses side by side, which is exactly what you need when a customer disputes. Manual payment entry. Refund trigger. CSV export.

**[BUILD]** `/admin/reports`:
- **Reconciliation:** payments in `processing` over 10 minutes, `completed` payments with no enrollment, enrollments with no payment
- Revenue by product
- Completion rate
- **Piracy watchlist:** accounts with unusual token volume, many distinct IPs, or many device fingerprints

**[BUILD]** `/admin/leads`, `/admin/store-requests` and `/admin/reports` (moderation queue) with status pipelines and notes. A new store request **fires an email and SMS to GrayVally immediately.** A lead sitting unseen for two days is a lost sale.

**[BUILD]** `/admin/coupons`, `/admin/blog`, `/admin/settings` (site settings, testimonials, FAQs, announcement banner).

**[BUILD]** Role gating now, even with one user: `instructor` sees students and attendance but not payments or settings; `admin` sees everything except role changes; `superadmin` changes roles. Retrofitting roles later is painful.

---

# PHASE 10: Marketing site

## 10.1 Pages

**[BUILD]** Home, About (founder story, the main trust driver in this market), the single Course sales page, Batches index and detail, Build Your Store, Blog, FAQ, Contact, Privacy, Terms, Refund Policy, certificate verification, payment result pages.

With one course, the home page and the course sales page are close relatives. Consider making the home page the sales page with other sections layered around it, rather than forcing a `/courses` index for a list of one.

## 10.2 Course sales page

**[BUILD]** Hero with the outcome promise and price. Free preview video, ungated. What you will learn. **Full curriculum accordion** showing every module and lesson title with durations, which builds confidence in the depth. Who it is for and who it is not for. Instructor credibility. Testimonials with photos. What is included, **stating lifetime access explicitly** since that is a real differentiator against subscription competitors. Mention the student community, which is a genuine selling point. Pricing with the compare-at price. FAQ covering refunds, device limits, language, and how live batches differ. Final CTA. Sticky mobile buy bar.

## 10.3 GrayVally section

**[BUILD]** `/build-your-store` as a real service page: what GrayVally builds, the stack in plain language, what a store includes (payments, courier integration, product management), a portfolio strip, indicative timeline, lead form.

**[BUILD]** Dashboard CTA at 80 percent progress: "Ready to launch? Let our partner build your store." Routes to `/dashboard/store-request` prefilled from the profile.

**[BUILD]** Instrument it: CTA impression, click and submission as three separate events, so the funnel is measurable.

## 10.4 Legal

**[BUILD]** Required, not optional. Google OAuth verification checks them and bKash merchant review checks them.

**[CLIENT]** Must cover: data collected, **that other students see their name, district and business name**, how video access works, the two-device limit, the content-sharing prohibition and its consequence, refund policy with a specific window, dispute handling, and a physical address.

State explicitly that account sharing or content redistribution ends access without refund. You need this in writing before you can enforce it.

## 10.5 Design

**[BUILD]** Premium means restrained. One strong typeface pairing, a disciplined scale, generous whitespace, one accent colour. Avoid the black-gold-red coaching palette, the audience is tired of it and it reads as low trust.

**[BUILD]** Every page fast and legible on a mid-range Android over 3G. Test throttled, not on your desk. A beautiful site that takes 9 seconds loses the sale before it renders.

**[BUILD]** One deliberate motion moment, not fade-up on every section. Respect `prefers-reduced-motion`.

---

# PHASE 11: SEO

## 11.1 Technical

**[BUILD]** `app/sitemap.ts` generating from the published course, batches and blog posts plus static pages.

**[BUILD]** `app/robots.ts`: allow marketing, **disallow** `/dashboard`, `/admin`, `/api`, `/auth`. The community directory sits under `/dashboard` so it is excluded automatically, which is correct: student profiles must never be indexed.

**[BUILD]** Canonical URLs everywhere. Pick non-www and 301 www to it.

**[BUILD]** Metadata API on every route, sourced from `seo_title` and `seo_description` with sensible fallbacks.

**[BUILD]** OpenGraph and Twitter cards on every page, with dynamic OG images via `next/og` for the course, batches and blog posts. This matters more than usual because Facebook is the primary distribution channel.

**[BUILD]** JSON-LD: `Organization` on home, `Course` on the course page with offers in BDT, `BlogPosting` on posts, `FAQPage`, `BreadcrumbList`. Add `AggregateRating` **only if ratings are real.**

**[BUILD]** `app/manifest.ts` for PWA basics. Students will add it to their home screen.

## 11.2 Performance

**[BUILD]** Target LCP under 2.5s on mobile, CLS under 0.1, INP under 200ms.

- `next/image` everywhere with explicit dimensions
- `next/font` with `display: swap`, preload the primary face only
- Server components by default
- Route-level loading skeletons
- Lazy load the player, GSAP and anything below the fold
- ISR or static generation for marketing pages, revalidated on publish

## 11.3 Content

**[CLIENT]** This is where traffic actually comes from, and it is the client's work.

Topics with real Bangladeshi search intent: wholesale clothing sourcing in Islampur and Keraniganj, garment costing and pricing, starting a clothing business with small capital, courier comparison for Bangladeshi e-commerce, photographing clothes with a phone, Facebook page setup for a clothing brand, trade licence process.

Each post ends with a soft CTA into the course. Twenty solid posts beats two hundred thin ones.

**[BUILD]** If writing in Bangla, set `lang="bn"` on those pages. Do not machine-translate.

## 11.4 Submission

**[YOU]** Submit the sitemap in Search Console and Bing Webmaster Tools after launch.

**[YOU]** Google Business Profile if there is a physical office.

**[YOU]** Weekly: check coverage errors, and **verify `/dashboard` and `/admin` are not indexed.** If they are, your robots rules are wrong and student profiles are public.

---

# PHASE 12: Meta Pixel, CAPI and analytics

## 12.1 Browser pixel

**[BUILD]** Load via `next/script` with `strategy="afterInteractive"`.

**[BUILD]** Fire `PageView` on route change. App Router does not do this automatically, you need a `usePathname` listener.

**[BUILD]** Events, each with a client-generated `eventID` also passed server-side:
- `ViewContent` on the course and batch sales pages
- `InitiateCheckout` on buy click
- `Lead` on store request and newsletter
- `CompleteRegistration` on signup
- `Purchase` on the success page

## 12.2 Conversions API

**[BUILD]** `Purchase` fires server-side **from the grant path in 4.5**, the only place you know a payment truly succeeded. Critically, it must also fire from the **reconciliation job**, or every payment recovered by polling is invisible to Meta and the client optimises ads on incomplete data.

**[BUILD]** Deduplication: same `event_id` and `event_name` from browser and server. Get this wrong and reported revenue doubles.

**[BUILD]** Hashed match keys, SHA256: email lowercased and trimmed, phone in E.164 (`8801XXXXXXXXX`), first and last name, city, country `bd`. Plus unhashed `client_ip_address`, `client_user_agent`, `fbp` and `fbc`. Higher match quality means cheaper ads, which is the whole point.

**[BUILD]** `action_source: 'website'`, correct `event_source_url`.

**[YOU]** Verify in Events Manager > Test Events that both sides arrive and deduplicate. Push Event Match Quality to at least "Good". **Remove `META_TEST_EVENT_CODE` before launch.**

## 12.3 GA4 and attribution

**[BUILD]** GA4 page views on route change, key conversions mirrored, `purchase` marked as a conversion.

**[BUILD]** Capture UTM parameters on first landing, persist to a cookie, attach to `leads` and `payments`. Without this the client cannot tell which ad produced a sale and will waste money.

---

# PHASE 13: Email and SMS

## 13.1 Email templates

**[BUILD]** React Email or clean inline-CSS HTML, tested in Gmail mobile.

- Welcome and verification
- Password reset
- **Purchase confirmation** with bKash trxID, invoice number, amount and a direct course link
- **Access activated** (sent when reconciliation recovers a delayed payment, so the customer is not left wondering)
- Enrollment granted manually
- Batch enrollment with schedule
- Session reminder, 24 hours
- Session cancelled or rescheduled
- Course completion with certificate
- Refund processed
- Store request received, and new store request to GrayVally
- Device signed out

Removed from v1: access-expiring warning. Access is lifetime.

**[BUILD]** Log every send to `email_log` with the provider message ID. Include a plain-text version, it helps deliverability.

## 13.2 SMS templates

SMS is read more reliably than email here.

**[BUILD]** Purchase confirmation (short: course name plus link), session reminder 1 hour before, session cancelled, OTP if phone auth is added later.

**[BUILD]** Keep English under 160 characters. Bangla hits the 70-character Unicode segment limit.

**[BUILD]** Log to `sms_log` with cost per send.

**[BUILD]** No marketing SMS without consent. BTRC and the carriers take unsolicited bulk SMS seriously and will suspend the sender ID.

## 13.3 Queueing

**[BUILD]** Never send inside the payment transaction, and never inline in a request the user is waiting on. Send after commit with failures logged and swallowed. Move to a `notification_queue` table drained by cron when volume justifies it.

---

# PHASE 14: Security hardening

## 14.1 Headers

**[BUILD]**

```
Content-Security-Policy      (below)
Strict-Transport-Security    max-age=31536000; includeSubDomains
X-Frame-Options              DENY
X-Content-Type-Options       nosniff
Referrer-Policy              strict-origin-when-cross-origin
Permissions-Policy           camera=(), microphone=(), geolocation=()
```

**[BUILD]** CSP, built explicitly rather than with blanket `unsafe-inline`:
- `default-src 'self'`
- `frame-src` allowing `iframe.mediadelivery.net` (Bunny) and bKash's checkout host
- `script-src 'self'` plus nonces, `connect.facebook.net`, `www.googletagmanager.com`, and bKash's checkout script host
- `img-src 'self' data: blob:` plus Bunny CDN, Supabase storage, `www.facebook.com`
- `media-src` the Bunny CDN host
- `connect-src 'self'` plus Supabase, `graph.facebook.com`, `www.google-analytics.com`, Sentry
- `frame-ancestors 'self'`
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`

Start in **report-only**, collect violations for a few days, then enforce. Enforcing a wrong CSP on launch day breaks both video playback and checkout.

## 14.2 Rate limiting

**[BUILD]** Upstash Redis, per-IP and per-user:

- Login: 5 per 15 min per email, 20 per hour per IP
- Signup: 3 per hour per IP
- Password reset: 3 per hour per email
- **Payment create: 5 per hour per user.** Each one creates a bKash paymentID and hammering it looks like abuse to them.
- Video token: 40 per hour per user
- Public forms: 5 per hour per IP
- **Community directory: 100 per hour per user**, so nobody scrapes the student list
- Global ceiling per IP on all API routes

**[YOU]** Cloudflare > Security > WAF: managed ruleset, Bot Fight Mode, and a rate limit rule on `/api/*` as a second layer in front of the app.

## 14.3 Input validation

**[BUILD]** Every server action and route handler validates with zod before touching the database. Parse, do not cast.

**[BUILD]** Sanitise all admin-authored HTML **on write**, server-side, strict allowlist. Never only on render.

**[BUILD]** Sanitise student-authored bio text too. It renders on public profiles now, so it is an XSS vector like any other.

**[BUILD]** File uploads: check MIME and magic bytes server-side, enforce size caps, generate your own filenames.

## 14.4 Secrets

**[BUILD]** `server-only` guards on `admin.ts`, `lib/bkash/*`, `lib/bunny/token.ts`, `lib/sms/*`.

**[BUILD]** **Audit the client bundle before launch.** Build and grep the output for `SUPABASE_SERVICE_ROLE_KEY`, `BUNNY_STREAM_TOKEN_KEY`, `BKASH_APP_SECRET`, `BKASH_PASSWORD`. Any of these in a JS chunk is a total compromise.

**[YOU]** Rotate every key ever pasted into a chat, doc or screenshot before going live.

## 14.5 Database

**[BUILD]** A CI test querying `pg_tables` that **fails if any public table has RLS disabled.**

**[BUILD]** A CI test asserting every view used for student visibility has `security_invoker = true`. A view without it runs as its owner and bypasses RLS entirely, which would expose the full profiles table including phone numbers.

**[BUILD]** Pin `search_path` on all SECURITY DEFINER functions.

**[BUILD]** Revoke column-level UPDATE on `profiles.role`, `is_banned`, `admin_notes` from `authenticated`.

**[YOU]** Supabase > Authentication > Rate limits: tighten signup defaults. Enable leaked password protection.

## 14.6 Abuse detection

**[BUILD]** Nightly job flagging accounts with over 8 distinct IPs in 24 hours, over 3 device fingerprints, token requests above the 95th percentile, or logins from many districts in a day.

**Do not auto-ban.** Bangladeshi mobile carriers rotate IPs aggressively and false positives are common. Surface on the admin watchlist for human review.

## 14.7 Operational

**[BUILD]** Sentry for client, server and edge, with alerts on new error types.

**[BUILD]** `/api/health` checking database connectivity, plus uptime monitoring on it and the home page.

**[YOU]** 2FA on every service account: GitHub, Vercel, Supabase, Cloudflare, Bunny, Resend, Meta, Google Cloud, bKash merchant portal.

**[YOU]** Shared password manager, not messages. You and the client both need recovery access.

## 14.8 Backups

**[YOU]** Supabase Pro for point-in-time recovery, before taking real money.

**[BUILD]** Weekly cron exporting payments, enrollments and profiles to CSV in a separate bucket. Redundant backup outside Supabase.

**[YOU]** **Test a restore once before launch.** An untested backup is not a backup.

---

# PHASE 15: Testing and QA

## 15.1 Automated

**[BUILD]** Unit tests: coupon discount calculation, price computation, Bunny token generation, bKash header construction, phone normalisation, access-check logic, sequential-unlock logic, progress validation.

**[BUILD]** **RLS integration tests against a local Supabase.** The highest-value tests in the project. Verify that an unenrolled user cannot:
- select `bunny_video_id` from lessons
- read another user's payments
- read `batch_private_links` or a Zoom URL
- insert their own enrollment
- read `profiles` directly for another user (phone and email must be unreachable)
- read the community directory at all without an active enrollment
- read a `private` profile
- read `bkash_tokens` under any circumstances

Write these before you trust the schema.

**[BUILD]** E2E (Playwright): signup, Google login, onboarding, browse the course, **sandbox bKash purchase end to end**, watch a lesson, resume, hit a locked lesson and get blocked, view the community directory, open a private profile and get 404, admin manual grant, admin revoke, concurrent session eviction.

**[BUILD]** CI running typecheck, lint, unit and integration tests on every pull request.

## 15.2 Manual, bKash specific

**[YOU]** Test the **failure window** deliberately. Complete a sandbox payment, then close the browser before the callback fires. Confirm reconciliation finds it within 15 minutes, grants access, and sends the activation email.

**[YOU]** Test a **double callback**: hit the callback URL twice with the same paymentID. Confirm no double enrollment, no double email, no error shown to the customer.

**[YOU]** Test **token expiry**: force the cached bKash token to expire and confirm the refresh path works without a failed payment.

**[YOU]** Test an **Execute timeout** by blocking the call, and confirm the Query fallback resolves correctly.

**[YOU]** Test **amount tampering**: modify the client request to send a lower amount and confirm the server ignores it entirely.

## 15.3 Manual, general

**[YOU]** Test on a real mid-range Android over mobile data. Video start time, quality adaptation, watermark rendering, and the bKash redirect returning correctly in a mobile browser.

**[YOU]** Try to break access control deliberately: hit a lesson URL logged out, reuse a signed video URL after 4 hours, log in on three devices, share a login and watch simultaneously, open a private profile, browse the directory from an unpaid account.

**[YOU]** Check the community directory's **network payload**, not just the UI, for any leaked email or phone.

**[YOU]** Email deliverability to Gmail, Yahoo and a corporate address. Verify SPF, DKIM and DMARC pass via mail-tester.com.

**[YOU]** SMS delivery to Grameenphone, Robi, Banglalink and Teletalk. Coverage differs by carrier.

**[YOU]** Lighthouse mobile on home and the course page. Fix anything under 90 on performance.

---

# PHASE 16: Launch

## 16.1 Content load

**[CLIENT]** All videos uploaded, descriptions written, resources attached, FAQ written, testimonials added, pricing final.

**[YOU]** Verify every video plays, every resource downloads, durations are correct.

## 16.2 Switch to production

**[YOU]** `BKASH_IS_SANDBOX=false`, live base URL, live credentials, **Production environment only**.

**[YOU]** Confirm the production server IP (or proxy IP) is whitelisted with bKash.

**[YOU]** Register the production callback URL with bKash.

**[YOU]** Remove `META_TEST_EVENT_CODE`.

**[YOU]** Supabase Auth Site URL and Redirect URLs to production.

**[YOU]** Google OAuth origins and redirect URIs to production. **Publish the consent screen from Testing to Production.**

**[YOU]** Bunny production library, allowed referrers include the production domain.

**[YOU]** `NEXT_PUBLIC_SITE_URL` to production.

## 16.3 Domain go-live

**[YOU]** Vercel > Settings > Domains: add `zero2brands.com` and `www.zero2brands.com`. Add the records Vercel specifies in Cloudflare.

**[YOU]** Keep Cloudflare **proxied** and set SSL to **Full (Strict)**. WAF and rate limiting in front of your API routes is worth more than the marginal simplicity of DNS-only. Sequence it: add the domain in Vercel, wait for the certificate, then switch SSL mode. Switching first causes a redirect loop.

**[YOU]** 301 www to non-www, one canonical host.

**[YOU]** Verify HTTPS, valid certificate, no mixed content.

**[YOU]** Test from a Bangladeshi mobile connection, not a VPN.

## 16.4 Final checks

**[YOU]** Submit the sitemap to Search Console.
**[YOU]** Verify the Meta pixel on production with the Pixel Helper extension.
**[YOU]** Confirm the CSP is enforcing and both video and bKash checkout still work.
**[YOU]** Confirm `/dashboard` and `/admin` redirect correctly when logged out, and are not indexed.
**[YOU]** Confirm the community directory is inaccessible to a signed-up-but-unpaid account.
**[YOU]** **Run one real bKash transaction on live for a small amount.** Verify: payment recorded, enrollment created, email sent, SMS sent, Meta Purchase received. Then refund it and verify revocation.
**[YOU]** Confirm the reconciliation cron is running and logging.
**[YOU]** Cloudflare WAF rules and rate limits active.
**[YOU]** Uptime alerts going to a phone you will actually see.

---

# PHASE 17: Post-launch operations

**[BUILD]** Cron jobs (Vercel Cron, guarded by `CRON_SECRET`):
- **Every 15 min: bKash reconciliation.** The most important job in the system.
- Hourly: clean stale sessions; send due session reminders
- Daily: abuse detection scan; payment and enrollment cross-check; refund status polling
- Weekly: backup export; admin summary email with revenue and enrollment numbers

**[YOU]** Week one: watch Sentry daily, watch the reconciliation report **daily**, and answer every support message fast. Early trust compounds in this market.

**[YOU]** Week two onward: review the abuse watchlist, the moderation queue, Search Console coverage, Meta Event Match Quality, and confirm the store request pipeline is being worked.

## Deliberately deferred to v2

Quizzes and assessments. Comments, DMs and forums. Affiliate and referral programme. Instructor payouts. Mobile app. Multi-language UI. Automated Zoom meeting creation. Card payments or a second gateway. Enterprise DRM. AI captions. **Multi-tenant storefront provisioning for graduates**, which is the real long-term GrayVally play and deserves its own project plan.

---

# Critical path

Start these on day one, in this order of urgency:

1. **bKash merchant application.** Two to four weeks. Blocks launch entirely. Ask about IP whitelisting in the first conversation.
2. **bKash sandbox credentials.** Request immediately, do not wait for full approval.
3. **SMS masked sender ID.** Several days.
4. **Client content production.** Usually the real bottleneck. Chase from week one.
5. **Google OAuth consent publishing.** Needs live legal pages first.
6. **Meta domain verification.** Quick, but needed before ad spend.

Build order that avoids rework: Phase 0 fully, then 1, then 2 (schema and RLS with tests), then 3, then 4 and 5 in parallel, then 6, 7 and 8, then 9, then 10 and 11 together, then 12 and 13, then 14, 15, 16.

**Do not build the marketing site first.** It is the most visible and the most tempting, and it is worthless without the platform working underneath it.

---

# The three things not to get wrong

**1. Access control, now including the social layer.** Assume the anon key is public, because it is. If an unenrolled user can select `bunny_video_id`, or a view is missing `security_invoker`, the content library and every student's phone number are public. Write the RLS integration tests before the marketing site.

**2. bKash reconciliation.** There is no IPN. If you skip the polling job, customers will pay and receive nothing, and you will find out from angry Facebook comments rather than from your own dashboard.

**3. The student directory payload.** A social feature is the easiest place to leak personal data. Read from `public_profiles` only, gate it on active enrollment, and inspect the actual network response before launch, not the rendered page.
