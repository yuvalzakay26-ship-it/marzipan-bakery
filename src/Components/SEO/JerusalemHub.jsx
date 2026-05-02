import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '../Shared/SEO';
import SchemaMarkup from '../Shared/SchemaMarkup';
import Breadcrumbs from '../Shared/Breadcrumbs';
import { SEO_LANDING_LIST } from '../../data/seoLandings';

const JerusalemHub = () => {
    const siteUrl = 'https://marzipanbakery.com';
    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'מדריכים ירושלמיים — מאפיית מרציפן',
        url: `${siteUrl}/jerusalem`,
        inLanguage: 'he-IL',
        hasPart: SEO_LANDING_LIST.map((l) => ({
            '@type': 'Article',
            url: `${siteUrl}${l.path}`,
            headline: l.seo.title,
            description: l.seo.description
        }))
    };

    return (
        <>
            <SEO
                title="מדריכים ירושלמיים — מאפיית מרציפן"
                description="המדריכים שלנו לחיים הירושלמיים: רוגלך, מארזי שבת, מתנות מהשוק, מגשי משרד ומדריך לשוק מחנה יהודה."
                url="/jerusalem"
            />
            <SchemaMarkup data={collectionSchema} />

            <div className="bg-[#FDFBF7] pt-32 lg:pt-36 pb-20">
                <div className="max-w-6xl mx-auto px-5 sm:px-6">
                    <Breadcrumbs
                        crumbs={[
                            { name: 'בית', path: '/' },
                            { name: 'מדריכים ירושלמיים' }
                        ]}
                    />

                    <header className="mt-6 mb-12 md:mb-16">
                        <div className="inline-flex items-center gap-3 mb-5">
                            <span className="block w-8 h-px bg-[#D4AF37]"></span>
                            <span className="text-[#B91C1C] text-[11px] tracking-[0.32em] uppercase font-bold">
                                מדריכים מקומיים · 40 שנים בעיר
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#380909] leading-[1.05] mb-5 max-w-4xl">
                            מדריכים ירושלמיים
                        </h1>
                        <p className="text-base md:text-xl text-[#5D4037] leading-relaxed max-w-3xl font-light">
                            המדריכים שלנו לחיים בעיר. כתובים על ידי הדור השלישי של אופים בשוק — לא תיירים שכותבים על תיירים.
                        </p>
                    </header>

                    <ul className="grid md:grid-cols-2 gap-5 md:gap-7">
                        {SEO_LANDING_LIST.map((l) => (
                            <li key={l.slug}>
                                <Link
                                    to={l.path}
                                    className="block h-full bg-white rounded-3xl p-7 md:p-8 border border-[#D4AF37]/20 hover:border-[#D4AF37]/55 hover:-translate-y-1 transition-all shadow-[0_18px_45px_-30px_rgba(56,9,9,0.3)] hover:shadow-[0_25px_55px_-25px_rgba(56,9,9,0.45)] group"
                                >
                                    <p className="text-[10px] md:text-xs tracking-[0.32em] uppercase font-bold text-[#B91C1C] mb-3">
                                        {l.hero.eyebrow}
                                    </p>
                                    <h2 className="text-xl md:text-2xl font-black text-[#380909] leading-tight mb-3 group-hover:text-[#B91C1C] transition-colors">
                                        {l.hero.h1}
                                    </h2>
                                    <p className="text-[#5D4037] leading-relaxed text-sm md:text-base mb-5 font-light">
                                        {l.hero.sub}
                                    </p>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#380909] group-hover:gap-3 transition-all">
                                        קריאת המדריך
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

export default JerusalemHub;
