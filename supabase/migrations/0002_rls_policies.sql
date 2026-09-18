-- =============================================================================
-- Zero2Brands: Row Level Security
-- Migration: 0002_rls_policies.sql
-- Depends on: 0001_schema.sql (tables, enums, triggers)
--
-- Run order matters. Helper functions first, then RLS enablement, then
-- policies, then the gated views, then grants.
--
-- Design rules enforced here:
--   1. RLS is on for every public table. A table with RLS off is a full leak
--      through the anon key, which is public by design.
--   2. Access logic lives in SECURITY DEFINER functions, not duplicated across
--      policies. One place to audit, one place to fix.
--   3. Enrollments and payments are never written by a client. Only the
--      service_role key writes them, from the bKash grant path.
--   4. Column-level grants, not policies, stop privilege escalation on
--      profiles. A policy cannot restrict WHICH columns are written.
--   5. The three visibility views run with OWNER rights. Their WHERE clause is
--      the security boundary. See the note above the views.
-- =============================================================================


-- =============================================================================
-- SECTION 1: HELPER FUNCTIONS
--
-- All SECURITY DEFINER with a pinned search_path. The pin is not optional: an
-- unpinned search_path on a SECURITY DEFINER function is a privilege
-- escalation vector.
--
-- SECURITY DEFINER also prevents infinite recursion. is_admin() reads profiles,
-- and the profiles policies call is_admin(). Running as definer bypasses RLS on
-- that inner read, which breaks the cycle.
-- =============================================================================

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = uid
      and role in ('admin', 'superadmin')
  );
$$;

comment on function public.is_admin(uuid) is
  'True when the user holds admin or superadmin. Used by nearly every policy.';


create or replace function public.has_course_access(uid uuid, cid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    -- Direct purchase of the recorded course. Lifetime, so no expiry check.
    exists (
      select 1 from enrollments
      where user_id = uid
        and course_id = cid
        and status = 'active'
    )
    -- Or a live batch that bundles recorded access.
    or exists (
      select 1
      from batch_enrollments be
      join batches b on b.id = be.batch_id
      where be.user_id = uid
        and be.status = 'active'
        and b.includes_course_access = true
        and b.course_id = cid
    )
    or public.is_admin(uid);
$$;

comment on function public.has_course_access(uuid, uuid) is
  'Single source of truth for recorded course access. No expiry: access is lifetime.';


create or replace function public.has_batch_access(uid uuid, bid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from batch_enrollments
    where user_id = uid
      and batch_id = bid
      and status = 'active'
  )
  or public.is_admin(uid);
$$;

comment on function public.has_batch_access(uuid, uuid) is
  'Gates live session Zoom URLs, private group links and the batch-mates list.';


create or replace function public.is_enrolled_student(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (select 1 from enrollments       where user_id = uid and status = 'active')
    or exists (select 1 from batch_enrollments where user_id = uid and status = 'active')
    or public.is_admin(uid);
$$;

comment on function public.is_enrolled_student(uuid) is
  'Gates the student directory. A signed-up but unpaid account sees nothing.';


-- Sequential unlocking. Used by the video token route, not by RLS.
-- RLS lets a student SEE a locked lesson row (so the sidebar renders); this
-- function decides whether they may actually play it.
create or replace function public.can_access_lesson(uid uuid, lid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with l as (
    select course_id, global_order, is_preview, is_published
    from lessons
    where id = lid
  )
  select
    (select is_published from l)
    and (
      (select is_preview from l)
      or (
        public.has_course_access(uid, (select course_id from l))
        and (
          public.is_admin(uid)
          or not (
            select sequential_unlock
            from courses
            where id = (select course_id from l)
          )
          -- Every earlier published lesson must be completed.
          or not exists (
            select 1
            from lessons prev
            where prev.course_id   = (select course_id from l)
              and prev.is_published = true
              and prev.global_order < (select global_order from l)
              and not exists (
                select 1 from lesson_progress lp
                where lp.user_id    = uid
                  and lp.lesson_id  = prev.id
                  and lp.is_completed = true
              )
          )
        )
      )
    );
$$;

comment on function public.can_access_lesson(uuid, uuid) is
  'Playback gate including sequential unlocking. Called by /api/video/token.';


create or replace function public.generate_certificate_number()
returns text
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  next_seq integer;
  yr       text := to_char(now() at time zone 'Asia/Dhaka', 'YYYY');
begin
  select coalesce(max(
           nullif(regexp_replace(certificate_number, '^Z2B-\d{4}-', ''), '')::integer
         ), 0) + 1
    into next_seq
    from certificates
   where certificate_number like 'Z2B-' || yr || '-%';

  return 'Z2B-' || yr || '-' || lpad(next_seq::text, 4, '0');
end;
$$;


-- anon has no business calling these directly through PostgREST RPC.
revoke execute on function public.is_admin(uuid)                  from anon;
revoke execute on function public.is_enrolled_student(uuid)       from anon;
revoke execute on function public.has_course_access(uuid, uuid)   from anon;
revoke execute on function public.has_batch_access(uuid, uuid)    from anon;
revoke execute on function public.can_access_lesson(uuid, uuid)   from anon;
revoke execute on function public.generate_certificate_number()   from anon, authenticated;


-- =============================================================================
-- SECTION 2: ENABLE RLS ON EVERY TABLE
--
-- No exceptions. See the CI guard at the bottom of this file.
-- =============================================================================

alter table profiles              enable row level security;
alter table courses               enable row level security;
alter table modules               enable row level security;
alter table lessons               enable row level security;
alter table lesson_resources      enable row level security;
alter table products              enable row level security;
alter table bundle_items          enable row level security;
alter table enrollments           enable row level security;
alter table batches               enable row level security;
alter table batch_private_links   enable row level security;
alter table batch_enrollments     enable row level security;
alter table live_sessions         enable row level security;
alter table session_attendance    enable row level security;
alter table payments              enable row level security;
alter table bkash_tokens          enable row level security;
alter table coupons               enable row level security;
alter table coupon_redemptions    enable row level security;
alter table lesson_progress       enable row level security;
alter table lesson_notes          enable row level security;
alter table active_sessions       enable row level security;
alter table video_access_log      enable row level security;
alter table store_requests        enable row level security;
alter table leads                 enable row level security;
alter table certificates          enable row level security;
alter table reports               enable row level security;
alter table blog_posts            enable row level security;
alter table faqs                  enable row level security;
alter table testimonials          enable row level security;
alter table site_settings         enable row level security;
alter table audit_log             enable row level security;
alter table email_log             enable row level security;
alter table sms_log               enable row level security;


-- =============================================================================
-- SECTION 3: PROFILES
--
-- Students never read the profiles table directly. Student-to-student
-- visibility goes through the public_profiles view in Section 9.
-- =============================================================================

create policy "profiles_select_own" on profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_select_admin" on profiles
  for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "profiles_update_own" on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admin" on profiles
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- No INSERT policy: rows are created by the handle_new_user trigger.
-- No DELETE policy: account deletion cascades from auth.users.

-- Column grants are the real defence here. Without these, profiles_update_own
-- lets any student set their own role to 'superadmin'.
revoke update on profiles from authenticated;

grant update (
  username,
  full_name,
  phone,
  avatar_url,
  bio,
  district,
  facebook_url,
  business_name,
  business_category,
  visibility,
  show_facebook,
  onboarding_completed,
  updated_at
) on profiles to authenticated;

-- role, is_banned, ban_reason and admin_notes are now unwritable by any
-- logged-in user. Admin changes to those go through server actions on the
-- service_role client, which bypasses both policies and column grants.


-- =============================================================================
-- SECTION 4: COURSE CONTENT
-- =============================================================================

create policy "courses_select_published" on courses
  for select to anon, authenticated
  using (is_published = true or public.is_admin(auth.uid()));

create policy "courses_write_admin" on courses
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "modules_select_access" on modules
  for select to authenticated
  using (
    is_published = true
    and public.has_course_access(auth.uid(), course_id)
  );

create policy "modules_write_admin" on modules
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- Deliberately uses has_course_access, NOT can_access_lesson.
-- A student must be able to see that lesson 7 exists while lesson 6 is
-- incomplete, otherwise the course sidebar cannot render the locked state.
-- Playback is gated separately at token issuance.
create policy "lessons_select_access" on lessons
  for select to authenticated
  using (
    is_published = true
    and (
      is_preview = true
      or public.has_course_access(auth.uid(), course_id)
    )
  );

-- Free preview lessons are visible to logged-out visitors on the sales page.
create policy "lessons_select_preview_anon" on lessons
  for select to anon
  using (is_published = true and is_preview = true);

create policy "lessons_write_admin" on lessons
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "lesson_resources_select_access" on lesson_resources
  for select to authenticated
  using (
    public.has_course_access(
      auth.uid(),
      (select course_id from lessons where id = lesson_id)
    )
  );

create policy "lesson_resources_write_admin" on lesson_resources
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =============================================================================
-- SECTION 5: PRODUCTS AND BATCHES
-- =============================================================================

create policy "products_select_active" on products
  for select to anon, authenticated
  using (is_active = true or public.is_admin(auth.uid()));

create policy "products_write_admin" on products
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "bundle_items_select" on bundle_items
  for select to anon, authenticated
  using (true);

create policy "bundle_items_write_admin" on bundle_items
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "batches_select_public" on batches
  for select to anon, authenticated
  using (status <> 'cancelled' or public.is_admin(auth.uid()));

create policy "batches_write_admin" on batches
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- Group links live in their own table precisely so this policy can exist.
-- Hiding a column on an otherwise-public row is not something RLS can do.
create policy "batch_private_links_select" on batch_private_links
  for select to authenticated
  using (public.has_batch_access(auth.uid(), batch_id));

create policy "batch_private_links_write_admin" on batch_private_links
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- Contains zoom_join_url. Additionally: never render this into server HTML.
-- Fetch it through a server action on click.
create policy "live_sessions_select_access" on live_sessions
  for select to authenticated
  using (public.has_batch_access(auth.uid(), batch_id));

create policy "live_sessions_write_admin" on live_sessions
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "session_attendance_select_own" on session_attendance
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "session_attendance_write_admin" on session_attendance
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =============================================================================
-- SECTION 6: ENROLLMENTS AND PAYMENTS
--
-- No INSERT policy on any table in this section. Enrollments are created
-- exclusively by the service_role client inside the bKash grant transaction.
-- If a client can insert an enrollment, the course is free.
-- =============================================================================

create policy "enrollments_select_own" on enrollments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "enrollments_write_admin" on enrollments
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "batch_enrollments_select_own" on batch_enrollments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "batch_enrollments_write_admin" on batch_enrollments
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "payments_select_own" on payments
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "payments_update_admin" on payments
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Belt and braces: even if a policy were added by mistake, a client cannot
-- write the two columns that decide whether access is granted.
revoke insert, update on payments from authenticated;


-- =============================================================================
-- SECTION 7: SECRETS AND COUPONS
--
-- Two tables with NO policies at all. RLS enabled plus zero policies denies
-- everything except service_role, which bypasses RLS entirely.
-- =============================================================================

-- A leaked bKash id_token is a live payment credential. No client path exists.
revoke all on bkash_tokens from anon, authenticated;

-- Granting SELECT here lets anyone enumerate every discount code you have.
-- Validation runs in a server action that takes a code and returns only the
-- computed discount amount.
revoke all on coupons from anon, authenticated;

create policy "coupon_redemptions_select_own" on coupon_redemptions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));


-- =============================================================================
-- SECTION 8: PROGRESS, DEVICES AND LOGS
-- =============================================================================

create policy "lesson_progress_own" on lesson_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "lesson_progress_select_admin" on lesson_progress
  for select to authenticated
  using (public.is_admin(auth.uid()));


create policy "lesson_notes_own" on lesson_notes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- Students can see and revoke their own devices. This turns the two-device
-- limit into a visible feature rather than a mystery logout.
create policy "active_sessions_select_own" on active_sessions
  for select to authenticated
  using (user_id = auth.uid());

create policy "active_sessions_delete_own" on active_sessions
  for delete to authenticated
  using (user_id = auth.uid());

-- Inserts and heartbeat updates are service_role only, so a client cannot
-- forge a session row to bypass the device limit.


create policy "video_access_log_select_admin" on video_access_log
  for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "audit_log_select_admin" on audit_log
  for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "email_log_select_admin" on email_log
  for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "sms_log_select_admin" on sms_log
  for select to authenticated
  using (public.is_admin(auth.uid()));


-- =============================================================================
-- SECTION 9: GATED VIEWS  ***READ THIS BEFORE EDITING***
--
-- These three views run with OWNER rights (security_invoker = false, which is
-- also the Postgres default). That is deliberate and necessary.
--
-- With security_invoker = true, public_profiles would run as the querying
-- student, so the profiles RLS policies (own row only) would apply and the
-- directory would return exactly one row: the viewer's own. The view has to
-- read across rows, which requires owner rights.
--
-- The consequence: the WHERE clause inside each view is the ONLY security
-- boundary. There is no RLS behind it. Treat these three WHERE clauses as
-- security-critical code and review any change to them.
--
-- The generic security_invoker warning still applies to any NEW view you add
-- over a table that is already readable by the querying user.
-- =============================================================================

-- Student directory. Column projection plus row gating, both in the view.
-- Note what is absent: email, phone, role, is_banned, admin_notes.
create or replace view public.public_profiles
with (security_invoker = false) as
  select
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.district,
    p.business_name,
    p.business_category,
    p.bio,
    case when p.show_facebook then p.facebook_url else null end as facebook_url,
    p.created_at
  from profiles p
  where p.is_banned = false
    and p.visibility <> 'private'
    and public.is_enrolled_student(auth.uid());

revoke all on public.public_profiles from anon;
grant select on public.public_profiles to authenticated;

comment on view public.public_profiles is
  'Student directory. Owner rights: the WHERE clause is the only gate. Banned and private profiles are excluded, and only active students may read it.';


-- Batch-mates list, gated per batch rather than per platform.
create or replace view public.batch_members
with (security_invoker = false) as
  select
    be.batch_id,
    p.id as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.district,
    p.business_name
  from batch_enrollments be
  join profiles p on p.id = be.user_id
  where be.status = 'active'
    and p.is_banned = false
    and p.visibility <> 'private'
    and public.has_batch_access(auth.uid(), be.batch_id);

revoke all on public.batch_members from anon;
grant select on public.batch_members to authenticated;

comment on view public.batch_members is
  'Cohort peer list. Owner rights: the has_batch_access call in WHERE is the only gate.';


-- Public curriculum for the sales page. The whole point of this view is the
-- columns it does NOT select: bunny_video_id, content_html, image_paths.
create or replace view public.course_outline_public
with (security_invoker = false) as
  select
    l.id,
    l.course_id,
    l.module_id,
    m.title as module_title,
    m.sort_order as module_sort_order,
    l.title,
    l.sort_order,
    l.global_order,
    l.duration_seconds,
    l.type,
    l.is_preview
  from lessons l
  join modules m on m.id = l.module_id
  join courses c on c.id = l.course_id
  where l.is_published = true
    and m.is_published = true
    and c.is_published = true;

grant select on public.course_outline_public to anon, authenticated;

comment on view public.course_outline_public is
  'Curriculum metadata for the public sales page. Never exposes bunny_video_id or content_html.';


-- =============================================================================
-- SECTION 10: PUBLIC FORMS
--
-- Insert-only with no select. Nobody reads back what others submitted.
-- Abuse control is rate limiting at the route layer, not in the database.
-- =============================================================================

create policy "store_requests_insert_any" on store_requests
  for insert to anon, authenticated
  with check (true);

create policy "store_requests_select_admin" on store_requests
  for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "store_requests_update_admin" on store_requests
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "leads_insert_any" on leads
  for insert to anon, authenticated
  with check (true);

create policy "leads_select_admin" on leads
  for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "leads_update_admin" on leads
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- Community moderation. Authenticated only, and you cannot file a report
-- under someone else's name.
create policy "reports_insert_auth" on reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

create policy "reports_select_admin" on reports
  for select to authenticated
  using (public.is_admin(auth.uid()));

create policy "reports_update_admin" on reports
  for update to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =============================================================================
-- SECTION 11: CONTENT AND CERTIFICATES
-- =============================================================================

create policy "blog_posts_select_published" on blog_posts
  for select to anon, authenticated
  using (is_published = true or public.is_admin(auth.uid()));

create policy "blog_posts_write_admin" on blog_posts
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "faqs_select_published" on faqs
  for select to anon, authenticated
  using (is_published = true or public.is_admin(auth.uid()));

create policy "faqs_write_admin" on faqs
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "testimonials_select_published" on testimonials
  for select to anon, authenticated
  using (is_published = true or public.is_admin(auth.uid()));

create policy "testimonials_write_admin" on testimonials
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


create policy "site_settings_select" on site_settings
  for select to anon, authenticated
  using (true);

create policy "site_settings_write_admin" on site_settings
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- Public verification (/verify/[number]) goes through a server route on the
-- service_role client, returning only name, course and date. Do not open this
-- table to anon.
create policy "certificates_select_own" on certificates
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin(auth.uid()));

create policy "certificates_write_admin" on certificates
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));


-- =============================================================================
-- SECTION 12: VERIFICATION QUERIES
--
-- Run these after applying. The first two belong in CI as failing tests.
-- =============================================================================

-- GUARD 1: every public table must have RLS enabled.
-- Expected: zero rows. Fail the build otherwise.
--
--   select tablename
--   from pg_tables
--   where schemaname = 'public'
--     and rowsecurity = false;


-- GUARD 2: every SECURITY DEFINER function must pin search_path.
-- Expected: zero rows.
--
--   select p.proname
--   from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public'
--     and p.prosecdef = true
--     and not exists (
--       select 1 from unnest(coalesce(p.proconfig, '{}')) cfg
--       where cfg like 'search_path=%'
--     );


-- CHECK 3: confirm the three gated views run with owner rights.
-- Expected: security_invoker absent or false for all three.
--
--   select c.relname, c.reloptions
--   from pg_class c
--   join pg_namespace n on n.oid = c.relnamespace
--   where n.nspname = 'public'
--     and c.relkind = 'v'
--     and c.relname in ('public_profiles', 'batch_members', 'course_outline_public');


-- CHECK 4: confirm authenticated cannot write privileged profile columns.
-- Expected: role, is_banned, ban_reason and admin_notes absent from results.
--
--   select column_name
--   from information_schema.column_privileges
--   where table_name = 'profiles'
--     and grantee = 'authenticated'
--     and privilege_type = 'UPDATE';


-- CHECK 5: list every table with RLS on but zero policies. bkash_tokens and
-- coupons SHOULD appear here (deny-all is intentional). Anything else in this
-- list is an accidental lockout.
--
--   select t.tablename
--   from pg_tables t
--   where t.schemaname = 'public'
--     and t.rowsecurity = true
--     and not exists (
--       select 1 from pg_policies p
--       where p.schemaname = 'public' and p.tablename = t.tablename
--     );


-- =============================================================================
-- MANUAL PENETRATION CHECKS
--
-- Run these from a throwaway account before launch. Passing the CI guards is
-- not the same as being safe.
--
-- As a signed-up but UNPAID account, confirm each of these returns nothing:
--   select bunny_video_id from lessons;
--   select * from public_profiles;
--   select * from batch_private_links;
--   select zoom_join_url from live_sessions;
--   select * from coupons;
--   select * from bkash_tokens;
--
-- As a PAID student, confirm each of these returns nothing:
--   select * from payments where user_id <> auth.uid();
--   select phone, email from profiles where id <> auth.uid();
--   select * from batch_members where batch_id = '<a batch you are not in>';
--   update profiles set role = 'superadmin' where id = auth.uid();
--   insert into enrollments (user_id, course_id) values (auth.uid(), '<any>');
--
-- Then load the community directory in a browser and inspect the NETWORK
-- PAYLOAD, not the rendered page, for any leaked email or phone field.
-- =============================================================================
