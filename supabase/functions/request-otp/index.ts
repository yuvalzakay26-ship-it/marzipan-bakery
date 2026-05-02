// =====================================================================
// request-otp  —  starts a phone-OTP login flow.
//
// We delegate to Supabase Auth signInWithOtp (channel='sms') so we don't
// own SMS delivery directly. In Israel that means configuring an SMS
// provider in Supabase Auth (Twilio / Inforu via Twilio webhook).
//
// This wrapper exists for: rate limiting, normalization, audit logging.
// =====================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { z } from 'https://esm.sh/zod@3.23.8';
import { corsHeaders, handleOptions } from '../_shared/cors.ts';
import { checkRateLimit } from '../_shared/rate-limit.ts';
import { normalizeILPhone, isE164 } from '../_shared/phone.ts';

const Schema = z.object({ phone: z.string().min(7).max(20) });

serve(async (req) => {
    const cors = corsHeaders(req.headers.get('origin'));
    const opts = handleOptions(req);
    if (opts) return opts;

    if (req.method !== 'POST') return j(405, { error: 'method_not_allowed' }, cors);

    const url        = Deno.env.get('SUPABASE_URL')!;
    const anonKey    = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin      = createClient(url, serviceKey, { auth: { persistSession: false } });
    const auth       = createClient(url, anonKey,    { auth: { persistSession: false } });

    let body: unknown;
    try { body = await req.json(); } catch { return j(400, { error: 'invalid_json' }, cors); }
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return j(400, { error: 'validation_failed' }, cors);

    const phoneE164 = normalizeILPhone(parsed.data.phone);
    if (!phoneE164 || !isE164(phoneE164)) return j(400, { error: 'invalid_phone' }, cors);

    // 3 OTP requests per phone per 10 min.
    const okPhone = await checkRateLimit(admin, `otp:${phoneE164}`, 3, 600);
    // 10 OTP requests per IP per 10 min.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const okIp    = await checkRateLimit(admin, `otp:ip:${ip}`, 10, 600);
    if (!okPhone || !okIp) return j(429, { error: 'rate_limited' }, cors);

    const { error } = await auth.auth.signInWithOtp({ phone: phoneE164 });
    if (error) {
        console.error('otp_send_failed', error);
        return j(500, { error: 'otp_send_failed' }, cors);
    }

    return j(200, { ok: true }, cors);
});

function j(status: number, body: unknown, cors: Record<string, string>) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...cors, 'content-type': 'application/json' }
    });
}
