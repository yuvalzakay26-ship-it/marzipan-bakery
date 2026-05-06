// =====================================================================
// P0 integration smoke tests — exercise the three production blockers
// against a running Supabase instance.
//
// Usage (local):
//   supabase start
//   supabase functions serve --no-verify-jwt
//   SUPABASE_URL=http://127.0.0.1:54321 \
//   SUPABASE_ANON_KEY=<anon> \
//   SUPABASE_SERVICE_ROLE_KEY=<service> \
//   deno test --allow-net --allow-env supabase/tests/p0_integration.test.ts
//
// These are intentionally network tests, not unit tests — the bugs they
// catch are concurrency bugs that only show up against a real Postgres
// instance with the new RPCs and unique indexes in place.
// =====================================================================

import { assert, assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const URL          = Deno.env.get('SUPABASE_URL');
const ANON_KEY     = Deno.env.get('SUPABASE_ANON_KEY');
const SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!URL || !ANON_KEY || !SERVICE_KEY) {
    console.warn(
        '[p0_integration.test.ts] skipping: SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY not set'
    );
}

const skip = !URL || !ANON_KEY || !SERVICE_KEY;

function fnUrl(name: string): string {
    return `${URL!.replace(/\/$/, '')}/functions/v1/${name}`;
}

async function placeOrder(idemKey: string | null, phone: string) {
    const headers: Record<string, string> = {
        'content-type':  'application/json',
        'apikey':        ANON_KEY!,
        'authorization': `Bearer ${ANON_KEY!}`
    };
    if (idemKey) headers['x-idempotency-key'] = idemKey;
    return await fetch(fnUrl('place-order'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
            customer: { name: 'Test User', phone, address: '1 Marzipan St' },
            items:    [{ product_id: 1, quantity: 1 }]
        })
    });
}

// ---------------------------------------------------------------------
// 1. Rate limiting actually returns 429 after the limit is exceeded.
//
// place-order is 5 / 5min / phone. The 6th call from the same phone
// must be blocked. We use a unique phone per test run so we don't
// stomp on previous fixtures.
// ---------------------------------------------------------------------
Deno.test({
    name: 'place-order: rate limit returns 429 after threshold',
    ignore: skip,
    fn: async () => {
        const phone  = `+97250${Math.floor(1000000 + Math.random() * 8999999)}`;
        const limit  = 5;
        const burst  = limit + 3;
        const codes: number[] = [];
        for (let i = 0; i < burst; i++) {
            const r = await placeOrder(null, phone);
            codes.push(r.status);
            await r.body?.cancel();
        }
        // Some of the first 5 may legitimately fail (e.g. invalid product)
        // — what matters is that *at least one* of the trailing calls is
        // rejected with 429 (rate limited). Anything else means the
        // limiter silently allowed a burst through.
        const tail = codes.slice(limit);
        assert(
            tail.includes(429),
            `expected at least one 429 in tail of ${JSON.stringify(codes)}`
        );
    }
});

// ---------------------------------------------------------------------
// 2. request-otp: 3 / 10min / phone. 4th call must 429.
// ---------------------------------------------------------------------
Deno.test({
    name: 'request-otp: rate limit returns 429 after threshold',
    ignore: skip,
    fn: async () => {
        const phone = `+97250${Math.floor(1000000 + Math.random() * 8999999)}`;
        const codes: number[] = [];
        for (let i = 0; i < 5; i++) {
            const r = await fetch(fnUrl('request-otp'), {
                method: 'POST',
                headers: {
                    'content-type':  'application/json',
                    'apikey':        ANON_KEY!,
                    'authorization': `Bearer ${ANON_KEY!}`
                },
                body: JSON.stringify({ phone })
            });
            codes.push(r.status);
            await r.body?.cancel();
        }
        assert(
            codes.includes(429),
            `expected a 429 in ${JSON.stringify(codes)}`
        );
    }
});

// ---------------------------------------------------------------------
// 3. Idempotent retry returns the SAME order. Two place-order calls
//    with the same x-idempotency-key must produce one row in `orders`.
// ---------------------------------------------------------------------
Deno.test({
    name: 'place-order: same idempotency key returns same order',
    ignore: skip,
    fn: async () => {
        const phone = `+97250${Math.floor(1000000 + Math.random() * 8999999)}`;
        const key   = `test-${crypto.randomUUID()}`;
        const r1 = await placeOrder(key, phone);
        const j1 = await r1.json().catch(() => null);
        const r2 = await placeOrder(key, phone);
        const j2 = await r2.json().catch(() => null);

        // Either both succeed and return the same order, or both fail
        // identically (e.g. invalid_branch). The bug we're guarding
        // against is two distinct successful orders.
        assertEquals(r1.status, r2.status);
        if (r1.status === 200) {
            const id1 = j1?.order_id ?? j1?.orderId;
            const id2 = j2?.order_id ?? j2?.orderId;
            assert(id1 && id2, 'expected order ids on both responses');
            assertEquals(id1, id2);

            // And exactly one row in the DB.
            const admin = createClient(URL!, SERVICE_KEY!, { auth: { persistSession: false } });
            const { count, error } = await admin
                .from('orders')
                .select('id', { count: 'exact', head: true })
                .eq('order_idempotency_key', key);
            assert(!error, `db error: ${error?.message}`);
            assertEquals(count, 1);
        }
    }
});

// ---------------------------------------------------------------------
// 4. Concurrent place-order calls do not collide on order_number.
//    Fires N requests in parallel for distinct phones; asserts that
//    every successful order has a distinct order_number.
// ---------------------------------------------------------------------
Deno.test({
    name: 'place-order: concurrent orders allocate distinct order_numbers',
    ignore: skip,
    fn: async () => {
        const N = 8;
        const phones = Array.from({ length: N }, () =>
            `+97250${Math.floor(1000000 + Math.random() * 8999999)}`
        );
        const results = await Promise.all(phones.map((p) => placeOrder(null, p)));
        const bodies  = await Promise.all(results.map((r) => r.json().catch(() => null)));

        const numbers = bodies
            .map((b) => b?.orderNumber)
            .filter(Boolean) as string[];

        const unique = new Set(numbers);
        assertEquals(unique.size, numbers.length,
            `duplicate order_numbers detected: ${JSON.stringify(numbers)}`);
    }
});
