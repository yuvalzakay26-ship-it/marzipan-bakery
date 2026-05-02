// =====================================================================
// Pickup-slot intelligence.
//
// A slot is one valid pickup time at a branch on a specific calendar date.
// The rules:
//
//   1. Use the branch.schedule entry for the given weekday (0=Sun ... 6=Sat).
//   2. If schedule[day] has open=null/close=null, the branch is closed.
//      Saturday is always closed across all branches (Shabbat).
//   3. On Friday and on ערב חג, branches close early — schedule already
//      reflects this. The last slot must end before close.
//   4. Today's slots must start at least `leadMinutes` from now (default 30)
//      — the bakery can't bake-and-pack instantly.
//   5. Each slot is `intervalMinutes` apart (default 30).
//
// This module is intentionally pure JS so it can be reused in:
//   - CheckoutModal.jsx   (filter the dropdown to only valid slots)
//   - the place-order Edge Function (server-side re-validation, cannot trust
//     the client). The function imports it via a Deno-friendly path.
// =====================================================================

const DEFAULTS = {
    intervalMinutes: 30,
    leadMinutes:     30
};

/**
 * @param {{schedule: Record<number, {open:string|null, close:string|null}>}} branch
 * @param {string} dateIso  yyyy-mm-dd in IL local time
 * @param {{ now?: Date, intervalMinutes?: number, leadMinutes?: number }} [opts]
 * @returns {string[]}      array of "HH:mm" valid slots (sorted ascending)
 */
export function getOpenSlots(branch, dateIso, opts = {}) {
    if (!branch?.schedule || !dateIso) return [];
    const { intervalMinutes, leadMinutes } = { ...DEFAULTS, ...opts };
    const now = opts.now ?? new Date();

    const day = ilWeekday(dateIso);
    if (day === 6) return [];                          // Shabbat — never open

    const hours = branch.schedule[day];
    if (!hours || !hours.open || !hours.close) return [];

    const [openH, openM]   = parseHm(hours.open);
    const [closeH, closeM] = parseHm(hours.close);
    const openMin  = openH  * 60 + openM;
    const closeMin = closeH * 60 + closeM;
    if (closeMin <= openMin) return [];

    // Earliest acceptable start: floor to interval.
    const earliestMin = isToday(dateIso, now)
        ? Math.max(openMin, ilMinutesNow(now) + leadMinutes)
        : openMin;

    const out = [];
    let m = roundUpToInterval(earliestMin, intervalMinutes);
    // The slot itself must finish before close (so the customer doesn't show
    // up to a locked door): require start + interval <= close.
    while (m + intervalMinutes <= closeMin) {
        out.push(formatHm(m));
        m += intervalMinutes;
    }
    return out;
}

/** True if `dateIso` is the same calendar date (in IL) as `now`. */
export function isToday(dateIso, now = new Date()) {
    return ilDateIso(now) === dateIso;
}

/** Render today's date as yyyy-mm-dd in Asia/Jerusalem. */
export function ilDateIso(d = new Date()) {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jerusalem',
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
    return fmt.format(d);                               // en-CA gives yyyy-mm-dd
}

/** Sunday-indexed weekday (0..6) for a yyyy-mm-dd date string in IL local time. */
export function ilWeekday(dateIso) {
    // Construct noon-IL to dodge DST edges. We only need the calendar weekday.
    const d = new Date(`${dateIso}T12:00:00+03:00`);
    return new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jerusalem', weekday: 'short'
    }).formatToParts(d).find((p) => p.type === 'weekday')?.value
        ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(
            new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Jerusalem', weekday: 'short'
            }).format(d)
        )
        : d.getDay();
}

/** True if the (date,time) is inside the branch's open window. Used by the server. */
export function isWithinBranchHours(branch, dateIso, timeHm) {
    if (!branch?.schedule) return false;
    const day = ilWeekday(dateIso);
    if (day === 6) return false;
    const hours = branch.schedule[day];
    if (!hours?.open || !hours?.close) return false;
    const [h, m] = parseHm(timeHm);
    const t = h * 60 + m;
    const o = parseHmToMin(hours.open);
    const c = parseHmToMin(hours.close);
    return t >= o && t < c;
}

/** Hebrew-friendly diagnostic for why a (branch,date,time) is invalid. */
export function describeSlotIssue(branch, dateIso, timeHm) {
    if (!dateIso || !timeHm) return 'בחרו תאריך ושעה';
    const day = ilWeekday(dateIso);
    if (day === 6)            return 'בשבת אנחנו סגורים';
    if (day === 5 && timeHm > '15:00') return 'בערב שבת אנחנו סוגרים מוקדם';
    const hours = branch?.schedule?.[day];
    if (!hours?.open || !hours?.close)        return 'הסניף סגור ביום זה';
    if (!isWithinBranchHours(branch, dateIso, timeHm)) return 'שעת האיסוף מחוץ לשעות הפעילות';
    return null;
}

// ----------------- helpers -----------------
function parseHm(s)        { const [h, m] = s.split(':').map(Number); return [h, m]; }
function parseHmToMin(s)   { const [h, m] = parseHm(s); return h * 60 + m; }
function formatHm(min)     {
    const h = Math.floor(min / 60), m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function roundUpToInterval(min, step) {
    const rem = min % step;
    return rem === 0 ? min : min + (step - rem);
}
function ilMinutesNow(now) {
    const fmt = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', hour12: false
    });
    const [h, m] = fmt.format(now).split(':').map(Number);
    return h * 60 + m;
}
