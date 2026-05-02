import React, { useEffect } from 'react';
import { ArrowLeft, FileText, ScrollText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO, BUSINESS_INFO } from '../../data/siteContent';
import SEO from "../Shared/SEO";

const Clause = ({ number, title, children }) => (
    <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#380909]">
            {number}. {title}
        </h3>
        <div className="text-gray-700 leading-relaxed space-y-3 pr-4 border-r-2 border-[#D4AF37]/30">
            <div className="pr-3">{children}</div>
        </div>
    </div>
);

const TermsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAFA] pt-32 md:pt-40 pb-20 font-sans" dir="rtl">
            <SEO
                title="תנאי שימוש"
                description="תנאי השימוש של אתר מאפיית מרציפן — הזמנות, איסוף, ביטולים, אלרגנים וקניין רוחני."
                url="/terms"
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6">

                {/* Header */}
                <div className="text-center mb-10 md:mb-14">
                    <h1 className="text-3xl md:text-5xl font-black text-[#380909] mb-4">תנאי שימוש</h1>
                    <div className="w-20 h-1 bg-[#D4AF37] mx-auto rounded-full mb-5"></div>
                    <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        השימוש באתר {BUSINESS_INFO.tradeName} ובטפסי ההזמנה שלו כפוף לתנאים שלהלן. אנא קראו אותם לפני שליחת הזמנה.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">עודכן לאחרונה: אפריל 2026</p>
                </div>

                {/* Body card */}
                <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">

                    {/* Section header */}
                    <div className="bg-[#380909] p-6 flex items-center gap-3">
                        <FileText className="text-[#D4AF37]" size={26} />
                        <h2 className="text-xl md:text-2xl font-bold text-white">תנאי שימוש באתר ובהזמנות</h2>
                    </div>

                    <div className="p-6 md:p-10 space-y-8">

                        <Clause number="1" title="מי אנחנו">
                            <p>
                                {BUSINESS_INFO.legalName}, מאפייה הפועלת מאז שנת {BUSINESS_INFO.foundedYear}
                                {' '}משוק מחנה יהודה בירושלים. כתובתנו: {CONTACT_INFO.address}.
                                ניתן ליצור קשר בטלפון{' '}
                                <a href={`tel:${CONTACT_INFO.phoneTel}`} className="text-[#B91C1C] font-bold" dir="ltr">{CONTACT_INFO.phone}</a>
                                {' '}או באימייל{' '}
                                <a href={`mailto:${CONTACT_INFO.email}`} className="text-[#B91C1C] font-bold underline decoration-[#D4AF37]/40 underline-offset-4">
                                    {CONTACT_INFO.email}
                                </a>.
                            </p>
                        </Clause>

                        <Clause number="2" title="קניין רוחני">
                            <p>
                                כל זכויות היוצרים והקניין הרוחני באתר — לרבות השם "מרציפן", הלוגו, העיצובים, התמונות והטקסטים —
                                שייכים ל{BUSINESS_INFO.legalName}. אין להעתיק, לשכפל, להפיץ או לעשות שימוש מסחרי בחומרים אלו ללא אישור בכתב.
                            </p>
                        </Clause>

                        <Clause number="3" title="הזמנות ואיסוף">
                            <ul className="list-disc pr-5 space-y-2 marker:text-[#D4AF37]">
                                <li>הזמנה דרך האתר נשלחת בוואטסאפ אל המאפייה ועוברת לאישור אישי לפני חיוב.</li>
                                <li>תשלום מתבצע ישירות בסניף או דרך אמצעי תשלום מאובטח שנשלח אליכם — {BUSINESS_INFO.paymentMethods.join(", ")}.</li>
                                <li>איסוף מתבצע משלושת סניפי המאפייה בירושלים בלבד, בשעות הפעילות.</li>
                                <li>זמן הכנה משוער: 30–90 דקות, בהתאם לעומס היומי. בערבי שבת וחג ייתכנו זמני המתנה ארוכים יותר.</li>
                            </ul>
                        </Clause>

                        <Clause number="4" title="מחירים, זמינות וט.ל.ח">
                            <p>
                                המחירים באתר נקובים בש"ח וכוללים מע"מ. תמונות המוצרים להמחשה בלבד וייתכנו הבדלים קלים בין התמונות לבין המוצר בפועל.
                                המאפייה רשאית לשנות מחירים, להוריד מוצרים מהמלאי או להוסיף פריטים בכל עת וללא הודעה מוקדמת.
                                במקרה של פער מחירים בין סל הקניות לבין אישור ההזמנה — הלקוח יקבל הודעה לפני חיוב ויוכל לאשר או לבטל. ט.ל.ח.
                            </p>
                        </Clause>

                        <Clause number="5" title="ביטולים והחזרים">
                            <p>
                                מכיוון שמדובר במוצרי מזון טריים, על פי תקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010 לא ניתן להחזיר או להחליף מוצרי מאפה
                                לאחר שיצאו משטח המאפייה. ביטול הזמנה לפני הכנתה אפשרי ללא עלות —
                                בתיאום טלפוני מול הסניף הרלוונטי, עד שעתיים לפני זמן האיסוף שתואם.
                                במקרה של פגם או טעות בהזמנה — צרו איתנו קשר תוך 24 שעות ונפעל לתקן או להחזיר את התשלום.
                            </p>
                        </Clause>

                        <Clause number="6" title="כשרות">
                            <p>
                                כל מוצרי המאפייה תחת השגחת {BUSINESS_INFO.kashrut}. תעודת הכשרות מוצגת בכל אחד מהסניפים ומתעדכנת אחת לשנה.
                                בשבתות וחגים — המאפייה סגורה.
                            </p>
                        </Clause>

                        <Clause number="7" title="אלרגנים">
                            <p>
                                המוצרים מיוצרים בסביבה המכילה גלוטן, ביצים, חלב, אגוזים מכל הסוגים, שומשום, סויה ובוטנים.
                                איננו יכולים להתחייב לסביבה סטרילית מאלרגנים. לקוחות עם רגישויות, אלרגיות או צרכים תזונתיים מיוחדים —
                                אנא וודאו את הרכיבים מול צוות המאפייה לפני הצריכה.
                            </p>
                        </Clause>

                        <Clause number="8" title="פרטיות">
                            <p>
                                איסוף ושימוש במידע אישי מנוהלים בנפרד במסמך{' '}
                                <Link to="/privacy" className="text-[#B91C1C] font-bold underline decoration-[#D4AF37]/40 underline-offset-4">
                                    מדיניות הפרטיות
                                </Link>
                                {' '}— הוא חלק בלתי נפרד מתנאים אלה.
                            </p>
                        </Clause>

                        <Clause number="9" title="הגבלת אחריות">
                            <p>
                                האתר מסופק "כפי שהוא" (AS IS). השימוש באתר על אחריות המשתמש בלבד, ובכפוף לחוק. המאפייה לא תישא באחריות
                                לכל נזק עקיף, מיוחד או תוצאתי שייגרם בעקבות שימוש באתר או ניתוקים זמניים בשירות.
                            </p>
                        </Clause>

                        <Clause number="10" title="דין וסמכות שיפוט">
                            <p>
                                על תנאים אלה יחולו דיני מדינת ישראל בלבד. סמכות השיפוט הבלעדית בכל הנוגע אליהם נתונה לבתי המשפט המוסמכים בעיר ירושלים.
                            </p>
                        </Clause>

                    </div>

                    {/* Privacy callout */}
                    <div className="bg-[#FFF8E1] border-t border-[#D4AF37]/30 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                        <div className="flex items-start gap-3">
                            <ScrollText className="text-[#B91C1C] mt-1 shrink-0" size={22} />
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                                לעיון במדיניות הפרטיות שלנו ובזכויות שלכם לפי חוק הגנת הפרטיות —
                            </p>
                        </div>
                        <Link
                            to="/privacy"
                            className="shrink-0 inline-flex items-center gap-2 bg-[#B91C1C] hover:bg-[#380909] text-white px-5 py-2.5 rounded-full font-bold text-sm transition-colors"
                        >
                            למדיניות הפרטיות
                            <ArrowLeft size={16} />
                        </Link>
                    </div>
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

export default TermsPage;
