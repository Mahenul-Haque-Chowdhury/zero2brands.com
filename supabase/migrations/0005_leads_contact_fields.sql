-- The contact page form now asks what the enquiry is about and lets the
-- visitor add a message. The leads table had neither column, so both were
-- being collected in the form and silently dropped before this migration.
-- Both nullable: every existing row and every other lead source (organic,
-- facebook, referral, webinar) is unaffected.

alter table leads
  add column query_type text,
  add column message text;
