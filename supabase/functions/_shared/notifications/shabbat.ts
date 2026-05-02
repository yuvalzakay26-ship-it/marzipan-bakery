// =====================================================================
// Shabbat-aware send-window guard.
//
// Golden Rule #5: never send transactional/marketing SMS or WhatsApp
// between candle-lighting Friday and motzaei Shabbat.
//
// We approximate the window conservatively:
//   - Fri 17:30 IL → Sat 21:00 IL  (covers worst-case winter candle-lighting
//     and the latest reasonable motzaei Shabbat).
//
// `pickup_reminder` and `payment_approved` are still subject to this guard;
// the customer doesn't lose those messages — they get delivered the moment
// the window opens. Order-receipt SMS during Shabbat is fine to delay,
// because the bakery isn't preparing the order until motzaei anyway.
// =====================================================================

const FRIDAY = 5;
const SATURDAY = 6;

/**
 * Returns the earliest time at which we may legitimately send. If the
 * scheduled time falls outside the Shabbat window, returns it unchanged.
 */
export function applyShabbatGuard(scheduled: Date): Date {
    const ilParts = ilParts_(scheduled);
    if (ilParts.day === FRIDAY && minutes(ilParts) >= 17 * 60 + 30) {
        return motzaeiShabbat(scheduled);
    }
    if (ilParts.day === SATURDAY && minutes(ilParts) < 21 * 60) {
        return motzaeiShabbat(scheduled);
    }
    return scheduled;
}

/** First "safe" send time after Shabbat ends — Sat 21:00 IL of the same week. */
function motzaeiShabbat(reference: Date): Date {
    // Step forward by 1 hour buckets until we reach Saturday 21:00 IL or later.
    const target = new Date(reference);
    while (true) {
        const p = ilParts_(target);
        if (p.day === SATURDAY && minutes(p) >= 21 * 60) return target;
        target.setUTCMinutes(target.getUTCMinutes() + 30);
    }
}

function minutes(p: { hour: number; minute: number }): number {
    return p.hour * 60 + p.minute;
}

function ilParts_(d: Date): { day: number; hour: number; minute: number } {
    const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jerusalem',
        weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    });
    // 'Fri, 17:30' / 'Sat, 21:00' / etc.
    const parts = fmt.formatToParts(d);
    const wk = parts.find((x) => x.type === 'weekday')!.value;
    const hh = Number(parts.find((x) => x.type === 'hour')!.value);
    const mm = Number(parts.find((x) => x.type === 'minute')!.value);
    const dayMap: Record<string, number> = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 };
    return { day: dayMap[wk] ?? 0, hour: hh, minute: mm };
}
