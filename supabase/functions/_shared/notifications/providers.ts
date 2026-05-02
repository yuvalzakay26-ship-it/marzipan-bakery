// =====================================================================
// SMS + WhatsApp provider adapters.
//
// Each adapter exposes:
//   send(to, body, kind) → { ok, providerRef? } | { ok: false, reason }
//
// SMS:
//   - Inforu (default — Israeli SMS gateway with Hebrew + alphanumeric sender)
//   - Twilio (fallback for non-IL numbers and dev)
// WhatsApp:
//   - WhatsApp Cloud API (Meta) — requires approved templates for marketing,
//     freeform allowed within a 24h customer service window.
//
// Provider is chosen at send time via SMS_PROVIDER / WHATSAPP_PROVIDER env
// vars. Fallback to "console" prints to logs (dev / staging).
// =====================================================================

export interface SendResult {
    ok: boolean;
    providerRef?: string;
    reason?: string;
}

export type SmsProviderName = 'inforu' | 'twilio' | 'console';
export type WhatsappProviderName = 'meta_cloud' | 'console';

// ---------------------------------------------------------------------
// SMS — Inforu
// ---------------------------------------------------------------------
async function sendInforu(to: string, body: string): Promise<SendResult> {
    const user   = Deno.env.get('INFORU_USER');
    const apiKey = Deno.env.get('INFORU_API_KEY');
    const sender = Deno.env.get('INFORU_SENDER') || 'Marzipan';
    if (!user || !apiKey) return { ok: false, reason: 'inforu_misconfigured' };

    // Inforu's REST API: POST /SendMessageXml.ashx, JSON-of-XML envelope.
    // We use their newer JSON-API endpoint instead.
    const payload = {
        Data: {
            Sender:  sender,
            Messages: [{ MessageText: body, Recipients: [{ Phone: to.replace(/^\+/, '') }] }]
        }
    };
    const res = await fetch('https://capi.inforu.co.il/api/v2/SMS/SendSms', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'authorization': `Basic ${btoa(`${user}:${apiKey}`)}`
        },
        body: JSON.stringify(payload)
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, reason: `inforu_http_${res.status}:${text.slice(0, 200)}` };
    try {
        const json = JSON.parse(text);
        const ref = json?.Data?.JobId ?? json?.JobId ?? json?.RequestId;
        return { ok: true, providerRef: ref ? String(ref) : undefined };
    } catch {
        return { ok: true, providerRef: undefined };
    }
}

// ---------------------------------------------------------------------
// SMS — Twilio
// ---------------------------------------------------------------------
async function sendTwilio(to: string, body: string): Promise<SendResult> {
    const sid   = Deno.env.get('TWILIO_ACCOUNT_SID');
    const token = Deno.env.get('TWILIO_AUTH_TOKEN');
    const from  = Deno.env.get('TWILIO_FROM');
    if (!sid || !token || !from) return { ok: false, reason: 'twilio_misconfigured' };

    const params = new URLSearchParams({ To: to, From: from, Body: body });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
            'authorization': `Basic ${btoa(`${sid}:${token}`)}`,
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        return { ok: false, reason: `twilio_${(json as any)?.code ?? res.status}:${(json as any)?.message ?? ''}` };
    }
    return { ok: true, providerRef: (json as any)?.sid };
}

// ---------------------------------------------------------------------
// WhatsApp — Meta Cloud API
// ---------------------------------------------------------------------
async function sendMetaWhatsApp(to: string, body: string): Promise<SendResult> {
    const phoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    const token   = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    if (!phoneId || !token) return { ok: false, reason: 'whatsapp_misconfigured' };

    const payload = {
        messaging_product: 'whatsapp',
        to: to.replace(/^\+/, ''),
        type: 'text',
        text: { body, preview_url: false }
    };
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
            'authorization': `Bearer ${token}`,
            'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        return { ok: false, reason: `whatsapp_${res.status}:${(json as any)?.error?.message ?? ''}` };
    }
    return { ok: true, providerRef: (json as any)?.messages?.[0]?.id };
}

// ---------------------------------------------------------------------
// Console (no-op for dev)
// ---------------------------------------------------------------------
function sendConsole(channel: string, to: string, body: string): SendResult {
    console.log(`[notify:${channel}] →`, to, body);
    return { ok: true, providerRef: `console-${Date.now()}` };
}

// ---------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------
export async function sendSms(to: string, body: string): Promise<SendResult> {
    const provider = (Deno.env.get('SMS_PROVIDER') || 'inforu').toLowerCase();
    if (provider === 'inforu') return sendInforu(to, body);
    if (provider === 'twilio') return sendTwilio(to, body);
    return sendConsole('sms', to, body);
}

export async function sendWhatsApp(to: string, body: string): Promise<SendResult> {
    const provider = (Deno.env.get('WHATSAPP_PROVIDER') || 'console').toLowerCase();
    if (provider === 'meta_cloud') return sendMetaWhatsApp(to, body);
    return sendConsole('whatsapp', to, body);
}

export async function sendByChannel(
    channel: 'sms' | 'whatsapp' | 'email',
    to: string,
    body: string
): Promise<SendResult> {
    if (channel === 'sms')      return sendSms(to, body);
    if (channel === 'whatsapp') return sendWhatsApp(to, body);
    // email is reserved for Phase 4; today, log + ack so the queue drains.
    return sendConsole('email', to, body);
}
