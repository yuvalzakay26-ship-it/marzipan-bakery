import React, { useState } from 'react';
import { Crown, Cake, Share2, Check, MessageCircle } from 'lucide-react';
import { CONTACT_INFO, VIP_CLUB } from '../../data/siteContent';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';
import { recordLead } from '../../lib/leads/leadCapture';

// Shown immediately after order confirmation — three slot upsells:
//   1. Join VIP WhatsApp club (highest-value: keeps the customer in WhatsApp)
//   2. Join Birthday Club (highest-retention: yearly trigger to re-engage)
//   3. Share with friend (referral seed)
const PostPurchaseFlow = ({ phone, name }) => {
    const [vipJoined, setVipJoined] = useState(false);
    const [birthdayJoined, setBirthdayJoined] = useState(false);
    const [shared, setShared] = useState(false);

    const handleVip = () => {
        trackEvent(ANALYTICS_EVENTS.VIP_CLUB_CLICK, { source: 'post_purchase' });
        setVipJoined(true);
    };

    const handleBirthday = () => {
        if (phone) {
            recordLead({
                kind: 'birthday_club_post_purchase',
                phone,
                name: name || '',
                extra: { source: 'post_purchase' }
            });
        }
        setBirthdayJoined(true);
    };

    const handleShare = async () => {
        const shareText = 'הזמנתי בדיוק עכשיו ממאפיית מרציפן בירושלים. הרוגלך שלהם — אגדה.';
        const shareUrl = 'https://marzipanbakery.com';
        if (navigator.share) {
            try {
                await navigator.share({ title: 'מאפיית מרציפן', text: shareText, url: shareUrl });
                setShared(true);
                trackEvent('referral_share', { method: 'native' });
            } catch { /* user cancelled */ }
        } else {
            const wa = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
            window.open(wa, '_blank', 'noopener');
            setShared(true);
            trackEvent('referral_share', { method: 'whatsapp' });
        }
    };

    const vipUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(VIP_CLUB.joinMessage)}`;

    return (
        <div className="mt-8 bg-white rounded-3xl border border-[#D4AF37]/25 shadow-[0_15px_40px_-25px_rgba(56,9,9,0.3)] p-6 md:p-8 text-right">
            <p className="text-[#B91C1C] font-bold tracking-[0.32em] text-[11px] uppercase mb-2">
                לפני שאתם הולכים
            </p>
            <h2 className="text-xl md:text-2xl font-black text-[#380909] mb-5 leading-tight">
                שלוש דקות שיחזירו אתכם אלינו ביתרון.
            </h2>

            <ul className="space-y-3">
                {/* VIP slot */}
                <li>
                    <a
                        href={vipUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleVip}
                        className={`group flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all min-h-[68px] ${
                            vipJoined
                                ? 'bg-[#15803D]/10 border-[#15803D]/30'
                                : 'bg-[#FFF8E1] border-[#D4AF37]/40 hover:border-[#D4AF37]/70'
                        }`}
                    >
                        <span className="flex items-center gap-3">
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${vipJoined ? 'bg-[#15803D] text-white' : 'bg-[#380909] text-[#D4AF37]'}`}>
                                {vipJoined ? <Check size={18} strokeWidth={3} /> : <Crown size={18} />}
                            </span>
                            <span className="min-w-0">
                                <span className="block font-black text-[#380909]">
                                    {vipJoined ? 'נפתח וואטסאפ — סיימו שם' : 'מועדון VIP בוואטסאפ'}
                                </span>
                                <span className="block text-xs text-[#5D4037]">
                                    הודעות על אפייה חדשה שיוצאת מהתנור, שריון מוקדם בערב שבת.
                                </span>
                            </span>
                        </span>
                        <MessageCircle size={20} className="text-[#25D366] shrink-0" aria-hidden="true" />
                    </a>
                </li>

                {/* Birthday club */}
                <li>
                    <button
                        type="button"
                        onClick={handleBirthday}
                        disabled={birthdayJoined}
                        className={`w-full group flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all min-h-[68px] ${
                            birthdayJoined
                                ? 'bg-[#15803D]/10 border-[#15803D]/30 cursor-default'
                                : 'bg-white border-[#D4AF37]/30 hover:border-[#D4AF37]/70'
                        }`}
                    >
                        <span className="flex items-center gap-3 text-right">
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${birthdayJoined ? 'bg-[#15803D] text-white' : 'bg-[#B91C1C] text-white'}`}>
                                {birthdayJoined ? <Check size={18} strokeWidth={3} /> : <Cake size={18} />}
                            </span>
                            <span className="min-w-0">
                                <span className="block font-black text-[#380909]">
                                    {birthdayJoined ? 'נרשמתם — נשלח לכם בחודש יום ההולדת' : 'מאפה במתנה ביום ההולדת'}
                                </span>
                                <span className="block text-xs text-[#5D4037]">
                                    קוד שנתי לוואטסאפ שלכם — ללא תוקף לעולם.
                                </span>
                            </span>
                        </span>
                    </button>
                </li>

                {/* Share */}
                <li>
                    <button
                        type="button"
                        onClick={handleShare}
                        className={`w-full group flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all min-h-[68px] ${
                            shared ? 'bg-[#15803D]/10 border-[#15803D]/30' : 'bg-white border-[#D4AF37]/30 hover:border-[#D4AF37]/70'
                        }`}
                    >
                        <span className="flex items-center gap-3 text-right">
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${shared ? 'bg-[#15803D] text-white' : 'bg-[#380909] text-[#D4AF37]'}`}>
                                {shared ? <Check size={18} strokeWidth={3} /> : <Share2 size={18} />}
                            </span>
                            <span className="min-w-0">
                                <span className="block font-black text-[#380909]">
                                    {shared ? 'תודה ששיתפתם' : 'תספרו לחבר'}
                                </span>
                                <span className="block text-xs text-[#5D4037]">
                                    שתפו את האתר עם מי שיודע מה זה רוגלך טוב.
                                </span>
                            </span>
                        </span>
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default PostPurchaseFlow;
