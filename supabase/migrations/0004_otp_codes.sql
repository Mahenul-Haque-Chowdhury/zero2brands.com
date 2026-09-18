-- =============================================================================
-- Zero2Brands: phone OTP login
-- Migration: 0004_otp_codes.sql
--
-- Adds SMS-OTP login as a second login method alongside email/password.
-- Codes are single-use, short-lived, and stored hashed — never the raw code.
-- This table follows the same pattern as bkash_tokens: RLS enabled, zero
-- policies, service_role only. A client has no legitimate reason to read or
-- write OTP rows directly.
-- =============================================================================

create type public.otp_purpose as enum ('login');

create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  purpose otp_purpose not null default 'login',
  code_hash text not null,
  attempts integer not null default 0,
  consumed_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index otp_codes_phone_purpose_idx on public.otp_codes (phone, purpose, created_at desc);

alter table public.otp_codes enable row level security;

-- No policies: deny-all for anon/authenticated, service_role bypasses RLS.
revoke all on public.otp_codes from anon, authenticated;

comment on table public.otp_codes is
  'SMS OTP codes for phone login. Hashed at rest, single-use, short expiry. service_role only — no client-side policies by design.';

-- Periodic cleanup, called from the existing cleanup-sessions cron alongside
-- stale active_sessions rows.
create or replace function public.cleanup_expired_otp_codes()
returns void
language sql
security definer
set search_path = public
as $$
  delete from otp_codes
  where expires_at < now() - interval '1 day';
$$;

revoke execute on function public.cleanup_expired_otp_codes() from anon, authenticated;
