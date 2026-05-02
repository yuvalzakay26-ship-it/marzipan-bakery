import React from "react";
import Hero from "../Hero/Hero";
import TrustBar from "../Shared/TrustBar";
import SignatureRugelach from "./SignatureRugelach";
import OccasionPicker from "./OccasionPicker";
import Products from "../Products/Products";
import Bundles from "./Bundles";
import HeritageTimeline from "./HeritageTimeline";
import Reviews from "../Reviews/Reviews";
import HolidayPreorderList from "../Lead/HolidayPreorderList";
import VIPClub from "./VIPClub";
import FAQ from "./FAQ";

import SEO from "../Shared/SEO";

// Premium homepage funnel — one elite reading flow, no repeats.
//
//   1. Hero               — brand statement + primary CTAs
//   2. TrustBar           — quiet 4-pillar reassurance directly under hero
//   3. SignatureRugelach  — the anchor product, told as a legend
//   4. OccasionPicker     — conversion psychology: tell us the moment
//   5. Products           — curated category preview
//   6. Bundles            — curated combos (sibling of catalog)
//   7. HeritageTimeline   — 1986 → today, one heritage moment
//   8. Reviews            — Google-anchored social proof
//   9. HolidayPreorderList — high-value lead capture before they leave
//  10. VIPClub            — final WhatsApp CTA
//  11. FAQ                — safety net + FAQPage schema
//
// Removed (redundant with the above): WhyOrderToday, ProofStrip, About,
// BirthdayClub — every message they carried is already said better elsewhere.
const Home = () => {
    return (
        <>
            <SEO
                title="מאפיית מרציפן — הטעם של ירושלים מאז 1986"
                description="מאפיית הבוטיק של שוק מחנה יהודה. רוגלך חמים מהתנור, מארזי שבת, מתנות ירושלמיות. כשרות בד״ץ. שלושה סניפים בלב ירושלים."
                url="/"
            />
            <Hero />
            <TrustBar />
            <SignatureRugelach />
            <OccasionPicker />
            <div id="products">
                <Products />
            </div>
            <Bundles />
            <HeritageTimeline />
            <Reviews />
            <HolidayPreorderList />
            <VIPClub />
            <FAQ />
        </>
    );
};

export default Home;
