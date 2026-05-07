# Production Alert Catalog

All alerts route to **Slack `#marzipan-alerts`** (primary) and
**email `yuvalzakay25@gmail.com`** (backup). Slack is the action
channel; email is the audit trail in case Slack is down.

## Channel setup (one-time)

1. **Slack integration**: Sentry → Settings → Integrations → Slack →
   Install. Connect to your Slack workspace and authorize the
   `#marzipan-alerts` channel (create the channel first if it doesn't
   exist; private channel recommended).
2. **Email**: Sentry → Settings → Account → Notifications → set to
   `yuvalzakay25@gmail.com`. Personal alert routing rules can override
   per-project.
3. **Test the channels**: each alert below has a `Test fire` step. Run
   it once; verify the Slack post and the email both arrive. If only
   one arrives, the integration is half-broken — fix before relying.

---

## Alert catalog

### A1 — New issue in production

| Field | Value |
|---|---|
| **Trigger** | A new issue (group) is **first seen** with `environment:production` |
| **Threshold** | First occurrence (count = 1) |
| **Window** | 1 minute |
| **Channels** | Slack `#marzipan-alerts`, email |
| **Owner action** | Open the issue in Sentry, classify per `RUNBOOK.md §1` |
| **Why** | A genuinely new error code path appeared. Either a regression from the latest deploy or a new third-party noise pattern that needs filtering. |

**Sentry config**: Issues → Alerts → Create → "Issue Alert"
- WHEN `A new issue is created`
- IF `event.environment equals production`
- THEN send notification to Slack channel + email

**Test fire**: in the production app's DevTools, run
`throw new Error("alert-A1-test-" + Date.now())`. The unique suffix
forces a new issue group. Confirm both channels notify, then resolve
+ discard the issue.

---

### A2 — Regression on a resolved issue

| Field | Value |
|---|---|
| **Trigger** | An issue marked `resolved` re-occurs |
| **Threshold** | Any single re-occurrence |
| **Window** | n/a (event-based) |
| **Channels** | Slack `#marzipan-alerts`, email |
| **Owner action** | Don't just re-resolve. Either the fix didn't land, or it landed on a code path that isn't actually exercised. Re-investigate. |
| **Why** | Catches the "fixed it" → "didn't actually fix it" pattern. |

**Sentry config**: built-in. Settings → Projects → marzipanbakery-web →
Alerts → enable `Resolved issue is regressed` (default-on, but
double-check the channels are the project's channels not personal ones).

**Test fire**: pick any low-volume issue, resolve it, then re-trigger
its error. Confirm regression notification arrives.

---

### A3 — Crash-free sessions drop

| Field | Value |
|---|---|
| **Trigger** | `crash_free_sessions` for `environment:production` falls below threshold |
| **Threshold** | **99%** over a 1-hour window (warn), **95%** over a 1-hour window (page) |
| **Channels** | 99% → Slack only; 95% → Slack + email |
| **Owner action** | At 99%, open Sentry → Releases. Identify which release is dragging the rate down. At 95%, follow `RUNBOOK.md §4` — rollback first, investigate after. |
| **Why** | Per-issue alerts miss "death by a thousand cuts" — many small new errors that individually look unimportant but cumulatively break the user experience. Crash-free % captures user-impact directly. |

**Sentry config**: Alerts → Create → "Metric Alert"
- METRIC `crash_free_sessions`
- FILTERS `environment:production`
- THRESHOLD `< 99` over 60 minutes → warn channel
- THRESHOLD `< 95` over 60 minutes → page channel

**Test fire**: hard to fire safely without polluting metrics. Skip
test-firing this one and rely on Sentry's "Preview" button which
shows historical traces against the threshold. Confirm both
thresholds would have fired correctly against a 24h preview.

---

### A4 — `place-order` failure rate

| Field | Value |
|---|---|
| **Trigger** | Spike in `place-order` edge-function errors |
| **Threshold** | **≥3 events** of `event=order_insert_failed`, `next_order_number_failed`, or `order_received_enqueue_threw` within **5 minutes** |
| **Channels** | Slack `#marzipan-alerts` (urgent), email |
| **Owner action** | Open Supabase logs, follow `RUNBOOK.md §2`. Real money is at stake — every failed order is a customer who tried to buy something and couldn't. |
| **Why** | Sentry doesn't see edge-function logs natively. This alert lives in Supabase or wherever you ship logs. |

**Where this alert lives**:
- **Option A (recommended)**: Supabase → Project Settings → Log Drains
  → Webhook → Slack incoming webhook URL. Filter
  `function_name:place-order AND level:error`. Slack handles the
  threshold via Slack's built-in mute / counting workflows.
- **Option B**: Logflare integration → set up a saved query +
  alert. More flexible, more setup.
- **Option C (interim)**: a small Supabase Cron job (`pg_cron` or
  the Supabase scheduled-function pattern) that runs every 5 min,
  counts `event=order_*_failed` rows in `audit_log` (NB: failures
  don't always write audit rows — see below), and posts to Slack
  if count ≥ 3.

> ⚠️ **Caveat for Option C**: failed order inserts (`order_insert_failed`)
> don't reach `audit_log` at all because the order row never committed.
> A purely audit-log-based alert will under-report. Prefer Option A or
> B which read the function's stdout directly.

**Test fire**: temporarily inject a failure in `place-order` (e.g.
`return json(500, { error: 'test' })` early in the handler) on a
preview deploy, fire 3 requests within 5 min, confirm the alert posts.
Revert before merging to production.

---

## Operational expectations

| Scenario | Response time |
|---|---|
| A1 (new issue) | Acknowledge within **24h**. Investigate within 48h. |
| A2 (regression) | Investigate same day. |
| A3 at 99% | Investigate within 1h during business hours. |
| A3 at 95% | Page immediately. Rollback within 15 min. |
| A4 (`place-order` failures) | Acknowledge within **15 minutes**. Rollback within 30 min if cause not obvious. |

These are personal-business-scale targets, not enterprise SLOs. Adjust
once order volume justifies tighter response times.

---

## Mute list (avoid alert fatigue)

Issue patterns we **deliberately** ignore (not alerts; resolve+ignore
when they appear):

- `Failed to fetch dynamically imported module` — chunk recovery
  (filter is in `src/utils/sentry.js:33-35`; if these reach Sentry,
  the filter is broken — that's a bug, not noise to ignore).
- `ResizeObserver loop limit exceeded` — already filtered.
- `Non-Error promise rejection captured with value` — third-party.
- Anything with stack frames in `chrome-extension://`,
  `moz-extension://`, `safari-extension://` — already filtered via
  `denyUrls`.

If a new noise pattern emerges (e.g. a popular ad-blocker injects a
new error string), add it to `IGNORED_MESSAGES` in `src/utils/sentry.js`
rather than ignoring it in the Sentry UI — UI ignores still consume
quota.
