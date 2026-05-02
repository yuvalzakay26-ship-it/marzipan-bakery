import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import SEO from '../Shared/SEO';
import SchemaMarkup from '../Shared/SchemaMarkup';
import Breadcrumbs from '../Shared/Breadcrumbs';
import { STORY_LIST } from '../../data/stories';

const StoriesIndex = () => {
    const siteUrl = 'https://marzipanbakery.com';
    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'סיפורים מהמאפייה',
        url: `${siteUrl}/stories`,
        inLanguage: 'he-IL',
        publisher: { '@type': 'Organization', name: 'מאפיית מרציפן' },
        blogPost: STORY_LIST.map((s) => ({
            '@type': 'BlogPosting',
            url: `${siteUrl}${s.path}`,
            headline: s.seoTitle,
            datePublished: s.publishedAt,
            description: s.seoDescription
        }))
    };

    return (
        <>
            <SEO
                title="סיפורים מהמאפייה — מתכונים, סודות, ומאחורי הקלעים"
                description="הסיפורים של מאפיית מרציפן: מתכון הרוגלך, יום בשוק מחנה יהודה, סיפור המייסדים, וסודות שמאפייה אמיתית עושה אחרת."
                url="/stories"
            />
            <SchemaMarkup data={blogSchema} />

            <div className="bg-[#FDFBF7] pt-32 lg:pt-36 pb-20">
                <div className="max-w-6xl mx-auto px-5 sm:px-6">

                    <Breadcrumbs
                        crumbs={[
                            { name: 'בית', path: '/' },
                            { name: 'סיפורים' }
                        ]}
                    />

                    <header className="mt-6 mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-3 mb-5">
                            <span className="block w-8 h-px bg-[#D4AF37]"></span>
                            <span className="text-[#B91C1C] text-[11px] tracking-[0.32em] uppercase font-bold">
                                כתב יד · מאחורי הקלעים · מתכונים
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#380909] leading-[1.05] mb-5 max-w-4xl">
                            סיפורים מהמאפייה
                        </h1>
                        <p className="text-base md:text-xl text-[#5D4037] leading-relaxed max-w-3xl font-light">
                            הסטוריה של ארבעה עשורים של אפייה ירושלמית — נכתבת על ידי האנשים שאופים אותה.
                        </p>
                    </header>

                    <ul className="grid md:grid-cols-2 gap-5 md:gap-7">
                        {STORY_LIST.map((s) => (
                            <li key={s.slug}>
                                <Link
                                    to={s.path}
                                    className="block h-full bg-white rounded-3xl p-7 md:p-8 border border-[#D4AF37]/20 hover:border-[#D4AF37]/55 hover:-translate-y-1 transition-all shadow-[0_18px_45px_-30px_rgba(56,9,9,0.3)] hover:shadow-[0_25px_55px_-25px_rgba(56,9,9,0.45)] group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] md:text-xs tracking-[0.32em] uppercase font-bold text-[#B91C1C]">
                                            {s.categoryLabel}
                                        </span>
                                        <span className="text-[#5D4037]/40">·</span>
                                        <span className="inline-flex items-center gap-1 text-xs text-[#5D4037]/70">
                                            <Clock size={11} aria-hidden="true" />
                                            {s.readMinutes} דק׳
                                        </span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-black text-[#380909] leading-tight mb-3 group-hover:text-[#B91C1C] transition-colors">
                                        {s.title}
                                    </h2>
                                    <p className="text-[#5D4037] leading-relaxed text-sm md:text-base mb-5 font-light">
                                        {s.intro}
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#380909] group-hover:gap-3 transition-all">
                                        לקריאה
                                        <ArrowLeft size={16} aria-hidden="true" />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default StoriesIndex;
