import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, ogType = "website" }) => {
    const siteTitle = "מאפיית מרציפן";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = "מאפיית מרציפן המיתולוגית משוק מחנה יהודה - המקום של הרוגלך הכי טובים בעולם. מאפים טריים, עוגות, וחלות לשבת.";
    const siteUrl = "https://marzipanbakery.com";
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
    // Until a dedicated OG image is shipped, fall back to the favicon — guaranteed to exist.
    const defaultImage = `${siteUrl}/favicon.jpg`;
    // og:image must be absolute — WhatsApp/Facebook crawlers don't resolve relative paths against the page URL.
    const resolvedImage = image
        ? (image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`)
        : defaultImage;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={ogType} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={resolvedImage} />
            <meta property="og:locale" content="he_IL" />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={resolvedImage} />
        </Helmet>
    );
};

export default SEO;
