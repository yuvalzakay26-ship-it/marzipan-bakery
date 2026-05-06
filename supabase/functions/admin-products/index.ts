// =====================================================================
// admin-products  —  Edge Function for audited admin product writes.
//
// POST  /functions/v1/admin-products
//   {
//     productId: uuid,
//     patch: {
//       price_agorot?: int,    // ≥ 0
//       is_active?:    boolean,
//       is_sold_out?:  boolean,
//       sort_order?:   int
//     }
//   }
//   → { ok: true, product: {...} }
//
// Why this exists:
//   Browser-side admin updates bypass the audit trail. With RLS now
//   fail-closed on direct UPDATEs to public.products, the admin UI must
//   come through this function. The function:
//     1. Validates the caller's JWT carries app_metadata.role = 'admin'.
//     2. Loads the current row (so we can record the before-state).
//     3. Applies the patch via the service role.
//     4. Writes an audit_log row with {before, after} and the actor id.
// =====================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { corsHeaders, handleOptions } from '../_shared/cors.ts';

const PatchSchema = z.object({
    price_agorot: z.number().int().nonnegative().optional(),
    is_active:    z.boolean().optional(),
    is_sold_out:  z.boolean().optional(),
    sort_order:   z.number().int().optional()
}).refine((p) => Object.keys(p).length > 0, { message: 'empty_patch' });

const RequestSchema = z.object({
    productId: z.string().uuid(),
    patch:     PatchSchema
});

const AUDITED_COLS = ['price_agorot', 'is_active', 'is_sold_out', 'sort_order'] as const;

serve(async (req) => {
    const cors = corsHeaders(req.headers.get('origin'));
    const opts = handleOptions(req);
    if (opts) return opts;

    if (req.method !== 'POST') return j(405, { error: 'method_not_allowed' }, cors);

    const url        = Deno.env.get('SUPABASE_URL');
    const anonKey    = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !anonKey || !serviceKey) {
        return j(500, { error: 'server_misconfigured' }, cors);
    }

    // ---- authenticate caller ----
    const authHeader = req.headers.get('authorization') ?? '';
    if (!authHeader.toLowerCase().startsWith('bearer ')) {
        return j(401, { error: 'missing_token' }, cors);
    }
    const userClient = createClient(url, anonKey, {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } }
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
        return j(401, { error: 'invalid_token' }, cors);
    }
    const role = (userData.user.app_metadata as Record<string, unknown> | undefined)?.role;
    if (role !== 'admin') {
        return j(403, { error: 'forbidden' }, cors);
    }
    const actorId = userData.user.id;

    // ---- parse + validate body ----
    let body: unknown;
    try { body = await req.json(); }
    catch { return j(400, { error: 'invalid_json' }, cors); }

    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
        return j(400, { error: 'validation_failed', details: parsed.error.flatten() }, cors);
    }
    const { productId, patch } = parsed.data;

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    // ---- load before-state for audit diff ----
    const { data: before, error: beforeErr } = await admin
        .from('products')
        .select('id, price_agorot, is_active, is_sold_out, sort_order, deleted_at')
        .eq('id', productId)
        .maybeSingle();
    if (beforeErr) {
        console.error('admin_products_load_failed', beforeErr);
        return j(500, { error: 'load_failed' }, cors);
    }
    if (!before || before.deleted_at) {
        return j(404, { error: 'product_not_found' }, cors);
    }

    // ---- apply update via service role ----
    const { data: after, error: updateErr } = await admin
        .from('products')
        .update(patch)
        .eq('id', productId)
        .select('id, slug, name_he, price_agorot, is_active, is_sold_out, sort_order')
        .single();
    if (updateErr || !after) {
        console.error('admin_products_update_failed', updateErr);
        return j(500, { error: 'update_failed' }, cors);
    }

    // ---- audit ----
    const beforeDiff: Record<string, unknown> = {};
    const afterDiff:  Record<string, unknown> = {};
    for (const col of AUDITED_COLS) {
        if (col in patch) {
            beforeDiff[col] = (before as Record<string, unknown>)[col] ?? null;
            afterDiff[col]  = (after  as Record<string, unknown>)[col] ?? null;
        }
    }

    const { error: auditErr } = await admin.from('audit_log').insert({
        actor_id:    actorId,
        actor_role:  'admin',
        action:      'product.update',
        target_type: 'product',
        target_id:   productId,
        diff:        { before: beforeDiff, after: afterDiff },
        request_id:  req.headers.get('x-request-id'),
        ip_address:  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    });
    if (auditErr) {
        // Audit failures must NOT mask the data update — log loudly and
        // continue. The update has already committed; surfacing a 500
        // here would mislead the caller into thinking it failed.
        console.error('admin_products_audit_failed', auditErr);
    }

    return j(200, { ok: true, product: after }, cors);
});

function j(status: number, body: unknown, cors: Record<string, string>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, 'content-type': 'application/json' }
    });
}
