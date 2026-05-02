import React from 'react';

const SchemaMarkup = ({ data }) => {
    return (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
    );
};

export default SchemaMarkup;
