# Observability Runbook

Operational guide for the Sentry + structured-edge-log stack. Read this
before paging yourself at 2am.

---

## 0. Bootstrap (one-time, before going live)

The code is live; the **infrastructure** still needs to be wired up in
dashboards. Walk this list once, top to bottom.

### 0.1 Sentry project

1. Create org (if none) at sentry.io. Pick the **Developer / free** plan
   to start — quota is 5k errors/mo, plenty for this site.
2. Create project: **Platform: React**, name `marzipanbakery-web`.
3. Note three values from Settings → Projects → marzipanbakery-web:
   - `DSN` — public, goes in the client bundle.
   - **Org slug** (URL fragment after `sentry.io/organizations/`).
   - **Project slug** (`marzipanbakery-web`).
4. Settings → Account → API → **Auth Tokens** → create token with
   scopes: `project:read`, `project:releases`, `org:read`. This is the
   build-time token.
5. Settings → Projects → marzipanbakery-web → **Environments**: enable
   `production`. (Sentry auto-creates env names from event tags, so this
   only matters if you want to pin display order.)

### 0.2 Vercel environment variables

Project → Settings → Environment Variables. Set **Production** scope
for all six. Do **not** set them in Preview unless you want preview
crashes flowing to the same inbox (recommended: leave preview blank so
the SDK no-ops on previews).

| Name | Value | Notes |
|---|---|---|
| `VITE_SENTRY_DSN` | the DSN from 0.1 | Public, embedded in bundle. |
| `VITE_APP_VERSION` | `$VERCEL_GIT_COMMIT_SHA` | **Critical — see warning below.** |
| `VITE_SENTRY_ENVIRONMENT` | `production` | Optional; defaults to Vite's MODE. |
| `SENTRY_AUTH_TOKEN` | token from 0.1 | Build-time only. **Mark as Secret.** |
| `SENTRY_ORG` | org slug | Build-time. |
| `SENTRY_PROJECT` | `marzipanbakery-web` | Build-time. |

> ⚠️ **`VITE_APP_VERSION` gotcha.** Vercel auto-injects
> `VERCEL_GIT_COMMIT_SHA` at build time, but **does not** expose it to
> the client bundle (only `VITE_*` vars are inlined by Vite). If you
> skip this, the upload will tag a release SHA but runtime events will
> have `release: undefined` and Sentry **will not match events to
> releases or source maps**. You'll get unsymbolicated stack traces
> with no release attribution. Always set it explicitly as
> `$VERCEL_GIT_COMMIT_SHA`.

### 0.3 Verify the deploy

After redeploying with the env vars set:

```powershell
# 1. Bundle should contain the DSN substring
$origin = "https://marzipanbakery.com"
(Invoke-WebRequest "$origin/" -UseBasicParsing).Content | Select-String "ingest.sentry.io"

# 2. Source maps must be 404 from the public CDN
$mapProbe = Invoke-WebRequest "$origin/assets/main.js.map" -SkipHttpErrorCheck
$mapProbe.StatusCode  # expect 404

# 3. Inspect a real bundle's mapping comment — should be absent
$asset = (Invoke-WebRequest "$origin/" -UseBasicParsing).Content `
    | Select-String -Pattern '/assets/[^"]+\.js' -AllMatches `
    | ForEach-Object { $_.Matches.Value } | Select-Object -First 1
(Invoke-WebRequest "$origin$asset" -UseBasicParsing).Content `
    | Select-String "sourceMappingURL"  # expect: no output
```

Then: open the production site, open DevTools console, run
`throw new Error("sentry-bootstrap-test")`. Within ~10s, the event
should appear in Sentry under the production release. The stack frame
must show readable function names (`onClick`, `CartButton`, etc.) — if
it's `e`, `t`, `r`, source maps did not upload. Re-check 0.2.

### 0.4 Cleanup test events

After verification: Sentry → Issues → resolve and **Discard** the
`sentry-bootstrap-test` issue so it doesn't pollute counts.

---

## 1. How to investigate a frontend crash

1. **Sentry → Issues → Unresolved**. Newest first.
2. Open the issue. Inspect:
   - **Release** tag → matches a recent commit SHA?
   - **Browser/OS** → mobile Safari is the common offender post-deploy.
   - **Stack trace** → readable filenames (e.g.
     `src/Components/.../X.jsx`)? If minified, source maps failed for
     this release — see §0.3.
3. **Breadcrumbs** show the user's last ~5 navigations, fetches,
   clicks. PII is scrubbed (emails, IL phones, long digits) — if you
   see `[email]`, that's the scrubber working.
4. **Tags**: `source: react.error_boundary` means it came from a render
   crash; otherwise it's a global handler.
5. If it correlates with an edge function (e.g. checkout flow), the
   user's `Network` breadcrumb URL → strip path → grep Supabase logs
   for the same minute. Use `x-request-id` if you can recover it from
   the user's session (see §2).

**Decision tree for "is this a real crash?":**
- Recurring across releases, multiple users → real bug, prioritize.
- Single user, single session, stack trace ends in `chrome-extension://`
  or `safari-extension://` → extension noise, **not us**. Mark resolved
  + ignore. (Our `denyUrls` should catch most of these — if many slip
  through, tighten the regex in `src/utils/sentry.js`.)
- Spike in `Failed to fetch dynamically imported module` etc. →
  **bug in chunk-recovery filter** (those should never reach Sentry).
  See §6.

---

## 2. How to trace an order failure end-to-end

The correlation id (`reqId`) is the join key across:

- The browser's **fetch response** (`x-request-id` header).
- The **edge function's structured logs** (`reqId` field on every line).
- The **`audit_log.request_id`** column.

### 2a. From a customer report ("my order failed at 14:32")

1. Identify likely time window in Asia/Jerusalem.
2. Supabase → **Edge Functions → place-order → Logs**. Filter by
   `level=error` or `event=order_insert_failed` /
   `event=order_received_enqueue_failed` in the window.
3. Copy the `reqId` from the matching error line.
4. In the same logs view, **filter by that `reqId`** to get every line
   from that request — `info`, `warn`, and `error` together.
5. Cross-check `audit_log` if the order partly committed:
   ```sql
   select * from audit_log where request_id = '<reqId>';
   ```

### 2b. From a Sentry frontend event

The browser doesn't currently propagate `x-request-id` into Sentry
events (the response header is only available to the fetch caller).
For now, use:

- The Sentry **breadcrumb's URL** (`/functions/v1/place-order`).
- The Sentry **timestamp** + **release SHA**.
- Window-search edge logs by `fn=place-order` for that minute.

Future improvement: have the cart's submit handler attach the
`x-request-id` from the response to the next Sentry breadcrumb (or a
custom tag) when the request fails. Ticket this if it becomes painful.

### 2c. Structured event vocabulary

Stable event names you can grep on (all `fn=place-order` unless noted):

| Event | Meaning | Severity |
|---|---|---|
| `order_placed` | Success path. | info |
| `order_insert_failed` | DB insert failed. | error |
| `next_order_number_failed` | RPC for sequence failed. | error |
| `order_received_enqueue_failed` | SMS receipt enqueue returned `ok:false`. | warn |
| `order_received_enqueue_threw` | SMS enqueue threw an exception. | error |
| `abandoned_checkout_cleanup_failed` | Cleanup race; order is fine. | warn |
| `admin_products_load_failed` (`fn=admin-products`) | Pre-update read failed. | error |
| `admin_products_update_failed` | UPDATE failed. | error |
| `admin_products_audit_failed` | Update committed, audit row didn't. | error |
| `admin_products_updated` | Success path. | info |

Treat the event name like a metric. Filter by `event=order_placed`
+ a time window for daily order volume without parsing free text.

---

## 3. How to identify a bad deploy

Three signals, in order of reliability:

1. **Sentry → Releases**: spike in `Crash Free Sessions %` drop on the
   newest release. Threshold: a fall below **99%** for production
   = investigate. Below **95%** = rollback first, investigate after.
2. **Sentry → Issues → "First seen in: vX"** for the latest release.
   New error groups attached only to the new SHA = regression.
3. **Vercel → Deployments → Functions → Logs** for `place-order`:
   sudden rise in 5xx `event=order_*_failed` in the minutes after a
   promote.

If unsure: open the **Discover query** (Sentry) for last 1h, group by
`release`, sort by event count. The freshest release should not be
dominating the chart.

---

## 4. How to rollback safely

Vercel makes this trivial — **promote** an older deployment back to
production rather than reverting commits.

1. Vercel → Deployments → find the last known-good deploy (green
   check, low Sentry issue count).
2. `⋯` menu → **Promote to Production**. Vercel atomically swaps the
   alias; users on the bad version get the new bundle on their next
   nav (or via chunk-recovery, see §6).
3. **Tell Sentry**: in Releases, **mark the bad release as "Failed"**
   (doesn't change behavior, but historical analysis benefits).
4. Then revert the underlying commit on `main` so the next deploy
   doesn't reintroduce the bug. PR with a clear "reverts: <sha>"
   message.

**Do NOT**: `git push --force` to main, or amend the bad commit. The
bad SHA must remain in history so the bad release tag in Sentry stays
linkable.

---

## 5. How to correlate `reqId` across systems

```
Browser fetch ──[x-request-id: R]──► Edge Function (place-order)
                                          │
                                          ├── log lines: { reqId: R, ... }
                                          │
                                          └── audit_log.request_id = R
```

If the browser sets its own `x-request-id` in the request, it survives
the round trip — `requestId(req)` honors any upstream value ≤64 chars
(`supabase/functions/_shared/logger.ts:78-82`). Otherwise the function
mints a UUID and echoes it back in the response header.

To bridge a Sentry crash to logs **today**: use timestamp + URL + IP
fingerprint. To bridge directly via `reqId`: see §2b future-improvement.

---

## 6. How to verify chunk recovery isn't polluting Sentry

Chunk-load failures are an **expected** post-deploy condition (stale
tab requests an asset path that no longer exists). The system must
heal silently. The contract:

- `src/utils/chunkReloader.js` triggers a single reload (capped at 2
  per session).
- `src/utils/sentry.js` filters chunk errors at three layers:
  - `ignoreErrors` regex list (drops by message before send).
  - `denyUrls` for extension origins.
  - `beforeSend` calls `isChunkLoadError` and returns `null`.
- `ErrorBoundary.componentDidCatch` short-circuits chunk errors before
  calling `reportRenderError`.

**Manual verification (do this once after every deploy that changes
either file):**

1. Open production site in a tab. Note the bundle hash in the network
   tab (e.g. `index-AbCd123.js`).
2. Trigger a redeploy.
3. After deploy completes, in the original tab, navigate to a lazy
   route (e.g. `/products` from home if products is split — check
   `src/App.jsx` for `lazy()` imports).
4. Expected: brief blank cream screen, then page reloads automatically
   on the new bundle.
5. **Check Sentry**: no new event in the last 5 minutes for that
   session. If you see `Failed to fetch dynamically imported module`
   or `Loading chunk … failed` in the inbox, **the filter is broken**
   — re-verify `chunkReloader.CHUNK_ERROR_PATTERN` and
   `sentry.IGNORED_MESSAGES` haven't drifted apart.

**Reset session counter when testing:**

```js
// In DevTools console, before retesting:
sessionStorage.removeItem('mb:chunk-reload-at');
sessionStorage.removeItem('mb:chunk-reload-count');
```

---

## 7. Validation checklist

System is operational when **all** of these are true:

- [ ] Sentry receives the `sentry-bootstrap-test` event (§0.3).
- [ ] Stack trace shows readable filenames (source maps decoded).
- [ ] Event tagged with the current commit SHA as `release`.
- [ ] `https://marzipanbakery.com/assets/<anything>.map` returns 404.
- [ ] Bundle source contains no `sourceMappingURL` comment.
- [ ] A real `place-order` request shows `x-request-id` header in the
      browser network tab and the same id in Supabase edge logs.
- [ ] `audit_log.request_id` is populated for the matching order row.
- [ ] Triggering a chunk-load error (deploy + nav stale tab) results
      in a silent reload with **no** Sentry event.
- [ ] No customer phone, email, or full digit run appears in any
      Sentry breadcrumb or message (spot-check 5 recent events).
- [ ] All four alerts in `ALERTS.md` are configured and have fired at
      least once during testing (use the test-fire steps in that doc).

Until every box is checked, treat observability as **incomplete** —
do not begin Payments work. Payments will generate alerts that need a
working pipeline to be useful.
