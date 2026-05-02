// =====================================================================
// Hebrew message templates for SMS + WhatsApp.
//
// Templates are intentionally short — most IL SMS gateways charge per
// 70-char (Hebrew) or 160-char (Latin) segment. We aim for 1 segment.
//
// Variables are simple {{name}} placeholders rendered by `render()`.
// Never interpolate raw user input into a template that's later
// re-interpolated; we keep this single-pass.
// =====================================================================

export type TemplateVars = Record<string, string | number | undefined | null>;

const TEMPLATES: Record<string, { sms: string; whatsapp?: string }> = {
    order_received: {
        sms: 'מאפיית מרציפן · קיבלנו את הזמנתך {{orderNumber}}. סה״כ: ₪{{totalIls}}. נחזור לאישור.',
        whatsapp: 'שלום {{firstName}}! קיבלנו את הזמנה *{{orderNumber}}* על סך ₪{{totalIls}}. נעדכן ברגע שאישרנו. תודה 🥐'
    },
    payment_approved: {
        sms: 'מרציפן · התשלום אושר עבור {{orderNumber}}. ההזמנה עוברת להכנה. תודה!',
        whatsapp: '✅ התשלום עבור הזמנה *{{orderNumber}}* אושר. מעבירים את ההזמנה להכנה אצלנו במאפייה.'
    },
    ready_for_pickup: {
        sms: 'מרציפן · ההזמנה {{orderNumber}} מוכנה לאיסוף ב{{branchName}}. נעבור עליה כשתגיעו.',
        whatsapp: '🥨 ההזמנה *{{orderNumber}}* מוכנה לאיסוף ב{{branchName}}. נשמח לראותכם!'
    },
    pickup_reminder: {
        sms: 'תזכורת · האיסוף שלכם ב{{branchName}} בעוד 30 דקות. הזמנה {{orderNumber}}.',
        whatsapp: '⏰ תזכורת ידידותית — האיסוף ב{{branchName}} בעוד 30 דקות. הזמנה {{orderNumber}}.'
    },
    birthday_reward: {
        sms: 'יום הולדת שמח, {{firstName}}! מתנה מהמאפייה — קוד {{promoCode}} (₪{{rewardIls}} מתנה).',
        whatsapp: '🎂 יום הולדת שמח, {{firstName}}! קוד מתנה: *{{promoCode}}* (₪{{rewardIls}}). תקף 30 יום.'
    },
    milestone_reward: {
        sms: 'תודה שאתם איתנו · להזמנה החמישית מתנה: קוד {{promoCode}} (₪{{rewardIls}} הנחה).',
        whatsapp: '🎉 חמישית בנו! מתנה: *{{promoCode}}* — ₪{{rewardIls}} הנחה. תקף 60 יום.'
    },
    referral_reward: {
        sms: 'מרציפן · החבר שהזמנתם הזמין ✨ קוד מתנה {{promoCode}} (₪{{rewardIls}}) שלכם.',
        whatsapp: '✨ חבר שהזמנתם השלים הזמנה. קוד מתנה: *{{promoCode}}* (₪{{rewardIls}}).'
    },
    friday_challah: {
        sms: 'מרציפן · חלות שבת מוכנות מיום חמישי בערב. להזמנה: marzipanbakery.com',
        whatsapp: '🍞 חלות שבת חמות — להזמנה לאיסוף בשישי: marzipanbakery.com'
    },
    holiday_preorder: {
        sms: '{{holidayName}} בפתח · הזמנות מוקדמות במרציפן: marzipanbakery.com/holidays/{{holidaySlug}}',
        whatsapp: '🎉 {{holidayName}} מתקרב — הזמנות מוקדמות נפתחו: marzipanbakery.com/holidays/{{holidaySlug}}'
    },
    comeback_30d: {
        sms: 'התגעגענו! קוד חזרה {{promoCode}} (₪{{rewardIls}} הנחה) למאפיית מרציפן. תקף 14 יום.',
        whatsapp: 'מזמן לא ראינו אתכם 🤍 קוד חזרה: *{{promoCode}}* — ₪{{rewardIls}} הנחה. 14 יום.'
    },
    abandoned_checkout: {
        sms: 'מרציפן · השארתם פריטים בסל. לסיום ההזמנה: marzipanbakery.com/cart',
        whatsapp: '🛒 השארתם פריטים בסל. לסיום ההזמנה: marzipanbakery.com/cart'
    },
    admin_custom: {
        sms: '{{body}}',
        whatsapp: '{{body}}'
    }
};

export function render(kind: string, channel: 'sms' | 'whatsapp' | 'email', vars: TemplateVars): string {
    const tpl = TEMPLATES[kind];
    if (!tpl) throw new Error(`unknown_template:${kind}`);
    const text = (channel === 'whatsapp' ? tpl.whatsapp : null) ?? tpl.sms;
    return text.replace(/{{\s*(\w+)\s*}}/g, (_, k) => {
        const v = vars[k];
        return v === undefined || v === null ? '' : String(v);
    });
}

/** Pull first name from a "First Last" string. Falls back to full string. */
export function firstName(name: string | null | undefined): string {
    if (!name) return '';
    return name.trim().split(/\s+/)[0] || '';
}
