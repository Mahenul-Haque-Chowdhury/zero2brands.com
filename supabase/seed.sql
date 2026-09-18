-- =============================================================================
-- Zero2Brands: seed data for local development
--
-- Run after 0001_schema.sql, 0002_rls_policies.sql, 0003_indexes.sql have
-- been applied to a local Supabase instance (`supabase db reset` runs this
-- automatically). Creates auth users directly since this only ever runs
-- against a local/dev database, never production.
--
-- NOTE: passwords below are for local testing only ("Password123!").
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Auth users (triggers handle_new_user() -> creates matching profiles rows)
-- ---------------------------------------------------------------------------

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated',
    'admin@zero2brands.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Account"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'authenticated', 'authenticated',
    'rahim@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rahim Uddin"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '33333333-3333-3333-3333-333333333333',
    'authenticated', 'authenticated',
    'karim@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Karim Hossain"}',
    now(), now()
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '44444444-4444-4444-4444-444444444444',
    'authenticated', 'authenticated',
    'sumaiya@example.com',
    crypt('Password123!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sumaiya Akter"}',
    now(), now()
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Promote/complete profiles created by the trigger
-- ---------------------------------------------------------------------------

update public.profiles set
  role = 'admin',
  phone = '01700000001',
  phone_verified = true,
  onboarding_completed = true,
  visibility = 'private',
  district = 'Dhaka'
where id = '11111111-1111-1111-1111-111111111111';

update public.profiles set
  phone = '01700000002',
  phone_verified = true,
  onboarding_completed = true,
  visibility = 'students_only',
  district = 'Dhaka',
  business_name = 'Rahim Fashion House',
  business_category = 'Menswear',
  bio = 'Selling shirts and panjabis since 2022.'
where id = '22222222-2222-2222-2222-222222222222';

update public.profiles set
  phone = '01700000003',
  phone_verified = true,
  onboarding_completed = true,
  visibility = 'public',
  district = 'Chattogram',
  business_name = 'Karim Kids Wear',
  business_category = 'Kidswear',
  bio = 'Building a kidswear brand from Chattogram.',
  show_facebook = true,
  facebook_url = 'https://facebook.com/karimkidswear'
where id = '33333333-3333-3333-3333-333333333333';

update public.profiles set
  phone = '01700000004',
  phone_verified = true,
  onboarding_completed = true,
  visibility = 'private',
  district = 'Sylhet',
  business_name = 'Sumaiya Boutique',
  business_category = 'Womenswear'
where id = '44444444-4444-4444-4444-444444444444';

-- ---------------------------------------------------------------------------
-- Course, modules, lessons
-- ---------------------------------------------------------------------------

insert into public.courses (
  id, slug, title, subtitle, description, outcomes, requirements,
  price_bdt, compare_at_price_bdt, is_published, is_primary,
  sequential_unlock, sort_order, seo_title, seo_description
) values (
  'a0000000-0000-0000-0000-000000000001',
  'zero-to-brand',
  'Zero to Brand: Build a Clothing Business',
  'A practical, step-by-step system for launching a clothing brand in Bangladesh',
  'Everything from sourcing to your first hundred sales, taught by someone who has done it.',
  '["Source wholesale fabric confidently", "Price products for profit", "Run Facebook-first sales", "Handle delivery and returns"]'::jsonb,
  '["A phone with a camera", "Starting capital of at least 20,000 BDT", "Willingness to do the work"]'::jsonb,
  4999, 9999, true, true, true, 1,
  'Zero to Brand Course | Zero2Brands',
  'Learn to build a clothing business from zero with a step-by-step course made for the Bangladeshi market.'
)
on conflict (id) do nothing;

insert into public.modules (id, course_id, title, description, sort_order, is_published) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Getting Started', 'Foundations before you spend a single taka.', 1, true),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Sourcing and Costing', 'Where to buy and how to price.', 2, true),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Selling Online', 'Facebook page, photography, and your first sales.', 3, true)
on conflict (id) do nothing;

insert into public.lessons (
  id, module_id, course_id, slug, title, description, type,
  bunny_video_id, duration_seconds, sort_order, is_preview, is_published
) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'welcome', 'Welcome to Zero to Brand', 'Course overview and how to get the most from it.', 'video',
   'sample-bunny-guid-1', 420, 1, true, true),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'mindset', 'The Business Mindset', 'Setting expectations before you start.', 'video',
   'sample-bunny-guid-2', 600, 2, false, true),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'islampur-sourcing', 'Sourcing at Islampur', 'A walkthrough of wholesale sourcing.', 'video',
   'sample-bunny-guid-3', 900, 1, false, true),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'costing-sheet', 'The Costing Sheet', 'Download and use the costing template.', 'resource',
   null, 0, 2, false, true),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'facebook-setup', 'Setting Up Your Facebook Page', 'Step by step page setup for selling.', 'video',
   'sample-bunny-guid-5', 540, 1, false, true),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'first-sale', 'Getting Your First Sale', 'Text lesson on making your first ten sales.', 'text',
   null, 0, 2, false, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Batch with three live sessions
-- ---------------------------------------------------------------------------

insert into public.batches (
  id, slug, course_id, title, description, price_bdt, compare_at_price_bdt,
  includes_course_access, seat_limit, enrollment_opens_at, enrollment_closes_at,
  starts_at, ends_at, status, schedule_note, instructor_id
) values (
  'd0000000-0000-0000-0000-000000000001',
  'batch-one',
  'a0000000-0000-0000-0000-000000000001',
  'Batch One: Live Cohort',
  'Six weeks of live sessions alongside the recorded course.',
  7999, 12999, true, 30,
  now() - interval '5 days', now() + interval '10 days',
  now() + interval '14 days', now() + interval '56 days',
  'enrolling', 'Every Saturday, 8 PM Dhaka time',
  '11111111-1111-1111-1111-111111111111'
)
on conflict (id) do nothing;

insert into public.batch_private_links (batch_id, whatsapp_group_url, facebook_group_url) values
  ('d0000000-0000-0000-0000-000000000001', 'https://chat.whatsapp.com/example-batch-one', 'https://facebook.com/groups/example-batch-one')
on conflict (batch_id) do nothing;

insert into public.live_sessions (id, batch_id, title, description, scheduled_at, duration_minutes, sort_order) values
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Kickoff and Goal Setting', 'Meet your cohort and set targets.', now() + interval '14 days', 90, 1),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Sourcing Field Session', 'Live Q&A on sourcing decisions.', now() + interval '21 days', 90, 2),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Launch Week Review', 'Reviewing everyone''s launched pages.', now() + interval '28 days', 90, 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------

insert into public.products (id, type, course_id, title, price_bdt, is_active) values
  ('f0000000-0000-0000-0000-000000000001', 'course', 'a0000000-0000-0000-0000-000000000001', 'Zero to Brand Course', 4999, true)
on conflict (id) do nothing;

insert into public.products (id, type, batch_id, title, price_bdt, is_active) values
  ('f0000000-0000-0000-0000-000000000002', 'batch', 'd0000000-0000-0000-0000-000000000001', 'Batch One: Live Cohort', 7999, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sample enrollment (Rahim owns the course) so the dashboard has data
-- ---------------------------------------------------------------------------

insert into public.enrollments (user_id, course_id, status) values
  ('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'a0000000-0000-0000-0000-000000000001', 'active')
on conflict (user_id, course_id) do nothing;

insert into public.batch_enrollments (user_id, batch_id, status) values
  ('33333333-3333-3333-3333-333333333333', 'd0000000-0000-0000-0000-000000000001', 'active')
on conflict (user_id, batch_id) do nothing;

-- ---------------------------------------------------------------------------
-- FAQs
-- ---------------------------------------------------------------------------

insert into public.faqs (question, answer, category, sort_order, is_published) values
  ('Do I get lifetime access?', 'Yes. Once you purchase the recorded course, you have lifetime access with no renewal.', 'general', 1, true),
  ('Can I share my login with a friend?', 'No. Each account is limited to two active devices, and sharing violates our terms.', 'general', 2, true),
  ('How is a live batch different from the course?', 'The recorded course is self-paced. A live batch adds scheduled Zoom sessions with an instructor over a fixed period.', 'batches', 3, true),
  ('What payment methods do you accept?', 'bKash only at launch, through our secure checkout.', 'payments', 4, true),
  ('Can other students see my information?', 'Other enrolled students can see your name, district and business name if you choose a public or students-only visibility setting. You control this in settings.', 'privacy', 5, true)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Site settings
-- ---------------------------------------------------------------------------

insert into public.site_settings (key, value) values
  ('announcement_banner', '{"enabled": false, "text": ""}'::jsonb),
  ('support_contact', '{"email": "support@zero2brands.com", "phone": "01700000000"}'::jsonb)
on conflict (key) do update set value = excluded.value;
