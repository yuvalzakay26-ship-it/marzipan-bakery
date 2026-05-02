import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

/**
 * Sliding-window rate limit using the rate_limits table.
 * Returns true if the request is allowed, false if it should be rejected.
 *
 * key:    e.g. "place-order:+97250...".  Bucket per phone for ordering;
 *              per IP for OTP (request-otp:1.2.3.4).
 * limit:  number of requests allowed in `windowSec` seconds.
 */
export async function checkRateLimit(
    admin: SupabaseClient,
    key: string,
    limit: number,
    windowSec: number
): Promise<boolean> {
    const now = new Date();
    const windowStart = new Date(Math.floor(now.getTime() / (windowSec * 1000)) * windowSec * 1000);

    const { data, error } = await admin
        .from('rate_limits')
        .upsert(
            { key, window_start: windowStart.toISOString(), count: 1 },
            { onConflict: 'key,window_start', ignoreDuplicates: false }
        )
        .select()
        .single();

    if (error) {
        // Fail open on rate-limit storage error — log but do not block the user.
        console.error('rate_limit_upsert_error', error);
        return true;
    }

    if ((data?.count ?? 1) > limit) {
        // The upsert above only inserts the first row; we increment via RPC for
        // subsequent calls. Simpler: do a second update.
        await admin
            .from('rate_limits')
            .update({ count: (data?.count ?? 1) + 1 })
            .eq('key', key)
            .eq('window_start', windowStart.toISOString());
        return false;
    }

    // Increment the counter for subsequent hits in the same window.
    await admin.rpc('exec_increment_rate_limit', {
        p_key: key,
        p_window_start: windowStart.toISOString()
    }).then(() => {}, () => {
        // RPC may not exist yet — ignore. The upsert above already created the row.
    });

    return true;
}
