import React, { useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Check, MessageCircle, MapPin } from 'lucide-react';
import SEO from '../Shared/SEO';
import SchemaMarkup from '../Shared/SchemaMarkup';
import Breadcrumbs from '../Shared/Breadcrumbs';
import ProductCard from '../Product/ProductCard';
import { SEO_LANDINGS } from '../../data/seoLandings';
import { productsData } from '../../data/productsData';
import { CONTACT_INFO } from '../../data/siteContent';
import { trackEvent, ANALYTICS_EVENTS } from '../../utils/analytics';

const allProducts = Object.values(productsData).flat();
const findById = (id) => allProducts.find((p) => p.id === id);

// Single template for all five SEO landing pages. Renders:
//   - SEO meta + canonical
//   - BreadcrumbList JSON-LD
//   - Article JSON-LD with mentions list
//   - FAQPage JSON-LD
//   - Visible: hero, story, "why us", catalog cross-link grid, FAQ, related landings
const AuthorityLanding = () => {
    const { slug } = useParams();
    const data = SEO_LANDINGS[slug];

    if (!data) return <Navigate to="/" replace />;

    const products = useMemo(
        () => (data.relatedIds || []).map(findById).filter(Boolean),
        [data.relatedIds]
    );

    const siteUrl = 'https://marzipanbakery.com';
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': data.seo.articleType || 'Article',
        headline: data.seo.title,
        description: data.seo.description,
        inLanguage: 'he-IL',
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}${data.path}` },
        author: { '@type': 'Organization', name: 'מאפיית מרציפן', url: siteUrl },
        publisher: {
            '@type': 'Organization',
            name: 'מאפיית מרציפן',
            logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.jpg` }
        },
        about: data.targetQueries
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
    };

    const handleWhatsApp = () => {
        trackEvent(ANALYTICS_EVENTS.WHATSAPP_CLICK, {
            source: `seo_landing_${data.slug}`
        });
    };

    return (
        <>
            <SEO
                title={data.seo.title}
                description={data.seo.description}
                url={data.path}
            />
            <SchemaMarkup data={articleSchema} />
            <SchemaMarkup data={faqSchema} />

            <div className="bg-[#FDFBF7] pt-32 lg:pt-36 pb-20">
                <div className="max-w-6xl mx-auto px-5 sm:px-6">

                    {/* Breadcrumb */}
                    <Breadcrumbs
                        crumbs={[
                            { name: 'בית', path: '/' },
                            { name: 'מדריכים ירושלמיים', path: '/jerusalem' },
                            { name: data.breadcrumbName }
                        ]}
                    />

                    {/* Hero */}
                    <header className="mt-6 mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-3 mb-5">
                            <span className="block w-8 h-px bg-[#D4AF37]"></span>
                            <span className="text-[#B91C1C] text-[11px] tracking-[0.32em] uppercase font-bold">
                                {data.hero.eyebrow}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#380909] leading-[1.05] mb-5 max-w-4xl">
                            {data.hero.h1}
                        </h1>
                        <p className="text-base md:text-xl text-[#5D4037] leading-relaxed max-w-3xl font-light">
                            {data.hero.sub}
                        </p>

                        {/* Primary CTA */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-8 max-w-xl">
                            <Link
                                to="/products"
                                onClick={() => trackEvent(ANALYTICS_EVENTS.HERO_CTA_CLICK, { source: `seo_${data.slug}` })}
                                className="inline-flex items-center justify-center gap-2 bg-[#380909] hover:bg-[#B91C1C] text-white px-7 py-4 rounded-full font-bold text-base shadow-[0_18px_38px_-15px_rgba(56,9,9,0.5)] transition-all hover:-translate-y-0.5 min-h-[54px] ring-1 ring-[#D4AF37]/30"
                            >
                                להזמנה מהקטלוג
                                <ArrowLeft size={18} aria-hidden="true" />
                            </Link>
                            <a
                                href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleWhatsApp}
                                className="inline-flex items-center justify-center gap-2 bg-white border border-[#380909]/15 hover:border-[#D4AF37]/60 text-[#380909] px-7 py-4 rounded-full font-bold text-base transition-all min-h-[54px]"
                            >
                                <MessageCircle size={18} aria-hidden="true" />
                                שיחה עם הסניף
                            </a>
                        </div>
                    </header>

                    {/* Two-column intro + signature stat */}
                    <div className="grid lg:grid-cols-3 gap-8 mb-14 md:mb-20">
                        <div className="lg:col-span-2 space-y-5 text-base md:text-lg text-[#380909] leading-relaxed font-light">
                            {data.intro.map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                        <aside className="bg-[#380909] text-white rounded-3xl p-7 ring-1 ring-[#D4AF37]/40 shadow-[0_20px_50px_-25px_rgba(56,9,9,0.5)] flex flex-col justify-center">
                            <p className="text-[10px] tracking-[0.32em] uppercase font-bold text-[#D4AF37] mb-3">
                                {data.signatureFact.statLabel}
                            </p>
                            <p className="text-5xl md:text-6xl font-black leading-none mb-3">
                                {data.signatureFact.stat}
                            </p>
                            <p className="text-sm text-red-100/80 leading-relaxed">
                                {data.signatureFact.sub}
                            </p>
                        </aside>
                    </div>

                    {/* Why us */}
                    <section className="mb-14 md:mb-20">
                        <div className="text-center mb-10">
                            <p className="text-[#B91C1C] font-bold tracking-[0.32em] text-[11px] uppercase mb-3">
                                למה אנחנו
                            </p>
                            <h2 className="text-2xl md:text-4xl font-black text-[#380909] leading-tight">
                                לא הכל מאפייה — חלק מהמקומות זה תקן.
                            </h2>
                        </div>
                        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                            {data.whyUs.map((item) => (
                                <li
                                    key={item.title}
                                    className="bg-white rounded-2xl p-6 border border-[#D4AF37]/20 shadow-[0_10px_30px_-20px_rgba(56,9,9,0.25)] hover:shadow-[0_20px_45px_-25px_rgba(56,9,9,0.4)] transition-all"
                                >
                                    <div className="w-9 h-9 rounded-full bg-[#FFF8E1] border border-[#D4AF37]/40 flex items-center justify-center text-[#B91C1C] mb-4">
                                        <Check size={18} strokeWidth={3} aria-hidden="true" />
                                    </div>
                                    <h3 className="font-black text-[#380909] mb-1.5 text-lg leading-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-[#5D4037] leading-relaxed">
                                        {item.body}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Related catalog */}
                    {products.length > 0 && (
                        <section className="mb-14 md:mb-20">
                            <div className="flex items-end justify-between gap-4 mb-7 md:mb-9 flex-wrap">
                                <div>
                                    <p className="text-[#B91C1C] font-bold tracking-[0.32em] text-[11px] uppercase mb-2">
                                        מהקטלוג
                                    </p>
                                    <h2 className="text-2xl md:text-4xl font-black text-[#380909] leading-tight">
                                        מה כדאי לכם להזמין
                                    </h2>
                                </div>
                                <Link
                                    to="/products"
                                    className="text-[#B91C1C] hover:text-[#380909] font-bold inline-flex items-center gap-1.5 text-sm md:text-base"
                                >
                                    כל הקטלוג
                                    <ArrowLeft size={16} aria-hidden="true" />
                                </Link>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                                {products.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* FAQ */}
                    <section className="mb-14 md:mb-20">
                        <div className="text-center mb-10">
                            <p className="text-[#B91C1C] font-bold tracking-[0.32em] text-[11px] uppercase mb-3">
                                שאלות שגרתיות
                            </p>
                            <h2 className="text-2xl md:text-4xl font-black text-[#380909] leading-tight">
                                מה שואלים אותנו לפני שמזמינים
                            </h2>
                        </div>
                        <ul className="space-y-3 max-w-3xl mx-auto">
                            {data.faqs.map((f, i) => (
                                <li key={i}>
                                    <details className="group bg-white rounded-2xl border border-[#D4AF37]/20 p-5 shadow-sm hover:shadow-md transition-shadow">
                                        <summary className="flex items-center justify-between gap-3 cursor-pointer font-bold text-[#380909] text-base md:text-lg">
                                            <span>{f.q}</span>
                                            <span className="shrink-0 w-7 h-7 rounded-full border border-[#D4AF37]/40 text-[#B91C1C] flex items-center justify-center text-lg leading-none group-open:rotate-45 transition-transform">
                                                +
                                            </span>
                                        </summary>
                                        <p className="text-[#5D4037] leading-relaxed mt-3 text-sm md:text-base">
                                            {f.a}
                                        </p>
                                    </details>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Cross-links: other landing pages */}
                    {data.crossLinks?.length > 0 && (
                        <section className="border-t border-[#D4AF37]/20 pt-12">
                            <p className="text-[#B91C1C] font-bold tracking-[0.32em] text-[11px] uppercase mb-6 text-center">
                                המשך קריאה
                            </p>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {data.crossLinks.map((slug) => {
                                    const target = SEO_LANDINGS[slug];
                                    if (!target) return null;
                                    return (
                                        <Link
                                            key={slug}
                                            to={target.path}
                                            className="block bg-white rounded-2xl p-5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:-translate-y-1 transition-all shadow-sm hover:shadow-md group"
                                        >
                                            <p className="text-[10px] tracking-[0.28em] uppercase font-bold text-[#B91C1C] mb-1.5">
                                                {target.hero.eyebrow}
                                            </p>
                                            <p className="font-black text-[#380909] text-base md:text-lg leading-tight mb-2 group-hover:text-[#B91C1C] transition-colors">
                                                {target.hero.h1}
                                            </p>
                                            <span className="inline-flex items-center gap-1 text-sm font-bold text-[#5D4037] group-hover:gap-2 transition-all">
                                                לקריאה
                                                <ArrowLeft size={14} aria-hidden="true" />
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* Branches anchor — local SEO signal */}
                    <div className="mt-12 text-center">
                        <Link
                            to="/branches"
                            className="inline-flex items-center gap-2 text-[#5D4037] hover:text-[#B91C1C] font-medium"
                        >
                            <MapPin size={16} aria-hidden="true" />
                            לסניפים שלנו בירושלים
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthorityLanding;
