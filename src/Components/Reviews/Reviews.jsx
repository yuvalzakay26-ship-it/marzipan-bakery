import React from "react";
import { Star, ExternalLink, MessageSquare, ShieldCheck, Quote } from "lucide-react";
import { CONTACT_INFO, FEATURED_REVIEWS, SOCIAL_PROOF } from "../../data/siteContent";

// Real reviews live on Google Business Profile. We deep-link customers there
// AND surface a curated trio of verbatim public Google reviews when the bakery
// owner has supplied them in FEATURED_REVIEWS. No fabricated testimonials —
// when the array is empty, we fall back to the verified rating card alone.
const GOOGLE_REVIEWS_URL =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("מאפיית מרציפן אגריפס 44 ירושלים");

const ReviewCard = ({ review }) => {
    const Wrapper = review.googleReviewUrl ? "a" : "div";
    const wrapperProps = review.googleReviewUrl
        ? { href: review.googleReviewUrl, target: "_blank", rel: "noopener noreferrer" }
        : {};
    return (
        <Wrapper
            {...wrapperProps}
            className="group relative bg-[#2C1810] border border-[#5D4037] hover:border-[#D4AF37]/55 rounded-2xl p-6 md:p-7 text-right shadow-[0_18px_40px_-25px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-0.5 flex flex-col"
        >
            <Quote className="text-[#D4AF37]/45 mb-3 shrink-0" size={26} aria-hidden="true" />
            <div className="flex items-center gap-1 text-[#D4AF37] mb-3" aria-label={`${review.rating} מתוך 5`}>
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" />
                ))}
            </div>
            <blockquote className="text-white/95 leading-relaxed text-sm md:text-base font-light flex-1">
                {review.quote}
            </blockquote>
            <div className="mt-5 pt-4 border-t border-[#5D4037]/60 flex items-center justify-between gap-3 text-[12px] text-red-100/60">
                <div className="min-w-0 truncate">
                    <span className="font-bold text-white not-italic">{review.name}</span>
                    {review.neighborhood && <span className="block text-[11px] truncate">{review.neighborhood}</span>}
                </div>
                <span className="inline-flex items-center gap-1 shrink-0 text-[#D4AF37]/85">
                    <ShieldCheck size={11} aria-hidden="true" />
                    <span className="text-[10px] tracking-wide">{review.date}</span>
                </span>
            </div>
        </Wrapper>
    );
};

const Reviews = () => {
    const featured = FEATURED_REVIEWS ?? [];
    const hasFeatured = featured.length > 0;

    return (
        <section
            id="reviews"
            className="py-20 md:py-28 bg-[#1A0F0A] text-[#D7CCC8] relative overflow-hidden"
            aria-label="ביקורות לקוחות"
        >
            {/* Subtle background glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_60%)] pointer-events-none"></div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">

                {/* Eyebrow — gold-line editorial pattern, system-consistent */}
                <div className="inline-flex items-center gap-3 mb-5">
                    <span className="block w-8 h-px bg-[#D4AF37]"></span>
                    <span className="inline-flex items-center gap-2 text-[#D4AF37] text-[11px] tracking-[0.34em] uppercase font-bold">
                        <ShieldCheck size={12} aria-hidden="true" />
                        ביקורות גוגל מאומתות
                    </span>
                    <span className="block w-8 h-px bg-[#D4AF37]"></span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                    מה ירושלמים <span className="text-[#D4AF37]">כותבים עלינו</span>
                </h2>
                <p className="text-base md:text-lg text-red-100/70 max-w-2xl mx-auto leading-relaxed font-light mb-10 md:mb-12">
                    כל ציטוט כאן הוא ביקורת ציבורית אמיתית מפרופיל הגוגל שלנו —
                    לחיצה פותחת את הביקורת המקורית, לבדיקה.
                </p>

                {hasFeatured && (
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-10 md:mb-12 text-right">
                        {featured.slice(0, 3).map((review, i) => (
                            <li key={review.googleReviewUrl ?? `${review.name}-${i}`}>
                                <ReviewCard review={review} />
                            </li>
                        ))}
                    </ul>
                )}

                {/* Stats card — links to the live Google profile so the rating is verifiable, not claimed */}
                <a
                    href={SOCIAL_PROOF.googleProfileUrl ?? GOOGLE_REVIEWS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-[#2C1810] border border-[#5D4037] hover:border-[#D4AF37]/55 rounded-2xl md:rounded-3xl p-6 md:p-10 mb-8 max-w-xl mx-auto transition-colors"
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex items-center gap-1 text-[#D4AF37]">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={26} fill="currentColor" />
                            ))}
                        </div>
                        <p className="text-4xl md:text-5xl font-black text-white">{SOCIAL_PROOF.googleRating} / 5</p>
                        <p className="text-sm md:text-base text-red-100/70">
                            הדירוג שלנו בגוגל היום
                        </p>
                        <p className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37]/85 mt-1">
                            <ExternalLink size={12} aria-hidden="true" />
                            ראו את הדירוג בגוגל בלייב
                        </p>
                    </div>
                </a>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                    <a
                        href={GOOGLE_REVIEWS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-[#1A0F0A] px-7 py-4 rounded-full font-bold text-base shadow-[0_18px_40px_-12px_rgba(212,175,55,0.45)] hover:shadow-[0_22px_48px_-12px_rgba(212,175,55,0.6)] hover:-translate-y-0.5 transition-all min-h-[54px]"
                    >
                        <ExternalLink size={18} aria-hidden="true" />
                        קראו ביקורות בגוגל
                    </a>
                    <a
                        href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-2 bg-white/5 text-white border border-[#D4AF37]/40 hover:border-[#D4AF37] px-7 py-4 rounded-full font-bold text-base transition-all hover:-translate-y-0.5 min-h-[54px]"
                    >
                        <MessageSquare size={18} aria-hidden="true" />
                        שתפו אותנו בחוויה שלכם
                    </a>
                </div>

                <p className="text-xs text-red-100/50 mt-8 max-w-md mx-auto leading-relaxed">
                    אנחנו לא מפרסמים באתר ביקורות שלא ניתן לאמת. ביקורות אמיתיות בלבד — בכבוד ובשקיפות.
                </p>
            </div>
        </section>
    );
};

export default Reviews;
