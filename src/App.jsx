import "./App.css";
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { captureReferralFromUrl } from "./lib/customer/referral";
import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import Home from "./Components/Home/Home";
import ScrollToTop from "./Components/ScrollToTop";
import ProductsPage from "./Components/ProductsPage/ProductsPage";
import ProductPage from "./Components/ProductPage/ProductPage";
import AboutPage from "./Components/AboutPage/AboutPage";
import BranchesPage from "./Components/BranchesPage/BranchesPage";
import ContactPage from "./Components/ContactPage/ContactPage";
import HanukkahPage from "./Components/HanukkahPage/HanukkahPage";
import ShavuotPage from "./Components/ShavuotPage/ShavuotPage";
import AccessibilityPage from "./Components/AccessibilityPage/AccessibilityPage";
import TermsPage from "./Components/TermsPage/TermsPage";
import PrivacyPage from "./Components/PrivacyPage/PrivacyPage";
import NotFoundPage from "./Components/NotFoundPage/NotFoundPage";
import MagicalBackground from "./Components/Shared/MagicalBackground";

import { CartProvider } from "./context/CartContext";
import ScrollToTopButton from "./Components/ScrollToTopButton";
import CartDrawer from "./Components/Cart/CartDrawer";
import SchemaMarkup from "./Components/Shared/SchemaMarkup";
import StickyMobileCTA from "./Components/Shared/StickyMobileCTA";
import ReorderPrompt from "./Components/Shared/ReorderPrompt";
import AccessibilityWidget from "./Components/Shared/AccessibilityWidget";
import CookieConsent from "./Components/Shared/CookieConsent";

// Phase 3 routes — lazy-loaded so they never affect the marketing-site bundle.
const CheckoutPage       = lazy(() => import("./Components/CheckoutPage/CheckoutPage"));
const OrderSuccess       = lazy(() => import("./Components/CheckoutPage/OrderSuccess"));
const OrderConfirmation  = lazy(() => import("./Components/Checkout/OrderConfirmation"));
const PaymentResult      = lazy(() => import("./Components/Checkout/PaymentResult"));
const AccountPage        = lazy(() => import("./Components/Account/AccountPage"));
const AdminLogin         = lazy(() => import("./Components/Admin/AdminLogin"));
const AdminLayout        = lazy(() => import("./Components/Admin/AdminLayout"));
const AdminDashboard     = lazy(() => import("./Components/Admin/AdminDashboard"));
const AdminProducts      = lazy(() => import("./Components/Admin/AdminProducts"));
const AdminOrders        = lazy(() => import("./Components/Admin/AdminOrders"));
const AdminBundles       = lazy(() => import("./Components/Admin/AdminBundles"));
const AdminGrowth        = lazy(() => import("./Components/Admin/GrowthDashboard"));
const AdminCrm           = lazy(() => import("./Components/Admin/AdminCrm"));
const ProtectedRoute     = lazy(() => import("./Components/Admin/ProtectedRoute"));

// Growth layer — also lazy. None of these ship in the initial bundle.
const JerusalemHub       = lazy(() => import("./Components/SEO/JerusalemHub"));
const AuthorityLanding   = lazy(() => import("./Components/SEO/AuthorityLanding"));
const StoriesIndex       = lazy(() => import("./Components/Stories/StoriesIndex"));
const StoryPage          = lazy(() => import("./Components/Stories/StoryPage"));
const ExitIntentModal    = lazy(() => import("./Components/Lead/ExitIntentModal"));

function App() {
  // Capture ?ref=CODE / /r/CODE on first paint so the code persists through
  // the customer's session even if they navigate away and come back later.
  useEffect(() => { captureReferralFromUrl(); }, []);

  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": "מאפיית מרציפן",
    "alternateName": "Marzipan Bakery",
    "image": "https://marzipanbakery.com/favicon.jpg",
    "telephone": "+972-2-623-2594",
    "url": "https://marzipanbakery.com",
    "foundingDate": "1986",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Agripas Street 44",
      "addressLocality": "Jerusalem",
      "addressRegion": "Jerusalem District",
      "postalCode": "9430144",
      "addressCountry": "IL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 31.7855,
      "longitude": 35.2118
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        "opens": "05:00",
        "closes": "23:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Friday",
        "opens": "05:00",
        "closes": "15:00"
      }
    ],
    "priceRange": "₪₪",
    "currenciesAccepted": "ILS",
    "paymentAccepted": "Cash, Credit Card, Bit, Apple Pay",
    "areaServed": {
      "@type": "City",
      "name": "Jerusalem"
    },
    "sameAs": [
      "https://www.facebook.com/marzipanbakery",
      "https://www.instagram.com/marzipanbakery"
    ]
  };

  return (
    <CartProvider>
      <div dir="rtl" className="antialiased bg-[#FDFBF7] text-[#2D211E] relative">
        <ScrollToTop />
        <SchemaMarkup data={businessSchema} />
        <MagicalBackground />
        <CartDrawer />
        <div className="relative z-10">
          <Navbar />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:slug" element={<ProductPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/branches" element={<BranchesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/holidays/hanukkah" element={<HanukkahPage />} />
              <Route path="/holidays/shavuot" element={<ShavuotPage />} />
              <Route path="/accessibility" element={<AccessibilityPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* Referral landing — capture and bounce home */}
              <Route path="/r/:code" element={<Home />} />

              {/* Phase 3 — real commerce */}
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order/success" element={<OrderSuccess />} />
              <Route path="/order/confirmation" element={<OrderConfirmation />} />
              <Route path="/order/payment/result" element={<PaymentResult />} />
              <Route path="/account" element={<AccountPage />} />

              {/* Growth layer — SEO authority pages */}
              <Route path="/jerusalem" element={<JerusalemHub />} />
              <Route path="/jerusalem/:slug" element={<AuthorityLanding />} />

              {/* Growth layer — content flywheel */}
              <Route path="/stories" element={<StoriesIndex />} />
              <Route path="/stories/:slug" element={<StoryPage />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="bundles" element={<AdminBundles />} />
                <Route path="growth" element={<AdminGrowth />} />
                <Route path="crm" element={<AdminCrm />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <Footer />
          <ScrollToTopButton />
          <StickyMobileCTA />
          <ReorderPrompt />
          <AccessibilityWidget />
          <CookieConsent />
          <Suspense fallback={null}>
            <ExitIntentModal />
          </Suspense>
        </div>
      </div>
    </CartProvider>
  );
}

export default App;
