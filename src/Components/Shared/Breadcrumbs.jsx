import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import SchemaMarkup from './SchemaMarkup';

// Renders both visible breadcrumb UI and the BreadcrumbList JSON-LD that Google uses
// to render breadcrumb-style snippets in SERPs. Pass crumbs as
// [{ name, path }, ...] from root → current page (current = no path).
const Breadcrumbs = ({ crumbs = [] }) => {
    if (!crumbs.length) return null;

    const siteUrl = 'https://marzipanbakery.com';
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            ...(c.path ? { item: `${siteUrl}${c.path}` } : {})
        }))
    };

    return (
        <>
            <SchemaMarkup data={schema} />
            <nav
                aria-label="ניווט פירורים"
                className="text-xs sm:text-sm text-[#5D4037]/80"
            >
                <ol className="flex flex-wrap items-center gap-1.5">
                    {crumbs.map((c, i) => {
                        const isLast = i === crumbs.length - 1;
                        return (
                            <li key={`${c.name}-${i}`} className="flex items-center gap-1.5">
                                {i > 0 && (
                                    <ChevronLeft size={14} className="text-[#D4AF37] shrink-0" aria-hidden="true" />
                                )}
                                {c.path && !isLast ? (
                                    <Link
                                        to={c.path}
                                        className="hover:text-[#B91C1C] transition-colors font-medium"
                                    >
                                        {c.name}
                                    </Link>
                                ) : (
                                    <span className="font-bold text-[#380909]" aria-current={isLast ? 'page' : undefined}>
                                        {c.name}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
};

export default Breadcrumbs;
