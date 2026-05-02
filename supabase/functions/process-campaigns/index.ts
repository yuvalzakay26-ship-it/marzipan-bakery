// =====================================================================
// process-campaigns  —  scheduled marketing runner.
//
// Designed to be invoked by Supabase scheduled functions every ~30 minutes.
//
// Built-in campaigns (idempotent — safe to fire on repeat ticks):
//
//   1. friday_challah        Thursday 12:00–15:00 IL: ping Silver+ tier
//                            customers with a Friday challah reminder.
//   2. holiday_preorder      14 days before each holiday in HOLIDAYS[],
//                            ping every opted-in customer once.
//   3. comeback_30d          Customers whose last order is 25–35 days old
//                            and who haven't received this campaign yet.
//   4. abandoned_checkout    Carts started > 1h ago, not recovered, no
//                            ping yet.
//   5. birthday_sweep        Daily 09:00 IL: today's birthdays → reward.
//
// Triggers via:
//   POST /functions/v1/process-campaigns
//   Header: x-cron-secret: <CRON_SHARED_SECRET>
//
// All marketing campaigns require the customer to have
// marketing_sms_opt_in=true (or marketing_whatsapp_opt_in=true). The
// transactional flows (order_received, payment_approved, ready_for_pickup)
// do not require opt-in. This split mirrors IL spam regulations.
// =====================================================================

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { applyShabbatGuard } from '../_shared/notifications/shabbat.ts';

interface Holiday {
    slug: string;
    nameHe: string;
    dateMd: string;            // "MM-DD" of the *first* night
}

// Pesach is intentionally absent — the bakery is a chametz-based operation
// and does not sell kosher-for-Passover products. Pushing a Pesach preorder
// would mislead customers (PROJECT_BRAIN Golden Rule #1).
const HOLIDAYS: Holiday[] = [
    { slug: 'hanukkah',      nameHe: 'חנוכה',     dateMd: '12-08' },
    { slug: 'shavuot',       nameHe: 'שבועות',    dateMd: '06-01' },
    { slug: 'rosh-hashanah', nameHe: 'ראש השנה',  dateMd: '09-22' },
    { slug: 'purim',         nameHe: 'פורים',     dateMd: '03-13' }
];

serve(async (req) => {
    if (req.method !== 'POST') return new Response('method_not_allowed', { status: 405 });

    const cronSecret = Deno.env.get('CRON_SHARED_SECRET');
    const provided   = req.headers.get('x-cron-secret');
    if (cronSecret && provided !== cronSecret) {
        return new Response('unauthorized', { status: 401 });
    }

    const url        = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const summary = {
        fridayChallah:    await runFridayChallah(admin),
        holidayPreorder:  await runHolidayPreorder(admin),
        comeback30d:      await runComeback(admin),
        abandonedCheckout: await runAbandoned(admin),
        birthdaySweep:    await runBirthdays(admin)
    };

    return new Response(JSON.stringify({ ok: true, summary }), {
        status: 200, headers: { 'content-type': 'application/json' }
    });
});

// ---------------------------------------------------------------------
// 1. Friday challah — only fires Thursday 12:00–15:00 IL.
// ---------------------------------------------------------------------
async function runFridayChallah(admin: any): Promise<{ enqueued: number; skipped?: string }> {
    const il = ilWallClock();
    if (il.weekday !== 4) return { enqueued: 0, skipped: 'not_thursday' };
    if (il.hour < 12 || il.hour >= 15) return { enqueued: 0, skipped: 'not_window' };

    const { data: customers } = await admin
        .from('customers')
        .select('id, phone_e164, name')
        .eq('marketing_sms_opt_in', true)
        .in('loyalty_tier', ['silver', 'gold', 'legend']);

    let enqueued = 0;
    const ymd = ilDate();
    for (const c of customers ?? []) {
        await enqueueOnce(admin, {
            customerId: c.id, channel: 'sms', kind: 'friday_challah',
            phone: c.phone_e164,
            body: 'מרציפן · חלות שבת מוכנות מיום חמישי בערב. להזמנה: marzipanbakery.com',
            idempotencyKey: `friday_challah:${ymd}:${c.id}`
        });
        enqueued++;
    }
    return { enqueued };
}

// ---------------------------------------------------------------------
// 2. Holiday preorder — fires once per holiday/year, 14 days out.
// ---------------------------------------------------------------------
async function runHolidayPreorder(admin: any): Promise<{ enqueued: number; matched: string | null }> {
    const il = ilWallClock();
    const now = il.dateMd;
    const inFourteenDays = mdAddDays(now, 14);
    const match = HOLIDAYS.find((h) => h.dateMd === inFourteenDays);
    if (!match) return { enqueued: 0, matched: null };

    const year = ilWallClock().year;
    const { data: customers } = await admin
        .from('customers')
        .select('id, phone_e164, name')
        .eq('marketing_sms_opt_in', true);

    let enqueued = 0;
    for (const c of customers ?? []) {
        await enqueueOnce(admin, {
            customerId: c.id, channel: 'sms', kind: 'holiday_preorder',
            phone: c.phone_e164,
            body: `${match.nameHe} בפתח · הזמנות מוקדמות במרציפן: marzipanbakery.com/holidays/${match.slug}`,
            idempotencyKey: `holiday_preorder:${match.slug}:${year}:${c.id}`
        });
        enqueued++;
    }
    return { enqueued, matched: match.slug };
}

// ---------------------------------------------------------------------
// 3. 30-day comeback — last_order_at between 25 and 35 days ago,
//    not previously sent for this window.
// ---------------------------------------------------------------------
async function runComeback(admin: any): Promise<{ enqueued: number }> {
    const upper = new Date(Date.now() - 25 * 86_400_000).toISOString();
    const lower = new Date(Date.now() - 35 * 86_400_000).toISOString();

    const { data: customers } = await admin
        .from('customers')
        .select('id, phone_e164, name, last_order_at')
        .eq('marketing_sms_opt_in', true)
        .gte('last_order_at', lower)
        .lte('last_order_at', upper);

    let enqueued = 0;
    for (const c of customers ?? []) {
        // Idempotency keyed to the customer + month so it can fire again
        // every 30-day window (instead of forever on the first one).
        const month = c.last_order_at?.slice(0, 7) ?? 'unknown';
        await enqueueOnce(admin, {
            customerId: c.id, channel: 'sms', kind: 'comeback_30d',
            phone: c.phone_e164,
            body: 'התגעגענו! חזרו אלינו עם 10% הנחה השבוע. marzipanbakery.com',
            idempotencyKey: `comeback_30d:${month}:${c.id}`
        });
        enqueued++;
    }
    return { enqueued };
}

// ---------------------------------------------------------------------
// 4. Abandoned checkout — > 1h old, not recovered, not pinged.
// ---------------------------------------------------------------------
async function runAbandoned(admin: any): Promise<{ enqueued: number }> {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: rows } = await admin
        .from('abandoned_checkouts')
        .select('id, phone_e164, customer_id, name')
        .is('recovered_order_id', null)
        .is('notified_at', null)
        .lt('created_at', cutoff)
        .limit(200);

    let enqueued = 0;
    for (const r of rows ?? []) {
        if (!r.phone_e164) continue;
        const ok = await enqueueOnce(admin, {
            customerId: r.customer_id ?? null,
            channel: 'sms', kind: 'abandoned_checkout',
            phone: r.phone_e164,
            body: 'מרציפן · השארתם פריטים בסל. לסיום ההזמנה: marzipanbakery.com/cart',
            idempotencyKey: `abandoned_checkout:${r.id}`
        });
        if (ok) {
            await admin.from('abandoned_checkouts')
                .update({ notified_at: new Date().toISOString() })
                .eq('id', r.id);
            enqueued++;
        }
    }
    return { enqueued };
}

// ---------------------------------------------------------------------
// 5. Birthday sweep — daily window 09:00–10:00 IL.
//    Issues a one-time promo + enqueues the message. Idempotent per year.
// ---------------------------------------------------------------------
async function runBirthdays(admin: any): Promise<{ enqueued: number; skipped?: string }> {
    const il = ilWallClock();
    if (il.hour !== 9) return { enqueued: 0, skipped: 'not_window' };

    const today = il.dateMd;
    const year  = il.year;
    const { data: customers } = await admin
        .from('customers')
        .select('id, name, phone_e164, marketing_sms_opt_in, marketing_whatsapp_opt_in')
        .eq('birthday_md', today);

    let enqueued = 0;
    for (const c of customers ?? []) {
        // Issue promo (idempotent: skip if already issued this year).
        const { data: existing } = await admin
            .from('promotions')
            .select('id, code')
            .eq('notes', `birthday_${year}_${c.id}`)
            .maybeSingle();

        let code: string;
        if (existing?.code) {
            code = existing.code;
        } else {
            const generated = `MZ-BD-${randomCode(5)}`;
            const ends = new Date(Date.now() + 30 * 86_400_000).toISOString();
            const { data: ins } = await admin.from('promotions').insert({
                code: generated, kind: 'amount_off', value: 2000, max_uses: 1,
                is_active: true, ends_at: ends, notes: `birthday_${year}_${c.id}`
            }).select('code').single();
            if (!ins) continue;
            code = ins.code;
        }

        await enqueueOnce(admin, {
            customerId: c.id, channel: 'sms', kind: 'birthday_reward',
            phone: c.phone_e164,
            body: `יום הולדת שמח! מתנה מהמאפייה — קוד ${code} (₪20 מתנה). תקף 30 יום.`,
            idempotencyKey: `birthday:${year}:${c.id}`
        });
        enqueued++;
    }
    return { enqueued };
}

// ---------------------------------------------------------------------
// Common: insert into notifications with idempotency. Returns true if
// actually inserted (not a duplicate). Applies the Shabbat guard.
// ---------------------------------------------------------------------
async function enqueueOnce(
    admin: any,
    {
        customerId, channel, kind, phone, body, idempotencyKey
    }: { customerId: string | null; channel: 'sms' | 'whatsapp'; kind: string;
         phone: string; body: string; idempotencyKey: string }
): Promise<boolean> {
    if (!phone) return false;
    const scheduled = applyShabbatGuard(new Date());
    const { error } = await admin.from('notifications').insert({
        customer_id: customerId,
        channel, kind,
        to_phone_e164: phone,
        body,
        scheduled_for:    scheduled.toISOString(),
        earliest_send_at: scheduled.toISOString(),
        idempotency_key:  idempotencyKey,
        status: 'pending'
    });
    if (error && (error as any).code === '23505') return false;
    if (error) {
        console.error('campaign_enqueue_failed', kind, error);
        return false;
    }
    return true;
}

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------
function ilWallClock(): { year: number; weekday: number; hour: number; dateMd: string } {
    const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jerusalem',
        year: 'numeric', month: '2-digit', day: '2-digit',
        weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    });
    const parts = fmt.formatToParts(new Date());
    const y  = Number(parts.find((p) => p.type === 'year')!.value);
    const mo = parts.find((p) => p.type === 'month')!.value;
    const d  = parts.find((p) => p.type === 'day')!.value;
    const wk = parts.find((p) => p.type === 'weekday')!.value;
    const hh = Number(parts.find((p) => p.type === 'hour')!.value);
    const wkMap: Record<string, number> = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
    return { year: y, weekday: wkMap[wk] ?? 0, hour: hh, dateMd: `${mo}-${d}` };
}
function ilDate(): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(new Date());
}
function mdAddDays(md: string, days: number): string {
    const [m, d] = md.split('-').map(Number);
    const date = new Date(Date.UTC(2000, m - 1, d));
    date.setUTCDate(date.getUTCDate() + days);
    const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
    const da = String(date.getUTCDate()).padStart(2, '0');
    return `${mo}-${da}`;
}
function randomCode(n: number): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}
