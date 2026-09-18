-- =============================================================================
-- Zero2Brands: Indexes
-- Migration: 0003_indexes.sql
-- Depends on: 0001_schema.sql, 0002_rls_policies.sql
-- Phase 2.5 of the build plan.
-- =============================================================================

create index if not exists idx_enrollments_user_status on enrollments (user_id, status);
create index if not exists idx_enrollments_course on enrollments (course_id);

create index if not exists idx_batch_enrollments_user_status on batch_enrollments (user_id, status);
create index if not exists idx_batch_enrollments_batch_status on batch_enrollments (batch_id, status);

create index if not exists idx_lessons_course_sort on lessons (course_id, sort_order);
create index if not exists idx_lessons_course_global_order on lessons (course_id, global_order);
create index if not exists idx_lessons_module_sort on lessons (module_id, sort_order);

create index if not exists idx_modules_course_sort on modules (course_id, sort_order);

create index if not exists idx_lesson_progress_user_course on lesson_progress (user_id, course_id);

create index if not exists idx_payments_user_created on payments (user_id, created_at desc);
create index if not exists idx_payments_status_created on payments (status, created_at desc);
create index if not exists idx_payments_bkash_payment_id on payments (bkash_payment_id);
create index if not exists idx_payments_merchant_invoice on payments (merchant_invoice_number);

create index if not exists idx_active_sessions_user_heartbeat on active_sessions (user_id, last_heartbeat_at);

create index if not exists idx_video_access_log_user_issued on video_access_log (user_id, token_issued_at desc);

create index if not exists idx_live_sessions_batch_scheduled on live_sessions (batch_id, scheduled_at);

create index if not exists idx_profiles_username on profiles (username);
create index if not exists idx_profiles_visibility_not_banned on profiles (visibility) where is_banned = false;

create index if not exists idx_blog_posts_published_at on blog_posts (published_at desc) where is_published;
