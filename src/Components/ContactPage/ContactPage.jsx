import React from "react";
import Contact from "../Contact/Contact";

import SEO from "../Shared/SEO";

const ContactPage = () => {
    return (
        <div className="pt-20">
            <SEO
                title="צור קשר"
                description="צרו קשר עם מאפיית מרציפן. הזמנות, שעות פתיחה, וכל מה שרציתם לשאול."
                url="/contact"
            />
            <Contact />
        </div>
    );
};

export default ContactPage;
