import React, { useEffect } from 'react';
import { ArrowLeft, Shield, Lock, Database, Mail, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO, BUSINESS_INFO } from '../../data/siteContent';
import SEO from '../Shared/SEO';

const Section = ({ icon: Icon, title, children }) => (
    <section className="space-y-3">
        <h2 className="text-xl md:text-2xl font-bold text-[#380909] flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-[#FFF8E1] border border-[#D4AF37]/30 flex items-center justify-center text-[#B91C1C] shrink-0">
                <Icon size={18} />
            </span>
            {title}
        </h2>
        <div className="text-gray-700 leading-relaxed space-y-3 pr-12">
            {children}
        </div>
    </section>
);

const PrivacyPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-32 md:pt-40 pb-20 font-sans" dir="rtl">
            <SEO
                title="מדיניות פרטיות"
                description="מדיניות הפרטיות של מאפיית מרציפן — איזה מידע אנו אוספים, איך אנחנו משתמשים בו ואיך תוכלו לעיין, לתקן או למחוק אותו."
                url="/privacy"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-10 md:mb-14">
                    <h1 className="text-3xl md:text-5xl font-black text-[#380909] mb-4">מדיניות פרטיות</h1>
                    <div className="w-20 h-1 bg-[#D4AF37] mx-auto rounded-full mb-5"></div>
                    <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        אנחנו מתייחסים למידע שלכם ברצינות. הדף הזה מסביר באילו נתונים אנו נוגעים, למה, ומה הזכויות שלכם
                        לפי חוק הגנת הפרטיות, התשמ"א-1981.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">עודכן לאחרונה: אפריל 2026</p>
                </div>

                {/* Body card */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-6 md:p-10 space-y-10">

                    <Section icon={Shield} title="1. הגוף האחראי על המידע">
                        <p>
                            המידע באתר נאסף ומנוהל על ידי {BUSINESS_INFO.legalName} ("המאפייה"),
                            ת.ד. בכתובת {CONTACT_INFO.address}.
                        </p>
                        <p>
                            לכל פנייה בנושא פרטיות ניתן ליצור קשר במייל{' '}
                            <a href={`mailto:${CONTACT_INFO.email}`} className="text-[#B91C1C] font-bold underline decoration-[#D4AF37]/40 underline-offset-4">
                                {CONTACT_INFO.email}
                            </a>
                            {' '}או בטלפון{' '}
                            <a href={`tel:${CONTACT_INFO.phoneTel}`} className="text-[#B91C1C] font-bold" dir="ltr">
                                {CONTACT_INFO.phone}
                            </a>.
                        </p>
                    </Section>

                    <Section icon={Database} title="2. איזה מידע אנחנו אוספים">
                        <p>אנחנו אוספים רק את המידע שאתם מוסרים לנו בעצמכם או שנדרש לתפעול האתר:</p>
                        <ul className="list-disc pr-5 space-y-2 marker:text-[#D4AF37]">
                            <li><strong>טופס יצירת קשר:</strong> שם, מספר טלפון, כתובת אימייל ותוכן הפנייה.</li>
                            <li><strong>הזמנה דרך וואטסאפ:</strong> השם, הטלפון, סניף האיסוף וזמן האיסוף שמילאתם בטופס לפני שליחת ההודעה.</li>
                            <li><strong>סל קניות:</strong> מזהי מוצרים וכמויות נשמרים מקומית בדפדפן שלכם (localStorage) בלבד — לא נשלחים אלינו עד שאתם בוחרים לשלוח הזמנה.</li>
                            <li><strong>נתוני שימוש מצרפיים:</strong> סוג דפדפן, מערכת הפעלה, דפים נצפים, זמן שהייה — דרך Google Analytics, ללא זיהוי אישי.</li>
                        </ul>
                    </Section>

                    <Section icon={UserCheck} title="3. למה אנחנו משתמשים במידע">
                        <ul className="list-disc pr-5 space-y-2 marker:text-[#D4AF37]">
                            <li>לטפל בפנייה או בהזמנה שלכם ולתאם איסוף.</li>
                            <li>לשפר את חוויית האתר ולתקן תקלות.</li>
                            <li>לעמוד בחובות חוקיות (חשבוניות, בקרת איכות, רגולציה).</li>
                        </ul>
                        <p>
                            אין שימוש שיווקי במידע שלכם ללא הסכמה מפורשת. אנחנו לא מוכרים, לא משכירים ולא מעבירים מידע אישי לצדדים שלישיים
                            לצרכים שיווקיים.
                        </p>
                    </Section>

                    <Section icon={Lock} title="4. עוגיות (Cookies) וכלי מדידה">
                        <p>
                            האתר משתמש בעוגיות הכרחיות לתפעול בלבד וב-Google Analytics לאיסוף נתונים סטטיסטיים אנונימיים על השימוש.
                            ניתן לחסום עוגיות בהגדרות הדפדפן; חסימה לא תפגע ביכולת לבצע הזמנה דרך וואטסאפ.
                        </p>
                    </Section>

                    <Section icon={Shield} title="5. אבטחת מידע">
                        <p>
                            אנחנו נוקטים אמצעי אבטחה סבירים ומקובלים בענף — תקשורת מוצפנת (HTTPS), בקרת גישה לנתונים והגבלת השמירה
                            רק למה שדרוש בפועל. עם זאת, לא ניתן להבטיח חסינות מוחלטת מפני חדירה — וכל שימוש באתר כפוף לכך.
                        </p>
                    </Section>

                    <Section icon={UserCheck} title="6. הזכויות שלכם">
                        <p>בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, יש לכם זכות:</p>
                        <ul className="list-disc pr-5 space-y-2 marker:text-[#D4AF37]">
                            <li>לעיין במידע האישי שאנו מחזיקים עליכם.</li>
                            <li>לבקש לתקן מידע שגוי או לא מדויק.</li>
                            <li>לבקש למחוק את המידע, אלא אם קיימת חובה חוקית לשמור אותו (חשבוניות וכד').</li>
                        </ul>
                        <p>
                            כדי לממש את הזכויות הללו פנו אלינו לאימייל
                            <a href={`mailto:${CONTACT_INFO.email}`} className="text-[#B91C1C] font-bold mx-1 underline decoration-[#D4AF37]/40 underline-offset-4">
                                {CONTACT_INFO.email}
                            </a>
                            ונחזור אליכם תוך 14 יום.
                        </p>
                    </Section>

                    <Section icon={Mail} title="7. שינויים במדיניות">
                        <p>
                            אנחנו עשויים לעדכן את המדיניות מעת לעת. הנוסח המעודכן יופיע תמיד בעמוד הזה עם תאריך עדכון אחרון.
                            המשך השימוש באתר לאחר עדכון מהווה הסכמה לנוסח החדש.
                        </p>
                    </Section>

                </div>

                {/* Back Link */}
                <div className="mt-10 md:mt-12 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-[#B91C1C] font-bold hover:text-[#D4AF37] transition-colors group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        חזרה לעמוד הבית
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
