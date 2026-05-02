// =====================================================================
// Loyalty engine — server-side primitives.
//
// Rules (subject to change via admin in Phase 4):
//   - 1 point per ₪1 spent (so 1 agora = 0.01 points; we round down).
//   - Tier (computed by trigger from total_orders): bronze < 5,
//     silver 5-14, gold 15-29, legend 30+. The trigger keeps the column
//     in sync — no manual recompute needed here.
//   - 5th paid order → milestone reward: ₪25 promo code.
//   - Birthday → birthday reward: ₪20 promo code, 30-day expiry.
//
// Promo codes are auto-generated and inserted into `promotions` so the
// existing place-order validation logic accepts them transparently.
// =====================================================================

const POINT_PER_AGORA = 0.01;          // 100 agorot = 1 point
const BIRTHDAY_REWARD_AGOROT  = 2000;  // ₪20
const MILESTONE_REWARD_AGOROT = 2500;  // ₪25
const REFERRAL_REWARD_AGOROT  = 2000;  // ₪20 each side

const MILESTONE_ORDER_NUMBER = 5;      // every 5th paid order

/** Insert a single-use promotion and return the code. */
async function issueOneUsePromo(
    admin: any,
    {
        amountAgorot,
        prefix,
        validDays,
        note
    }: { amountAgorot: number; prefix: string; validDays: number; note: string }
): Promise<{ id: string; code: string } | null> {
    const code = `${prefix}-${randomCode(6)}`;
    const ends = new Date(Date.now() + validDays * 86_400_000).toISOString();
    const { data, error } = await admin.from('promotions').insert({
        code,
        kind: 'amount_off',
        value: amountAgorot,
        min_subtotal_agorot: 0,
        max_uses: 1,
        is_active: true,
        ends_at: ends,
        notes: note
    }).select('id, code').single();
    if (error || !data) {
        console.error('issue_promo_failed', error);
        return null;
    }
    return { id: data.id, code: data.code };
}

function randomCode(n: number): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

/** Award points for a captured order. Idempotent on (customer_id, order_id, 'order_earned'). */
export async function awardOrderPoints(admin: any, orderId: string): Promise<void> {
    const { data: order } = await admin
        .from('orders')
        .select('id, customer_id, total_agorot, payment_status, status')
        .eq('id', orderId)
        .maybeSingle();
    if (!order || !order.customer_id) return;
    if (order.payment_status !== 'captured') return;
    if (order.status === 'cancelled' || order.status === 'refunded') return;

    // Have we already credited this order?
    const { data: existing } = await admin
        .from('loyalty_events')
        .select('id')
        .eq('order_id', order.id)
        .eq('kind', 'order_earned')
        .maybeSingle();
    if (existing) return;

    const points = Math.floor(Number(order.total_agorot) * POINT_PER_AGORA);
    if (points <= 0) return;

    await admin.from('loyalty_events').insert({
        customer_id: order.customer_id,
        order_id:    order.id,
        kind:        'order_earned',
        points_delta: points,
        note: `order_${order.id}`
    });

    await admin.rpc('customers_increment_points', {
        _customer_id: order.customer_id,
        _delta: points
    });
}

/** If this is the customer's 5th paid order, issue a milestone reward + notify. */
export async function maybeIssueMilestone(admin: any, customerId: string, orderId: string): Promise<void> {
    const { count } = await admin
        .from('orders')
        .select('id', { head: true, count: 'exact' })
        .eq('customer_id', customerId)
        .eq('payment_status', 'captured')
        .neq('status', 'cancelled');
    if ((count ?? 0) !== MILESTONE_ORDER_NUMBER) return;

    const promo = await issueOneUsePromo(admin, {
        amountAgorot: MILESTONE_REWARD_AGOROT,
        prefix: 'MZ-V5',
        validDays: 60,
        note: `milestone_5th_${customerId}`
    });
    if (!promo) return;

    await admin.from('loyalty_events').insert({
        customer_id: customerId,
        order_id:    orderId,
        kind:        'redeem_milestone',
        points_delta: 0,
        note: `issued_promo:${promo.code}`
    });

    const { data: cust } = await admin
        .from('customers')
        .select('phone_e164, name, marketing_sms_opt_in, marketing_whatsapp_opt_in')
        .eq('id', customerId)
        .maybeSingle();
    if (!cust) return;

    const channel = cust.marketing_whatsapp_opt_in ? 'whatsapp'
                  : cust.marketing_sms_opt_in     ? 'sms'
                  : 'sms';                                      // milestone counts as transactional in our policy

    const { enqueueNotification } = await import('./notifications/enqueue.ts');
    const { firstName } = await import('./notifications/templates.ts');
    await enqueueNotification(admin, {
        customerId,
        orderId,
        channel,
        kind: 'milestone_reward',
        toPhoneE164: cust.phone_e164,
        idempotencyKey: `milestone:${customerId}:5`,
        vars: {
            firstName:  firstName(cust.name),
            promoCode:  promo.code,
            rewardIls:  String(MILESTONE_REWARD_AGOROT / 100)
        }
    });
}

/** Process a referral: if the order's customer has referred_by set, award both sides. */
export async function maybeProcessReferral(admin: any, customerId: string, orderId: string): Promise<void> {
    const { data: cust } = await admin
        .from('customers')
        .select('id, name, phone_e164, referred_by')
        .eq('id', customerId)
        .maybeSingle();
    if (!cust?.referred_by) return;

    // Find or create the pending referral row.
    const { data: existing } = await admin
        .from('referrals')
        .select('id, status')
        .eq('referrer_id', cust.referred_by)
        .eq('referee_id', cust.id)
        .maybeSingle();

    let referralId = existing?.id;
    if (!referralId) {
        const { data: created } = await admin.from('referrals').insert({
            referrer_id: cust.referred_by,
            referee_id:  cust.id,
            referee_phone_e164: cust.phone_e164,
            status: 'pending'
        }).select('id').single();
        referralId = created?.id;
    }
    if (!referralId) return;

    // Already redeemed? Skip — keeps this idempotent.
    if (existing && existing.status === 'redeemed') return;

    const refereePromo = await issueOneUsePromo(admin, {
        amountAgorot: REFERRAL_REWARD_AGOROT, prefix: 'MZ-REF',
        validDays: 60, note: `referral_referee_${cust.id}`
    });
    const referrerPromo = await issueOneUsePromo(admin, {
        amountAgorot: REFERRAL_REWARD_AGOROT, prefix: 'MZ-REF',
        validDays: 60, note: `referral_referrer_${cust.referred_by}`
    });
    if (!refereePromo || !referrerPromo) return;

    await admin.from('referrals').update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
        referee_promo_id:  refereePromo.id,
        referrer_promo_id: referrerPromo.id
    }).eq('id', referralId);

    const { data: referrer } = await admin
        .from('customers')
        .select('phone_e164, name')
        .eq('id', cust.referred_by)
        .maybeSingle();
    if (!referrer) return;

    const { enqueueNotification } = await import('./notifications/enqueue.ts');
    const { firstName } = await import('./notifications/templates.ts');

    await enqueueNotification(admin, {
        customerId: cust.referred_by,
        channel: 'sms',
        kind: 'referral_reward',
        toPhoneE164: referrer.phone_e164,
        idempotencyKey: `referral_referrer:${referralId}`,
        vars: {
            firstName: firstName(referrer.name),
            promoCode: referrerPromo.code,
            rewardIls: String(REFERRAL_REWARD_AGOROT / 100)
        }
    });
}
