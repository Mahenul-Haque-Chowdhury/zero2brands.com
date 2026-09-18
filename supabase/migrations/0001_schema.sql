-- =============================================================================
-- Zero2Brands: Core schema
-- Migration: 0001_schema.sql
--
-- Every table, enum, trigger and function referenced by
-- 0002_rls_policies.sql is defined here. This file is the foundation that
-- migration depends on; keep names and column shapes in sync with it.
--
-- Design notes:
--   * Lifetime access on the recorded course: no expiry columns anywhere.
--   * RLS is enabled in 0002; this file only creates structure.
--   * All SECURITY DEFINER functions pin search_path (see 0002 for the
--     access-check functions themselves — this file only carries the
--     trigger functions that mutate data, per Phase 2.3 of the plan).
-- =============================================================================


-- =============================================================================
-- SECTION 0: EXTENSIONS
-- =============================================================================

create extension if not exists "pgcrypto";


-- =============================================================================
-- SECTION 1: ENUMS
-- =============================================================================

create type user_role as enum ('student', 'instructor', 'admin', 'superadmin');
create type enrollment_status as enum ('active', 'revoked');
create type payment_status as enum ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
create type payment_gateway as enum ('bkash', 'manual', 'free');
create type lesson_type as enum ('video', 'image', 'text', 'resource');
create type batch_status as enum ('upcoming', 'enrolling', 'running', 'completed', 'cancelled');
create type product_type as enum ('course', 'batch', 'bundle');
create type store_request_status as enum ('new', 'contacted', 'in_progress', 'delivered', 'declined');
create type lead_source as enum ('organic', 'facebook', 'referral', 'webinar', 'other');
create type profile_visibility as enum ('public', 'students_only', 'private');


-- =============================================================================
-- SECTION 2: PROFILES
-- =============================================================================

create table profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  username               text unique,
  full_name              text,
  email                  text unique not null,
  phone                  text unique,
  phone_verified         boolean not null default false,
  avatar_url             text,
  role                   user_role not null default 'student',
  bio                    text,
  district               text,
  facebook_url           text,
  business_name          text,
  business_category      text,
  visibility             profile_visibility not null default 'students_only',
  show_facebook          boolean not null default false,
  onboarding_completed   boolean not null default false,
  is_banned              boolean not null default false,
  ban_reason             text,
  admin_notes            text,
  last_seen_at           timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table profiles is
  'One row per auth.users row, created by handle_new_user(). Students read only their own row directly; cross-student visibility goes through public_profiles.';


-- =============================================================================
-- SECTION 3: COURSE CONTENT
-- =============================================================================

create table courses (
  id                      uuid primary key default gen_random_uuid(),
  slug                    text unique not null,
  title                   text not null,
  subtitle                text,
  description             text,
  outcomes                jsonb,
  requirements            jsonb,
  thumbnail_url           text,
  trailer_video_id        text,
  price_bdt               integer not null,
  compare_at_price_bdt    integer,
  is_published            boolean not null default false,
  is_primary              boolean not null default false,
  sequential_unlock       boolean not null default true,
  sort_order              integer,
  total_lessons           integer not null default 0,
  total_duration_seconds  integer not null default 0,
  seo_title               text,
  seo_description         text,
  og_image_url            text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table modules (
  id             uuid primary key default gen_random_uuid(),
  course_id      uuid not null references courses(id) on delete cascade,
  title          text not null,
  description    text,
  sort_order     integer not null,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (course_id, sort_order)
);

create table lessons (
  id                uuid primary key default gen_random_uuid(),
  module_id         uuid not null references modules(id) on delete cascade,
  course_id         uuid not null references courses(id) on delete cascade,
  slug              text not null,
  title             text not null,
  description       text,
  type              lesson_type not null default 'video',
  bunny_video_id    text,
  duration_seconds  integer not null default 0,
  content_html      text,
  image_paths       jsonb,
  sort_order        integer not null,
  global_order      integer,
  is_preview        boolean not null default false,
  is_published      boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (course_id, slug),
  unique (module_id, sort_order)
);

create table lesson_resources (
  id                 uuid primary key default gen_random_uuid(),
  lesson_id          uuid not null references lessons(id) on delete cascade,
  title              text not null,
  storage_path       text not null,
  file_size_bytes    bigint,
  mime_type          text,
  download_count     integer not null default 0,
  sort_order         integer,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);


-- =============================================================================
-- SECTION 4: PRODUCTS, BATCHES
-- =============================================================================

create table batches (
  id                        uuid primary key default gen_random_uuid(),
  slug                      text unique not null,
  course_id                 uuid references courses(id) on delete set null,
  title                     text not null,
  description               text,
  thumbnail_url             text,
  price_bdt                 integer not null,
  compare_at_price_bdt      integer,
  includes_course_access    boolean not null default true,
  seat_limit                integer not null,
  seats_taken               integer not null default 0,
  enrollment_opens_at       timestamptz,
  enrollment_closes_at      timestamptz,
  starts_at                 timestamptz not null,
  ends_at                   timestamptz,
  status                    batch_status not null default 'upcoming',
  schedule_note             text,
  instructor_id             uuid references profiles(id) on delete set null,
  seo_title                 text,
  seo_description           text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  constraint seats_taken_within_limit check (seats_taken <= seat_limit)
);

create table batch_private_links (
  batch_id             uuid primary key references batches(id) on delete cascade,
  whatsapp_group_url   text,
  facebook_group_url   text,
  telegram_url         text,
  updated_at           timestamptz not null default now()
);

create table products (
  id           uuid primary key default gen_random_uuid(),
  type         product_type not null,
  course_id    uuid references courses(id) on delete cascade,
  batch_id     uuid references batches(id) on delete cascade,
  title        text not null,
  price_bdt    integer not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint products_scope_check check (
    (type = 'course' and course_id is not null and batch_id is null)
    or (type = 'batch' and batch_id is not null and course_id is null)
    or (type = 'bundle' and course_id is null and batch_id is null)
  )
);

create table bundle_items (
  id                  uuid primary key default gen_random_uuid(),
  bundle_product_id   uuid not null references products(id) on delete cascade,
  course_id           uuid references courses(id) on delete cascade,
  batch_id            uuid references batches(id) on delete cascade,
  created_at          timestamptz not null default now(),
  constraint bundle_items_one_target check (
    (course_id is not null and batch_id is null)
    or (course_id is null and batch_id is not null)
  )
);


-- =============================================================================
-- SECTION 5: ENROLLMENTS
-- =============================================================================

create table enrollments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  course_id           uuid not null references courses(id) on delete cascade,
  payment_id          uuid, -- FK added after payments table exists
  status              enrollment_status not null default 'active',
  granted_at          timestamptz not null default now(),
  revoked_at          timestamptz,
  revoked_reason      text,
  completed_at        timestamptz,
  progress_percent    integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id, course_id)
);

create table batch_enrollments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references profiles(id) on delete cascade,
  batch_id             uuid not null references batches(id) on delete cascade,
  payment_id           uuid, -- FK added after payments table exists
  status               enrollment_status not null default 'active',
  granted_at           timestamptz not null default now(),
  revoked_at           timestamptz,
  revoked_reason       text,
  attendance_count     integer not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id, batch_id)
);


-- =============================================================================
-- SECTION 6: LIVE SESSIONS
-- =============================================================================

create table live_sessions (
  id                          uuid primary key default gen_random_uuid(),
  batch_id                    uuid not null references batches(id) on delete cascade,
  title                       text not null,
  description                 text,
  scheduled_at                timestamptz not null,
  duration_minutes            integer not null default 90,
  zoom_meeting_id             text,
  zoom_join_url               text,
  zoom_password               text,
  recording_bunny_video_id    text,
  is_cancelled                boolean not null default false,
  sort_order                  integer,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create table session_attendance (
  id                uuid primary key default gen_random_uuid(),
  live_session_id   uuid not null references live_sessions(id) on delete cascade,
  user_id           uuid not null references profiles(id) on delete cascade,
  joined_at         timestamptz,
  marked_by         uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  unique (live_session_id, user_id)
);


-- =============================================================================
-- SECTION 7: PAYMENTS AND BKASH
-- =============================================================================

create table payments (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references profiles(id) on delete cascade,
  product_id                  uuid not null references products(id) on delete restrict,
  merchant_invoice_number     text unique not null,
  gateway                     payment_gateway not null,
  bkash_payment_id            text unique,
  bkash_trx_id                text,
  bkash_payer_reference       text,
  bkash_customer_msisdn       text,
  amount_bdt                  integer not null,
  discount_bdt                integer not null default 0,
  coupon_id                   uuid, -- FK added after coupons table exists
  status                      payment_status not null default 'pending',
  bkash_create_response       jsonb,
  bkash_execute_response      jsonb,
  bkash_query_response        jsonb,
  paid_at                     timestamptz,
  refunded_at                 timestamptz,
  refund_reason               text,
  failure_reason               text,
  ip_address                  inet,
  user_agent                  text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

alter table enrollments
  add constraint enrollments_payment_id_fkey
  foreign key (payment_id) references payments(id) on delete set null;

alter table batch_enrollments
  add constraint batch_enrollments_payment_id_fkey
  foreign key (payment_id) references payments(id) on delete set null;

create table bkash_tokens (
  id                          integer primary key default 1,
  id_token                    text,
  refresh_token                text,
  id_token_expires_at         timestamptz,
  refresh_token_expires_at    timestamptz,
  updated_at                  timestamptz not null default now(),
  constraint bkash_tokens_single_row check (id = 1)
);


-- =============================================================================
-- SECTION 8: COUPONS
-- =============================================================================

create table coupons (
  id                    uuid primary key default gen_random_uuid(),
  code                  text unique not null,
  discount_type         text not null check (discount_type in ('percent', 'fixed')),
  discount_value        integer not null,
  max_uses              integer,
  used_count            integer not null default 0,
  per_user_limit        integer not null default 1,
  product_id            uuid references products(id) on delete cascade,
  min_amount_bdt        integer,
  starts_at             timestamptz,
  ends_at               timestamptz,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table payments
  add constraint payments_coupon_id_fkey
  foreign key (coupon_id) references coupons(id) on delete set null;

create table coupon_redemptions (
  id            uuid primary key default gen_random_uuid(),
  coupon_id     uuid not null references coupons(id) on delete cascade,
  user_id       uuid not null references profiles(id) on delete cascade,
  payment_id    uuid references payments(id) on delete set null,
  created_at    timestamptz not null default now()
);


-- =============================================================================
-- SECTION 9: PROGRESS, NOTES, SESSIONS, LOGS
-- =============================================================================

create table lesson_progress (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references profiles(id) on delete cascade,
  lesson_id                   uuid not null references lessons(id) on delete cascade,
  course_id                   uuid not null references courses(id) on delete cascade,
  watched_seconds             integer not null default 0,
  last_position_seconds       integer not null default 0,
  is_completed                boolean not null default false,
  completed_at                timestamptz,
  first_viewed_at             timestamptz,
  last_viewed_at              timestamptz,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table lesson_notes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  lesson_id     uuid not null references lessons(id) on delete cascade,
  content       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table active_sessions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles(id) on delete cascade,
  session_token_hash     text unique not null,
  device_fingerprint     text,
  user_agent             text,
  ip_address             inet,
  last_heartbeat_at      timestamptz not null default now(),
  created_at             timestamptz not null default now()
);

create table video_access_log (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  lesson_id          uuid references lessons(id) on delete set null,
  bunny_video_id     text,
  ip_address         inet,
  user_agent         text,
  token_issued_at    timestamptz not null default now()
);


-- =============================================================================
-- SECTION 10: LEADS, STORE REQUESTS, CERTIFICATES, REPORTS
-- =============================================================================

create table store_requests (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references profiles(id) on delete set null,
  full_name           text not null,
  phone               text not null,
  email               text,
  business_name       text,
  product_category    text,
  budget_range        text,
  message             text,
  status              store_request_status not null default 'new',
  assigned_to         uuid references profiles(id) on delete set null,
  internal_notes      text,
  source              text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table leads (
  id                    uuid primary key default gen_random_uuid(),
  full_name             text,
  phone                 text,
  email                 text,
  source                lead_source,
  utm_source            text,
  utm_medium            text,
  utm_campaign          text,
  utm_term              text,
  utm_content           text,
  converted_user_id     uuid references profiles(id) on delete set null,
  created_at            timestamptz not null default now()
);

create table certificates (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references profiles(id) on delete cascade,
  course_id              uuid references courses(id) on delete set null,
  batch_id               uuid references batches(id) on delete set null,
  certificate_number     text unique not null,
  issued_at              timestamptz not null default now(),
  pdf_storage_path       text,
  is_revoked             boolean not null default false,
  created_at             timestamptz not null default now()
);

create table reports (
  id                    uuid primary key default gen_random_uuid(),
  reporter_id           uuid not null references profiles(id) on delete cascade,
  reported_user_id      uuid not null references profiles(id) on delete cascade,
  reason                text,
  status                text not null default 'open',
  admin_notes           text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);


-- =============================================================================
-- SECTION 11: SITE CONTENT
-- =============================================================================

create table blog_posts (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  title               text not null,
  excerpt             text,
  content_html        text,
  cover_image_url     text,
  author_id           uuid references profiles(id) on delete set null,
  is_published        boolean not null default false,
  published_at        timestamptz,
  seo_title           text,
  seo_description     text,
  og_image_url        text,
  lang                text not null default 'en',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table faqs (
  id              uuid primary key default gen_random_uuid(),
  question        text not null,
  answer          text not null,
  category        text,
  sort_order      integer,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table testimonials (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  role            text,
  business_name   text,
  photo_url       text,
  quote           text not null,
  rating          integer check (rating between 1 and 5),
  is_published    boolean not null default false,
  sort_order      integer,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table site_settings (
  key            text primary key,
  value          jsonb not null,
  updated_at     timestamptz not null default now()
);


-- =============================================================================
-- SECTION 12: AUDIT AND MESSAGE LOGS
-- =============================================================================

create table audit_log (
  id             uuid primary key default gen_random_uuid(),
  actor_id       uuid references profiles(id) on delete set null,
  action         text not null,
  entity_type    text,
  entity_id      uuid,
  before         jsonb,
  after          jsonb,
  created_at     timestamptz not null default now()
);

create table email_log (
  id                    uuid primary key default gen_random_uuid(),
  recipient             text not null,
  template              text,
  provider_message_id   text,
  status                text,
  error                 text,
  created_at            timestamptz not null default now()
);

create table sms_log (
  id             uuid primary key default gen_random_uuid(),
  recipient      text not null,
  template       text,
  cost_bdt       numeric(10,2),
  status         text,
  error          text,
  created_at     timestamptz not null default now()
);


-- =============================================================================
-- SECTION 13: TRIGGER FUNCTIONS
-- =============================================================================

-- handle_new_user: creates a profile row on signup, copying name/avatar from
-- OAuth metadata when present, and generating a unique username slug.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug   text;
  final_slug  text;
  suffix      integer := 0;
  candidate_name text;
begin
  candidate_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );

  base_slug := lower(regexp_replace(candidate_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  if base_slug is null or base_slug = '' then
    base_slug := 'student';
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.profiles where username = final_slug) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, email, avatar_url)
  values (
    new.id,
    final_slug,
    candidate_name,
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- set_updated_at: generic trigger for every table with an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
  tables_with_updated_at text[] := array[
    'profiles', 'courses', 'modules', 'lessons', 'lesson_resources',
    'products', 'batches', 'batch_private_links', 'batch_enrollments',
    'enrollments', 'live_sessions', 'payments', 'coupons',
    'lesson_progress', 'lesson_notes', 'store_requests', 'blog_posts',
    'faqs', 'testimonials', 'reports', 'bkash_tokens'
  ];
begin
  foreach t in array tables_with_updated_at loop
    execute format(
      'create trigger set_updated_at before update on %I for each row execute function public.set_updated_at();',
      t
    );
  end loop;
end;
$$;


-- update_course_totals: recomputes total_lessons, total_duration_seconds and
-- global_order across the whole course whenever lessons change.
--
-- This is a STATEMENT-level trigger (not ROW-level) precisely because it
-- writes back into the same table (lessons.global_order). A row-level
-- AFTER trigger that updates the table it fired on re-fires itself for
-- every affected row, which cascades into a stack-depth error under any
-- bulk insert/seed. A statement-level trigger fires once per statement
-- regardless of how many rows it touched, and the pg_trigger_depth() guard
-- below is a second line of defense against re-entrancy.
create or replace function public.update_course_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_course_id uuid;
  affected_ids uuid[];
begin
  if pg_trigger_depth() > 1 then
    return null;
  end if;

  if tg_op = 'INSERT' then
    select array_agg(distinct course_id) into affected_ids from new_table;
  elsif tg_op = 'DELETE' then
    select array_agg(distinct course_id) into affected_ids from old_table;
  else
    select array_agg(distinct course_id) into affected_ids
    from (
      select course_id from old_table
      union
      select course_id from new_table
    ) both_tables;
  end if;

  foreach affected_course_id in array coalesce(affected_ids, array[]::uuid[])
  loop
    update public.courses c
    set
      total_lessons = sub.cnt,
      total_duration_seconds = sub.total_seconds
    from (
      select
        count(*) filter (where is_published) as cnt,
        coalesce(sum(duration_seconds) filter (where is_published), 0) as total_seconds
      from public.lessons
      where course_id = affected_course_id
    ) sub
    where c.id = affected_course_id;

    -- Recompute global_order across the course: published lessons ordered by
    -- module sort_order then lesson sort_order.
    with ordered as (
      select
        l.id,
        row_number() over (
          order by m.sort_order, l.sort_order
        ) as rn
      from public.lessons l
      join public.modules m on m.id = l.module_id
      where l.course_id = affected_course_id
    )
    update public.lessons l
    set global_order = ordered.rn
    from ordered
    where l.id = ordered.id
      and l.global_order is distinct from ordered.rn;
  end loop;

  return null;
end;
$$;

create trigger lessons_update_course_totals_ins
  after insert on lessons
  referencing new table as new_table
  for each statement execute function public.update_course_totals();

create trigger lessons_update_course_totals_upd
  after update on lessons
  referencing old table as old_table new table as new_table
  for each statement execute function public.update_course_totals();

create trigger lessons_update_course_totals_del
  after delete on lessons
  referencing old table as old_table
  for each statement execute function public.update_course_totals();


-- update_enrollment_progress: recalculates enrollments.progress_percent from
-- lesson_progress rows, sets completed_at when it reaches 100.
create or replace function public.update_enrollment_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_user_id   uuid;
  affected_course_id uuid;
  total_published     integer;
  completed_count      integer;
  pct                  integer;
begin
  affected_user_id := coalesce(new.user_id, old.user_id);
  affected_course_id := coalesce(new.course_id, old.course_id);

  select count(*) into total_published
  from public.lessons
  where course_id = affected_course_id
    and is_published = true;

  select count(*) into completed_count
  from public.lesson_progress lp
  join public.lessons l on l.id = lp.lesson_id
  where lp.user_id = affected_user_id
    and l.course_id = affected_course_id
    and lp.is_completed = true
    and l.is_published = true;

  if total_published > 0 then
    pct := round((completed_count::numeric / total_published::numeric) * 100);
  else
    pct := 0;
  end if;

  update public.enrollments
  set
    progress_percent = pct,
    completed_at = case when pct >= 100 then coalesce(completed_at, now()) else null end
  where user_id = affected_user_id
    and course_id = affected_course_id;

  return coalesce(new, old);
end;
$$;

create trigger lesson_progress_update_enrollment
  after insert or update or delete on lesson_progress
  for each row execute function public.update_enrollment_progress();


-- update_batch_seats: recalculates seats_taken, raises if it would exceed
-- seat_limit so overselling cannot happen even under a race.
create or replace function public.update_batch_seats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_batch_id uuid;
  taken              integer;
  cap                integer;
begin
  affected_batch_id := coalesce(new.batch_id, old.batch_id);

  select count(*) into taken
  from public.batch_enrollments
  where batch_id = affected_batch_id
    and status = 'active';

  select seat_limit into cap
  from public.batches
  where id = affected_batch_id
  for update;

  if cap is not null and taken > cap then
    raise exception 'Batch % is full: % taken exceeds limit %', affected_batch_id, taken, cap;
  end if;

  update public.batches
  set seats_taken = taken
  where id = affected_batch_id;

  return coalesce(new, old);
end;
$$;

create trigger batch_enrollments_update_seats
  after insert or update or delete on batch_enrollments
  for each row execute function public.update_batch_seats();


-- cleanup_stale_sessions: deletes active_sessions rows with no heartbeat in
-- the last 10 minutes. Called from a cron route, not a DB trigger.
create or replace function public.cleanup_stale_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.active_sessions
  where last_heartbeat_at < now() - interval '10 minutes';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke execute on function public.cleanup_stale_sessions() from anon, authenticated;
revoke execute on function public.update_batch_seats() from anon, authenticated;
revoke execute on function public.update_enrollment_progress() from anon, authenticated;
revoke execute on function public.update_course_totals() from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;


-- =============================================================================
-- SECTION 14: GRANT ACCESS TRANSACTIONAL FUNCTION
--
-- Wraps the payment-complete + enrollment-insert sequence from Phase 4.5 of
-- the plan in one SECURITY DEFINER function so the two can never diverge.
-- Called only from the service_role client in the bKash execute/callback and
-- reconciliation routes, and from the manual-payment admin action.
-- =============================================================================

create or replace function public.grant_access_for_payment(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pay        public.payments%rowtype;
  prod       public.products%rowtype;
  item       record;
begin
  select * into pay from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'payment % not found', p_payment_id;
  end if;

  select * into prod from public.products where id = pay.product_id;
  if not found then
    raise exception 'product % not found for payment %', pay.product_id, p_payment_id;
  end if;

  if prod.type = 'course' then
    insert into public.enrollments (user_id, course_id, payment_id, status)
    values (pay.user_id, prod.course_id, pay.id, 'active')
    on conflict (user_id, course_id) do update
      set status = 'active',
          payment_id = excluded.payment_id,
          revoked_at = null,
          revoked_reason = null;

  elsif prod.type = 'batch' then
    insert into public.batch_enrollments (user_id, batch_id, payment_id, status)
    values (pay.user_id, prod.batch_id, pay.id, 'active')
    on conflict (user_id, batch_id) do update
      set status = 'active',
          payment_id = excluded.payment_id,
          revoked_at = null,
          revoked_reason = null;

    if exists (
      select 1 from public.batches
      where id = prod.batch_id and includes_course_access = true and course_id is not null
    ) then
      insert into public.enrollments (user_id, course_id, payment_id, status)
      select pay.user_id, b.course_id, pay.id, 'active'
      from public.batches b
      where b.id = prod.batch_id
      on conflict (user_id, course_id) do update
        set status = 'active',
            payment_id = excluded.payment_id,
            revoked_at = null,
            revoked_reason = null;
    end if;

  elsif prod.type = 'bundle' then
    for item in select * from public.bundle_items where bundle_product_id = prod.id loop
      if item.course_id is not null then
        insert into public.enrollments (user_id, course_id, payment_id, status)
        values (pay.user_id, item.course_id, pay.id, 'active')
        on conflict (user_id, course_id) do update
          set status = 'active',
              payment_id = excluded.payment_id,
              revoked_at = null,
              revoked_reason = null;
      elsif item.batch_id is not null then
        insert into public.batch_enrollments (user_id, batch_id, payment_id, status)
        values (pay.user_id, item.batch_id, pay.id, 'active')
        on conflict (user_id, batch_id) do update
          set status = 'active',
              payment_id = excluded.payment_id,
              revoked_at = null,
              revoked_reason = null;
      end if;
    end loop;
  end if;

  if pay.coupon_id is not null then
    update public.coupons set used_count = used_count + 1 where id = pay.coupon_id;
    insert into public.coupon_redemptions (coupon_id, user_id, payment_id)
    values (pay.coupon_id, pay.user_id, pay.id);
  end if;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, after)
  values (pay.user_id, 'access_granted', 'payment', pay.id, to_jsonb(pay));
end;
$$;

revoke execute on function public.grant_access_for_payment(uuid) from anon, authenticated;


-- =============================================================================
-- SECTION 15: CERTIFICATE NUMBER TRIGGER HOOK (function itself lives in 0002
-- alongside the other SECURITY DEFINER access-check helpers, since that file
-- owns generate_certificate_number()). Nothing further needed here.
-- =============================================================================
