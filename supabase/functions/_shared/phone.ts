/**
 * Israeli phone normalization to E.164.
 *  - Accepts "0501234567", "050-123-4567", "+972 50 123 4567", "972501234567".
 *  - Rejects anything that doesn't resolve to a valid IL mobile/landline shape.
 */
export function normalizeILPhone(input: string): string | null {
    if (!input) return null;
    const digits = input.replace(/[^\d]/g, '');

    // International form already (with or without leading 00)
    if (digits.startsWith('00972')) return '+' + digits.slice(2);
    if (digits.startsWith('972'))   return '+' + digits;

    // Local form: must start with 0 and be 9–10 digits total.
    if (digits.startsWith('0') && (digits.length === 9 || digits.length === 10)) {
        return '+972' + digits.slice(1);
    }

    return null;
}

const E164_RE = /^\+[1-9][0-9]{6,14}$/;
export function isE164(s: string): boolean {
    return E164_RE.test(s);
}
