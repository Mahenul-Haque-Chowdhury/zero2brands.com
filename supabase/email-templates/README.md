# Supabase auth email templates

These are not auto-applied by any migration — Supabase's auth email
templates are dashboard-only config, not something the CLI pushes. Paste
each file's content into the matching template under **Supabase dashboard
→ Authentication → Emails → Templates**.

| File | Supabase template | Notes |
|---|---|---|
| `confirm-signup.html` | Confirm sign up | Routes through `/auth/confirm` so a new user lands on `/onboarding`, not the homepage. Do not use Supabase's default `{{ .ConfirmationURL }}` here — it redirects straight to Site URL and skips onboarding. |
| `reset-password.html` | Reset password | Routes through `/auth/confirm?...&next=/reset-password`. |
| `magic-link.html` | Magic link or OTP | Not currently used by the app (login uses password or phone+SMS OTP), but kept on-brand in case it's ever enabled. |
| `change-email.html` | Change email address | Routes to `/auth/confirm?...&next=/dashboard/settings`. |
| `invite-user.html` | Invite user | Not currently used (no admin-invite feature built), kept on-brand for completeness. Routes new invitees to `/onboarding`. |
| `reauthentication.html` | Reauthentication | Not currently used (no re-auth-for-sensitive-action feature built), kept on-brand for completeness. Uses `{{ .Token }}` (a 6-digit code), not a link. |

All six share the same shell: navy header with the Zero2Brands wordmark
(green "2"), white card body, green CTA button, light-gray page
background — matching `--brand-navy` / `--brand-green` / `--brand-gray`
from `src/app/globals.css`.

Written as inline-styled HTML tables (not `<style>` blocks or flexbox/grid)
because email clients strip external and often internal `<style>` tags
unreliably — inline styles on table markup is the actual portable subset
across Gmail, Outlook, Yahoo, etc.
