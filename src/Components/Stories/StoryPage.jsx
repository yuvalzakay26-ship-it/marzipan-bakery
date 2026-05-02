import React, { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Quote } from 'lucide-react';
import SEO from '../Shared/SEO';
import SchemaMarkup from '../Shared/SchemaMarkup';
import Breadcrumbs from '../Shared/Breadcrumbs';
import ProductCard from '../Product/ProductCard';
import { STORIES } from '../../data/stories';
import { productsData } from '../../data/productsData';

const allProducts = Object.values(productsData).flat();
const findById = (id) => allProducts.find((p) => p.id === id);

const StoryPage = () => {
    const { slug } = useParams();
    const story = STORIES[slug];
    if (!story) return <Navigate to="/stories" replace />;

    const products = useMemo(
        () => (story.relatedProductIds || []).map(findById).filter(Boolean),
        [story.relatedProductIds]
    );

    const siteUrl = 'https://marzipanbakery.com';
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: story.seoTitle,
        description: story.seoDescription,
        datePublished: story.publishedAt,
        inLanguage: 'he-IL',
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}${story.path}` },
        author: { '@type': 'Organization', name: 'מאפיית מרציפן' },
        publisher: {
            '@type': 'Organization',
            name: 'מאפיית מרציפן',
            logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.jpg` }
        },
        articleSection: story.categoryLabel
    };

    return (
        <>
            <SEO title={story.seoTitle} description={story.seoDescription} url={story.path} />
            <SchemaMarkup data={articleSchema} />

            <div className="bg-[#FDFBF7] pt-32 lg:pt-36 pb-20">
                <div className="max-w-3xl mx-auto px-5 sm:px-6">

                    <Breadcrumbs
                        crumbs={[
                            { name: 'בית', path: '/' },
                            { name: 'סיפורים', path: '/stories' },
                            { name: story.title }
                        ]}
                    />

                    <header className="mt-6 mb-10">
                        <div className="flex items-center gap-3 mb-5 text-xs">
                            <span className="text-[#B91C1C] font-bold tracking-[0.32em] uppercase">
                                {story.categoryLabel}
                            </span>
                            <span className="text-[#5D4037]/60">·</span>
                            <span className="inline-flex items-center gap-1 text-[#5D4037]/80">
                                <Clock size={12} aria-hidden="true" />
                                {story.readMinutes} דקות קריאה
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-[#380909] leading-[1.05] mb-5">
                            {story.title}
                        </h1>
                        <p className="text-base md:text-xl text-[#5D4037] leading-relaxed font-light">
                            {story.intro}
                        </p>
                    </header>

                    {story.heroQuote && (
                        <blockquote className="bg-white rounded-3xl p-7 md:p-9 border-r-4 border-[#D4AF37] shadow-[0_18px_40px_-25px_rgba(56,9,9,0.3)] mb-10 md:mb-14">
                            <Quote className="text-[#D4AF37]/60 mb-3" size={28} aria-hidden="true" />
                            <p className="text-lg md:text-xl text-[#380909] font-light italic leading-relaxed">
                                {story.heroQuote}
                            </p>
                        </blockquote>
                    )}

                    <article className="prose prose-lg max-w-none">
                        {story.sections.map((s, i) => (
                            <section key={i} className="mb-10">
                                <h2 className="text-xl md:text-3xl font-black text-[#380909] leading-tight mb-5">
                                    {s.heading}
                                </h2>
                                <div className="space-y-4 text-base md:text-lg text-[#380909] leading-relaxed font-light">
                                    {s.paragraphs.map((p, j) => (
                                        <p key={j}>{p}</p>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </article>

                    {/* Related products inline */}
                    {products.length > 0 && (
                        <section className="border-t border-[#D4AF37]/20 pt-10 mt-10">
                            <p className="text-[#B91C1C] font-bold tracking-[0.32em] text-[11px] uppercase mb-2">
                                מהקטלוג
                            </p>
                            <h2 className="text-xl md:text-2xl font-black text-[#380909] mb-6">
                                המוצרים שמופיעים בסיפור הזה
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {products.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Cross-links */}
                    {story.crossLinks?.length > 0 && (
                        <section className="border-t border-[#D4AF37]/20 pt-10 mt-12">
                            <p className="text-[#B91C1C] font-bold tracking-[0.32em] text-[11px] uppercase mb-5">
                                המשך קריאה
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {story.crossLinks.map((s) => {
                                    const t = STORIES[s];
                                    if (!t) return null;
                                    return (
                                        <Link
                                            key={s}
                                            to={t.path}
                                            className="block bg-white rounded-2xl p-5 border border-[#D4AF37]/20 hover:border-[#D4AF37]/55 hover:-translate-y-0.5 transition-all group"
                                        >
                                            <p className="text-[10px] tracking-[0.28em] uppercase text-[#B91C1C] font-bold mb-1">
                                                {t.categoryLabel}
                                            </p>
                                            <p className="font-black text-[#380909] leading-tight group-hover:text-[#B91C1C] transition-colors">
                                                {t.title}
                                            </p>
                                            <span className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-[#5D4037] group-hover:gap-2 transition-all">
                                                לקריאה
                                                <ArrowLeft size={14} aria-hidden="true" />
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
};

export default StoryPage;
