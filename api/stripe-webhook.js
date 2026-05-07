import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Stripe-authoritative payment confirmation.
//
// The browser redirect to /checkout/success only proves "Stripe sent the user
// somewhere." This endpoint is the single source of truth for "payment really
// happened" — fulfillment, persistence, and notifications must hang off of it,
// not off the success page.
//
// Persistence target: public.stripe_orders / public.stripe_order_items /
// public.stripe_processed_events  (see supabase/migrations/20260508000001_*).
//
// =============================================================================
// VERCEL CONFIG — RAW BODY REQUIRED
// =============================================================================
// Stripe signs the exact bytes of the request body. If Vercel's default JSON
// parser touches the payload (re-stringifying object keys, normalising
// whitespace) the HMAC will not match. Disable the parser and read the raw
// stream ourselves.
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Service-role client. Bypasses RLS — required because the webhook runs
// outside any user session and must INSERT into stripe_orders /
// stripe_order_items / stripe_processed_events. The service role key MUST
// stay server-side; never prefix with VITE_, never log, never return.
//
// Lazy-init: keeping the module-level value lets us return a clear 500 when
// env vars are missing instead of crashing on import.
let _supabase = null;
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabase;
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe-webhook] missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return res.status(500).json({ error: "Server misconfiguration" });
  }
  const supabase = getSupabase();
  if (!supabase) {
    console.error("[stripe-webhook] missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    console.warn("[stripe-webhook] request missing Stripe-Signature header");
    return res.status(400).json({ error: "Missing signature" });
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch (err) {
    console.error("[stripe-webhook] failed to read raw body:", err);
    return res.status(400).json({ error: "Invalid body" });
  }

  // -------------------------------------------------------------------------
  // 1. Signature verification
  // -------------------------------------------------------------------------
  // constructEvent enforces both:
  //   - HMAC SHA256 match against STRIPE_WEBHOOK_SECRET
  //   - Timestamp tolerance (default 5 minutes) — this is what blocks replays
  //     of an old captured payload, since the signed timestamp will fall
  //     outside the window.
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.warn("[stripe-webhook] signature verification failed:", {
      message: err?.message,
    });
    return res.status(400).json({ error: "Invalid signature" });
  }

  // -------------------------------------------------------------------------
  // 2. Event-level idempotency (Supabase-backed)
  // -------------------------------------------------------------------------
  // Read first, before doing any expensive work. The canonical safety net is
  // the UNIQUE on stripe_orders.stripe_session_id (handled inside the RPC),
  // but checking the events ledger up-front turns retries into an O(1) DB
  // lookup with no Stripe API call.
  try {
    const { data: existing, error } = await supabase
      .from("stripe_processed_events")
      .select("stripe_event_id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();
    if (error) {
      console.error("[stripe-webhook] processed-events lookup failed", {
        event_id: event.id,
        message: error.message,
      });
      return res.status(500).json({ error: "Lookup failure" });
    }
    if (existing) {
      console.info("[stripe-webhook] duplicate event ignored", {
        event_id: event.id,
        type: event.type,
      });
      return res.status(200).json({ received: true, duplicate: true });
    }
  } catch (err) {
    console.error("[stripe-webhook] processed-events lookup threw", {
      event_id: event.id,
      message: err?.message,
    });
    return res.status(500).json({ error: "Lookup failure" });
  }

  // -------------------------------------------------------------------------
  // 3. Dispatch
  // -------------------------------------------------------------------------
  let sessionIdForLedger = null;
  try {
    switch (event.type) {
      case "checkout.session.completed":
        sessionIdForLedger = await handleCheckoutSessionCompleted(event, supabase);
        break;

      // TODO(payments): also handle `payment_intent.payment_failed` and
      // `charge.refunded` so order status / refund records stay in sync.
      default:
        console.info("[stripe-webhook] unhandled event type", {
          event_id: event.id,
          type: event.type,
        });
    }
  } catch (err) {
    // Do NOT mark the event processed — returning 5xx tells Stripe to retry,
    // and we want the retry to actually run the handler. The UNIQUE on
    // stripe_orders.stripe_session_id will prevent a duplicate order if a
    // retry fires after a partial failure.
    console.error("[stripe-webhook] handler error:", {
      event_id: event.id,
      type: event.type,
      message: err?.message,
      stack: err?.stack,
    });
    return res.status(500).json({ error: "Handler failure" });
  }

  // -------------------------------------------------------------------------
  // 4. Mark event processed (ledger insert at the END)
  // -------------------------------------------------------------------------
  // Putting this last means: if persistence failed above, we returned 5xx and
  // never reached here, so Stripe will retry and find no ledger row. The
  // handler will run again, the orders UNIQUE will dedup, and the ledger
  // gets its row on success.
  //
  // The ON CONFLICT DO NOTHING (via upsert+ignoreDuplicates) protects against
  // a parallel-delivery race where two workers both reach this point.
  const { error: ledgerError } = await supabase
    .from("stripe_processed_events")
    .upsert(
      {
        stripe_event_id: event.id,
        event_type: event.type,
        session_id: sessionIdForLedger,
      },
      { onConflict: "stripe_event_id", ignoreDuplicates: true }
    );
  if (ledgerError) {
    // The order is already persisted — losing the ledger row is recoverable
    // (next retry will see no event row, the orders UNIQUE will dedup, and
    // the ledger insert will succeed then). Log loudly but don't 5xx, since
    // a 5xx here would cause Stripe to retry a successful order.
    console.error("[stripe-webhook] ledger insert failed (order already saved)", {
      event_id: event.id,
      message: ledgerError.message,
    });
  }

  return res.status(200).json({ received: true });
}

// Returns the session id we acted on (for the ledger row), or null when the
// event was skipped (e.g. unpaid async payment).
async function handleCheckoutSessionCompleted(event, supabase) {
  const session = event.data.object;
  const sessionId = session.id;

  // Stripe also sends `payment_status: 'unpaid'` for async payment methods
  // (e.g. bank debit) at this point. For card-only checkout we expect 'paid',
  // but guard explicitly so async methods don't silently slip through later.
  if (session.payment_status !== "paid") {
    console.info("[stripe-webhook] session not yet paid — skipping", {
      event_id: event.id,
      session_id: sessionId,
      payment_status: session.payment_status,
    });
    return sessionId;
  }

  // Re-fetch with line items expanded. The event payload omits them by default,
  // and we want the canonical product list as Stripe recorded it (not what the
  // client sent in the cart) for the eventual order record.
  const fullSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "payment_intent"],
  });

  const order = normalizeOrderPayload(fullSession);

  // -------------------------------------------------------------------------
  // Atomic persist (order + items in one Postgres transaction).
  // -------------------------------------------------------------------------
  // The RPC inserts the order with ON CONFLICT (stripe_session_id) DO NOTHING,
  // then inserts items keyed off the returned order id. plpgsql wraps both in
  // an implicit transaction — if items fail, the order insert rolls back too.
  // No partial persistence is possible.
  //
  // Returns:
  //   - new uuid → first time we've seen this session, order created.
  //   - null     → session already exists (different event_id, same cs_…),
  //                no work to do; the items already exist on the prior row.
  const itemsPayload = order.lineItems.map((line) => ({
    product_id: line.stripeProductId,
    product_name: line.description ?? "Unknown item",
    quantity: line.quantity ?? 1,
    unit_price:
      line.quantity && line.quantity > 0 && Number.isFinite(line.amountTotal)
        ? Math.round(line.amountTotal / line.quantity)
        : line.amountTotal ?? 0,
  }));

  const { data: orderId, error: rpcError } = await supabase.rpc("create_stripe_order", {
    p_session_id: order.sessionId,
    p_payment_intent_id: order.paymentIntentId,
    p_customer_name: order.customer.name,
    p_customer_phone: order.customer.phone,
    p_customer_email: order.customer.email,
    p_customer_address: order.customer.address,
    p_total_amount: order.amountTotal ?? 0,
    p_currency: order.currency ?? "ils",
    p_payment_status: order.paymentStatus ?? "paid",
    p_raw_payload: fullSession,
    p_items: itemsPayload,
  });

  if (rpcError) {
    // Throw so the outer handler returns 5xx → Stripe retries.
    console.error("[stripe-webhook] persistence failure", {
      event_id: event.id,
      session_id: sessionId,
      message: rpcError.message,
      details: rpcError.details,
      hint: rpcError.hint,
    });
    throw new Error(`create_stripe_order failed: ${rpcError.message}`);
  }

  if (orderId === null) {
    console.info("[stripe-webhook] duplicate session ignored", {
      event_id: event.id,
      session_id: sessionId,
    });
    return sessionId;
  }

  console.info("[stripe-webhook] order created", {
    event_id: event.id,
    order_id: orderId,
    session_id: sessionId,
    payment_intent: order.paymentIntentId,
    amount_total: order.amountTotal,
    currency: order.currency,
    customer_email: order.customer.email,
    line_count: itemsPayload.length,
  });

  // -------------------------------------------------------------------------
  // FULFILLMENT PIPELINE — TODO
  // -------------------------------------------------------------------------
  // The order row now exists with fulfillment_status='pending'. Each step
  // below is a separate, independently shippable piece of work; do not
  // bundle them into one mega-PR.
  //
  // TODO(fulfillment-pipeline):
  //   Admin UI / background worker transitions fulfillment_status through
  //   preparing → ready → fulfilled. Schema in 20260508000001_stripe_orders.sql
  //   already accepts those values via the check constraint.
  //
  // TODO(admin-notifications):
  //   On every order_created log line, page the bakery (Slack/SMS/WhatsApp).
  //   Either: (a) database trigger calling a Supabase Edge Function via
  //   pg_net, or (b) inline call to a notify- endpoint here. Prefer (a) so
  //   notifications survive webhook crashes after persistence.
  //
  // TODO(receipt-generation):
  //   Stripe sends its own receipt by default. Decide whether to suppress
  //   (set `receipt_email: null` on PaymentIntent) and send a branded PDF,
  //   or supplement Stripe's receipt with a confirmation email.
  //
  // TODO(inventory-management):
  //   Decrement public.products stock for each item. Must be atomic with the
  //   order insert — easiest path: extend create_stripe_order() to take a
  //   product-id mapping and update products in the same transaction. Until
  //   this lands, overselling on limited-stock items is possible.
  // -------------------------------------------------------------------------

  return sessionId;
}

function normalizeOrderPayload(session) {
  const customer = session.customer_details ?? {};
  const lineItems = (session.line_items?.data ?? []).map((line) => ({
    description: line.description,
    quantity: line.quantity,
    amountSubtotal: line.amount_subtotal,
    amountTotal: line.amount_total,
    currency: line.currency,
    stripeProductId:
      typeof line.price?.product === "string"
        ? line.price.product
        : line.price?.product?.id ?? null,
  }));

  return {
    sessionId: session.id,
    paymentIntentId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    amountSubtotal: session.amount_subtotal,
    currency: session.currency,
    createdAt: session.created ? new Date(session.created * 1000).toISOString() : null,
    customer: {
      email: customer.email ?? null,
      name: customer.name ?? null,
      phone: customer.phone ?? null,
      address: customer.address ?? null,
    },
    metadata: session.metadata ?? {},
    lineItems,
  };
}

// =============================================================================
// OPERATOR INSTRUCTIONS
// =============================================================================
//
// 1. APPLY THE MIGRATION
//      supabase db push                         # against the linked project
//    OR via Supabase Dashboard -> SQL Editor:
//      paste supabase/migrations/20260508000001_stripe_orders.sql
//
// 2. CREATE THE WEBHOOK ENDPOINT IN STRIPE
//    Production URL: https://marzipan-bakery.vercel.app/api/stripe-webhook
//    (NOT the apex marzipanbakery.com — that still serves the WordPress site.)
//
//    Stripe Dashboard -> Developers -> Webhooks -> Add endpoint
//      - Endpoint URL: <production URL above>
//      - Events to send: checkout.session.completed
//        (Add payment_intent.payment_failed and charge.refunded once those
//        handlers are implemented.)
//      - API version: leave on "latest API version" unless you need to pin.
//
// 3. CONFIGURE VERCEL ENV VARS (Settings -> Environment Variables)
//      STRIPE_SECRET_KEY            (server-only)   sk_live_... / sk_test_...
//      STRIPE_WEBHOOK_SECRET        (server-only)   whsec_...   from the endpoint detail page
//      SUPABASE_URL                 (server-only)   https://<project>.supabase.co
//      SUPABASE_SERVICE_ROLE_KEY    (server-only)   eyJ...   (Settings -> API -> service_role)
//    Redeploy after adding — env var changes require a new deployment.
//
//    SAFETY: never prefix any of the above with VITE_. The service role key
//    grants unrestricted DB access; in the client bundle it would let any
//    visitor read every order.
//
// 4. LOCAL TESTING WITH STRIPE CLI
//    Install: https://stripe.com/docs/stripe-cli
//
//    a. Log in once:
//         stripe login
//
//    b. Run the dev server:
//         vercel dev           # API routes at http://localhost:3000/api/...
//       (Plain `vite` does NOT run api/ functions.)
//
//    c. Forward Stripe events. The CLI prints a `whsec_...` value — paste
//       into local .env as STRIPE_WEBHOOK_SECRET (DIFFERENT from the dashboard
//       one), then restart `vercel dev`:
//         stripe listen --forward-to localhost:3000/api/stripe-webhook
//
//    d. Trigger a test event:
//         stripe trigger checkout.session.completed
//       Watch logs for "[stripe-webhook] order created" and 200.
//       Verify in Supabase:
//         select id, stripe_session_id, total_amount, fulfillment_status
//           from stripe_orders order by created_at desc limit 5;
//
//    e. Replay-attack check: copy a payload + signature from CLI output and
//       re-POST it after ~10 minutes with curl → expect 400 (timestamp out
//       of tolerance window).
//
//    f. Duplicate-event check: from the Stripe Dashboard -> recent delivery,
//       click "Resend". Second delivery should log "duplicate event ignored"
//       and 200 without re-running the handler. Confirm only one row in
//       stripe_orders for that session.
//
//    g. Crash-recovery check: temporarily comment out the ledger insert,
//       trigger an event, then restore the insert and resend the same event.
//       The orders UNIQUE constraint should dedup (handler logs "duplicate
//       session ignored") and only one order row exists.
//
// =============================================================================
