// =====================================================================
// Server-side helper to enqueue a notification.
// Idempotent on `idempotency_key`. Used by place-order, payment-webhook,
// admin status changes, the campaign runner, etc.
// =====================================================================

import { applyShabbatGuard } from './shabbat.ts';
import { render, type TemplateVars } from './templates.ts';

export interface EnqueueInput {
    customerId?: string | null;
    orderId?:    string | null;
    campaignId?: string | null;
    channel:     'sms' | 'whatsapp' | 'email';
    kind:        string;
    toPhoneE164: string;
    vars:        TemplateVars;
    scheduledFor?: Date;
    idempotencyKey: string;
    extra?: Record<string, unknown>;
}

export async function enqueueNotification(
    admin: any,
    input: EnqueueInput
): Promise<{ ok: true; id: string } | { ok: false; reason: string }> {
    if (!input.toPhoneE164 || !/^\+[1-9][0-9]{6,14}$/.test(input.toPhoneE164)) {
        return { ok: false, reason: 'invalid_phone' };
    }
    const scheduled = input.scheduledFor ?? new Date();
    const earliest = applyShabbatGuard(scheduled);

    let body: string;
    try { body = render(input.kind, input.channel, input.vars); }
    catch (e) { return { ok: false, reason: `render_failed:${(e as Error).message}` }; }

    const { data, error } = await admin
        .from('notifications')
        .insert({
            customer_id: input.customerId ?? null,
            order_id:    input.orderId ?? null,
            campaign_id: input.campaignId ?? null,
            channel:     input.channel,
            kind:        input.kind,
            to_phone_e164: input.toPhoneE164,
            body,
            extra:       input.extra ?? {},
            scheduled_for:    scheduled.toISOString(),
            earliest_send_at: earliest.toISOString(),
            idempotency_key:  input.idempotencyKey,
            status: 'pending'
        })
        .select('id')
        .single();

    // 23505 = unique violation on idempotency_key — already enqueued.
    if (error && (error as any).code === '23505') {
        return { ok: true, id: 'duplicate' };
    }
    if (error || !data) {
        return { ok: false, reason: (error as any)?.message ?? 'insert_failed' };
    }
    return { ok: true, id: data.id };
}
