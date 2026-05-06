import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

/**
 * Sliding-window rate limit using the rate_limits table.
 *
 * Atomic and fail-closed.
 *
 *   - Atomic: increments via the rate_limit_hit RPC, which uses
 *     INSERT...ON CONFLICT DO UPDATE returning the post-increment
 *     count. Concurrent callers cannot observe the same value.
 *   - Fail-closed: any error talking to the database returns false
 *     (block the request) rather than silently allowing it through.
 *
 * key:    e.g. "place-order:+97250...".  Bucket per phone for ordering;
 *              per IP for OTP (request-otp:1.2.3.4).
 * limit:  max number of requests permitted in `windowSec` seconds.
 */
export async function checkRateLimit(
    admin: SupabaseClient,
    key: string,
    limit: number,
    windowSec: number
): Promise<boolean> {
    const now = Date.now();
    const windowStart = new Date(
        Math.floor(now / (windowSec * 1000)) * windowSec * 1000
    );

    const { data, error } = await admin.rpc('rate_limit_hit', {
        p_key:          key,
        p_window_start: windowStart.toISOString(),
        p_limit:        limit
    });

    if (error) {
        // Storage layer is unreachable — block. We deliberately do not
        // fall back to "allow" here; an unreachable limiter is the exact
        // condition under which abuse is most damaging.
        console.error('rate_limit_rpc_error', { key, message: error.message });
        return false;
    }

    // The RPC returns a single row { allowed, current_count }.
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row.allowed !== 'boolean') {
        console.error('rate_limit_unexpected_shape', { key, data });
        return false;
    }
    return row.allowed;
}
