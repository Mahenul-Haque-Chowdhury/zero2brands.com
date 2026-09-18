# Questions for the owner

Decisions the plan flags as needing the business owner, with the default
picked (per the plan's own recommendation) so the build keeps moving.
Review and override any of these if the default is wrong.

## 1. Zoom meeting creation: manual paste vs. auto-create (plan section 0.9)

**Default applied: manual paste.** Admin pastes the Zoom join URL, meeting
ID and password into the `live_sessions` row per session. No Zoom API
integration was built for meeting creation. This matches the plan's own
recommendation ("manual paste for launch, auto-create in v1.1").

## 2. GrayVally storefront: included in course price or upsell? (plan section 0.15)

**Default applied: upsell.** The dashboard CTA appears at 80% course
progress and routes to a lead form (`/dashboard/store-request`), it is not
bundled into the course price. Matches the plan's recommendation.

## 3. Does a live batch include the recorded course by default? (plan section 0.15)

**Default applied: yes, batches include recorded course access.** Schema
field `batches.includes_course_access` defaults to `true`. Per-batch this
can be turned off by an admin if a future batch should be sold standalone.
Matches the plan's recommendation ("batch includes recorded access, priced
accordingly").

## 4. bKash IP whitelisting resolution

The plan requires deciding whether bKash will waive whitelisting, or
whether a fixed-IP proxy (e.g. DigitalOcean droplet) is needed, in Phase 0,
before Phase 4 payment code is finalized. **No default was picked here
because it depends on bKash's answer to Arnob**, which cannot be
predicted. The code was built with `BKASH_PROXY_URL` / `BKASH_PROXY_SECRET`
env vars so the bKash client can transparently route through a proxy if
one turns out to be necessary — see `src/lib/bkash/client.ts`. If bKash
waives whitelisting, leave `BKASH_PROXY_URL` empty and calls go direct.

## Git push blocked in this sandbox

Not a plan decision, but noted here too: the coding agent's own sandbox
refused `git push` to GitHub (see OWNER_TASKS.md, "Git / GitHub" section).
This needs the owner (or a permission-rule change) to complete, it does
not indicate any problem with the repository or GitHub credentials
themselves.
