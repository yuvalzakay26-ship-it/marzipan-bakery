// CORS allowlist for Edge Functions. Replace ALLOWED_ORIGINS env var
// in production to lock to marzipanbakery.com (and the Vercel preview).
const DEFAULT_ALLOWED = ['http://localhost:5173', 'https://marzipanbakery.com'];

export function corsHeaders(origin: string | null): Record<string, string> {
    const allowed = (Deno.env.get('ALLOWED_ORIGINS') ?? DEFAULT_ALLOWED.join(','))
        .split(',')
        .map((s) => s.trim());
    const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Headers':
            'authorization, x-client-info, apikey, content-type, x-idempotency-key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
    };
}

export function handleOptions(req: Request): Response | null {
    if (req.method !== 'OPTIONS') return null;
    return new Response('ok', { headers: corsHeaders(req.headers.get('origin')) });
}
