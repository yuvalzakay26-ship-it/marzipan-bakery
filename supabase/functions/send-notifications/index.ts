// =====================================================================
// send-notifications  —  drains the notifications queue.
//
// POST /functions/v1/send-notifications   (no body)
// Headers: x-cron-secret: <CRON_SHARED_SECRET>
//
// Pulls up to BATCH pending rows whose earliest_send_at <= now() and:
//   - dispatches via the matching channel adapter
//   - marks sent / failed
//   - increments attempts on transient failure (max 5, then give up)
//
// Runs idempotently — if two cron tickers overlap, both will SELECT the
// same rows but the UPDATE-and-skip-if-already-sent pattern keeps it safe.
// We rely on attempts < 1 for the SELECT to avoid double-send: the first
// worker to touch a row bumps attempts to 1 immediately.
// =====================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { sendByChannel } from '../_shared/notifications/providers.ts';

const BATCH = 25;
const MAX_ATTEMPTS = 5;

serve(async (req) => {
    if (req.method !== 'POST') return new Response('method_not_allowed', { status: 405 });

    const cronSecret = Deno.env.get('CRON_SHARED_SECRET');
    const provided   = req.headers.get('x-cron-secret');
    if (cronSecret && provided !== cronSecret) {
        return new Response('unauthorized', { status: 401 });
    }

    const url        = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceKey) return new Response('server_misconfigured', { status: 500 });
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const nowIso = new Date().toISOString();

    // Atomically claim the next batch by bumping attempts. We can't do real
    // SELECT FOR UPDATE through the JS client, so we use UPDATE ... RETURNING
    // with an inline subquery to claim N rows.
    const { data: claimed, error: claimErr } = await admin.rpc('claim_pending_notifications', {
        _now: nowIso,
        _limit: BATCH
    });
    if (claimErr) {
        // RPC missing? fall back to a non-atomic approach. The DB migration
        // installs the RPC; this branch only fires before it's deployed.
        const fallback = await admin
            .from('notifications')
            .select('*')
            .eq('status', 'pending')
            .lte('earliest_send_at', nowIso)
            .lt('attempts', MAX_ATTEMPTS)
            .order('scheduled_for', { ascending: true })
            .limit(BATCH);
        return await dispatchBatch(admin, fallback.data ?? []);
    }
    return await dispatchBatch(admin, claimed ?? []);
});

async function dispatchBatch(admin: any, rows: any[]): Promise<Response> {
    const sentIds: string[]  = [];
    const failedIds: { id: string; reason: string }[] = [];

    for (const row of rows) {
        let result;
        try {
            result = await sendByChannel(row.channel, row.to_phone_e164, row.body);
        } catch (err) {
            result = { ok: false, reason: `threw:${(err as Error).message}` };
        }
        if (result.ok) {
            await admin.from('notifications').update({
                status:  'sent',
                sent_at: new Date().toISOString(),
                failure_reason: null,
                extra:   { ...(row.extra ?? {}), providerRef: result.providerRef }
            }).eq('id', row.id);
            sentIds.push(row.id);
        } else {
            const finalFail = (row.attempts ?? 0) + 1 >= MAX_ATTEMPTS;
            await admin.from('notifications').update({
                status: finalFail ? 'failed' : 'pending',
                failure_reason: result.reason ?? 'unknown'
            }).eq('id', row.id);
            failedIds.push({ id: row.id, reason: result.reason ?? 'unknown' });
        }
    }

    return new Response(JSON.stringify({
        attempted: rows.length, sent: sentIds.length, failed: failedIds.length, failures: failedIds
    }), { status: 200, headers: { 'content-type': 'application/json' } });
}
