// =====================================================================
// Money — agorot-only helpers.
//
// PROJECT_BRAIN §6: "All money is integer agorot in code, formatted at render."
// Never parseFloat. Never store ₪ display strings in DB.
// =====================================================================

/** Convert ₪ float (UI input) to agorot integer. Rejects non-finite. */
export function shekelsToAgorot(shekels) {
    if (!Number.isFinite(shekels)) return 0;
    return Math.round(shekels * 100);
}

/** Format agorot integer to "₪ 12.50" (or "₪ 12" when whole). */
export function formatAgorot(agorot, { withSymbol = true } = {}) {
    const n = Math.max(0, Math.trunc(agorot ?? 0));
    const whole = Math.floor(n / 100);
    const cents = n % 100;
    const body  = cents === 0
        ? whole.toLocaleString('he-IL')
        : (whole + cents / 100).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return withSymbol ? `₪${body}` : body;
}

/** Sum a cart's worth in agorot. Tolerates legacy items that carry priceValue (₪). */
export function cartSubtotalAgorot(items) {
    let total = 0;
    for (const item of items ?? []) {
        const qty = Number(item.quantity) || 0;
        const agorot = item.priceAgorot ?? shekelsToAgorot(item.priceValue ?? 0);
        total += agorot * qty;
    }
    return total;
}
