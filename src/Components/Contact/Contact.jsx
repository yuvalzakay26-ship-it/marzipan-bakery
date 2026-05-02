import React, { useState } from "react";
import contactBg from "../../assets/contact_bg_v2.png";
import { Send, MapPin, Phone, Mail, Star } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";
import { CONTACT_INFO, SOCIAL_LINKS, BRANCHES } from "../../data/siteContent";
import emailjs from '@emailjs/browser';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        branch: "",
        message: "",
        newsletter: false,
        _honey: "" // Anti-spam honeypot
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

    const validate = () => {
        const newErrors = {};

        // Name validation (at least 2 chars)
        if (!formData.name.trim()) newErrors.name = "נא להזין שם מלא";
        else if (formData.name.trim().length < 2) newErrors.name = "שם חייב להכיל לפחות 2 תווים";

        // Phone validation (Israeli format)
        const phoneRegex = /^0(5[^7]|[2-4]|[8-9]|7[0-8])\d{7}$/;
        const landlineRegex = /^0[2-9]\d{7}$/;
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (!formData.phone.trim()) newErrors.phone = "נא להזין מספר טלפון";
        else if (!phoneRegex.test(cleanPhone) && !landlineRegex.test(cleanPhone)) newErrors.phone = "מספר טלפון לא תקין";

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) newErrors.email = "נא להזין כתובת אימייל";
        else if (!emailRegex.test(formData.email)) newErrors.email = "כתובת אימייל לא תקינה";

        // Branch validation
        if (!formData.branch) newErrors.branch = "אנא בחר סניף";

        // Message validation
        if (!formData.message.trim()) newErrors.message = "נא לכתוב הודעה";
        else if (formData.message.trim().length < 10) newErrors.message = "ההודעה חייבת להכיל לפחות 10 תווים";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Honeypot check
        if (formData._honey) {
            console.warn("Spam detected");
            return;
        }

        if (validate()) {
            setIsSubmitting(true);
            setSubmitStatus(null);

            // Prepare template params
            const templateParams = {
                to_name: "Marzipan Bakery",
                from_name: formData.name,
                from_email: formData.email,
                phone: formData.phone,
                branch: formData.branch,
                message: formData.message,
                newsletter: formData.newsletter ? "Yes" : "No"
            };

            try {
                const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
                const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
                const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

                if (!serviceId || !templateId || !publicKey) {
                    // Fallback for dev/demo if keys are missing
                    console.warn("EmailJS keys are missing in .env");
                    await new Promise(resolve => setTimeout(resolve, 1500));
                } else {
                    await emailjs.send(serviceId, templateId, templateParams, publicKey);
                }

                setSubmitStatus('success');

                // Analytics
                import('../../utils/analytics').then(({ trackEvent, ANALYTICS_EVENTS }) => {
                    trackEvent(ANALYTICS_EVENTS.CONTACT_SUBMIT, {
                        branch: formData.branch
                    });
                });

                setFormData({ name: "", phone: "", email: "", branch: "", message: "", newsletter: false, _honey: "" });
            } catch (error) {
                console.error('EmailJS Error:', error);
                setSubmitStatus('error');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <section className="relative min-h-[85vh] flex items-center bg-[#FAFAFA] font-sans overflow-hidden">

            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={contactBg}
                    alt="Marzipan Bakery Atmosphere"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>

                {/* Decorative Overlays - Stars & Shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Gradient Orbs - Increased Opacity */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 animate-pulse duration-[5000ms]"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#B91C1C]/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 animate-pulse duration-[7000ms]"></div>

                    {/* Floating Stars - Higher Contrast & Opacity */}
                    <div className="absolute top-[10%] left-[5%] text-[#D4AF37] opacity-80 animate-bounce delay-[0ms] duration-[3000ms]">
                        <Star size={28} fill="currentColor" />
                    </div>
                    <div className="absolute top-[20%] right-[10%] text-[#B91C1C] opacity-60 animate-pulse delay-[500ms]">
                        <Star size={20} fill="currentColor" />
                    </div>
                    <div className="absolute bottom-[15%] left-[15%] text-[#D4AF37] opacity-70 animate-pulse delay-[1000ms]">
                        <Star size={36} fill="currentColor" />
                    </div>
                    <div className="absolute top-[40%] left-[20%] text-[#D4AF37] opacity-50 animate-bounce delay-[1500ms] duration-[4000ms]">
                        <Star size={16} fill="currentColor" />
                    </div>
                    <div className="absolute bottom-[30%] right-[5%] text-[#B91C1C] opacity-40 animate-pulse delay-[200ms]">
                        <Star size={44} fill="currentColor" />
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-[1900px] mx-auto px-6 md:px-12 py-12 flex md:justify-start justify-center">

                {/* Form Card */}
                <div className="w-full md:w-[60%] bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-2xl border-t-4 border-[#B91C1C]">
                    <div className="space-y-6 text-right">

                        <div className="text-center md:text-right mb-10 cursor-default">
                            <div className="group">
                                <h1 className="text-5xl md:text-7xl font-black text-[#B91C1C] leading-tight mb-3 tracking-tight drop-shadow-sm transition-all duration-300 group-hover:drop-shadow-lg">
                                    <span className="inline-block transition-transform duration-300 group-hover:scale-105 origin-right">אנחנו כאן בשבילכם,</span>
                                    <span className="block text-3xl md:text-4xl font-bold text-gray-800 mt-2 transition-colors duration-300">לכל שאלה, טעם וריח</span>
                                </h1>

                                <div className="w-32 h-2 bg-gradient-to-r from-[#D4AF37] to-[#F9A825] rounded-full my-6 mx-auto md:mx-0 shadow-md transition-all duration-500 ease-out group-hover:w-[80%] group-hover:shadow-[#D4AF37]/40"></div>

                                <p className="text-gray-600 text-xl leading-relaxed font-light max-w-2xl">
                                    הרוגלך שלנו הם רק ההתחלה. צוות מרציפן זמין עבורכם לכל בקשה מיוחדת, הזמנה לאירוע או סתם כדי לשמוע איך היה הביס הראשון.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 w-full">
                                {/* WhatsApp Button - Primary CTA */}
                                <a href={`https://wa.me/${CONTACT_INFO.whatsapp}`} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-[#25D366] px-4 py-5 rounded-xl hover:shadow-lg transition-all group w-full hover:-translate-y-1 hover:bg-[#20bd5a] col-span-1 border border-transparent hover:border-white/20">
                                    <div className="bg-white/20 text-white p-2.5 rounded-full group-hover:scale-110 transition-transform shadow-sm shrink-0">
                                        <FaWhatsapp size={24} />
                                    </div>
                                    <div className="text-right text-white min-w-0 flex-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 truncate">זמינים ומחכים לכם</div>
                                        <div className="text-xl font-black tracking-wide truncate">הזמנה מהירה בוואטסאפ</div>
                                    </div>
                                </a>

                                {/* Call Us Button */}
                                <a href={`tel:${CONTACT_INFO.phoneTel}`} className="flex items-center gap-3 bg-[#FFF8E1] border border-[#D4AF37]/30 px-3 py-4 rounded-xl hover:shadow-lg transition-all group w-full hover:-translate-y-1">
                                    <div className="bg-[#D4AF37] text-white p-2.5 rounded-full group-hover:scale-110 transition-transform shadow-sm shrink-0">
                                        <Phone size={20} fill="currentColor" />
                                    </div>
                                    <div className="text-right min-w-0">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider truncate">חייגו אלינו</div>
                                        <div className="text-lg font-black text-[#2D211E] tracking-wide truncate">{CONTACT_INFO.phone}</div>
                                    </div>
                                </a>

                                {/* Facebook Button */}
                                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-[#1877F2] px-3 py-4 rounded-xl hover:shadow-lg transition-all group w-full hover:-translate-y-1 hover:bg-[#166fe5]">
                                    <div className="bg-white/20 text-white p-2.5 rounded-full group-hover:scale-110 transition-transform shadow-sm shrink-0">
                                        <FaFacebook size={20} />
                                    </div>
                                    <div className="text-right text-white min-w-0">
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 truncate">פייסבוק</div>
                                        <div className="text-lg font-black tracking-wide truncate">עקבו אחרינו</div>
                                    </div>
                                </a>

                                {/* Instagram Button */}
                                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] px-3 py-4 rounded-xl hover:shadow-lg transition-all group w-full hover:-translate-y-1 hover:brightness-110">
                                    <div className="bg-white/20 text-white p-2.5 rounded-full group-hover:scale-110 transition-transform shadow-sm shrink-0">
                                        <FaInstagram size={20} />
                                    </div>
                                    <div className="text-right text-white min-w-0">
                                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-90 truncate">אינסטגרם</div>
                                        <div className="text-lg font-black tracking-wide truncate">טירוף בסטורי</div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {submitStatus === 'success' ? (
                            <div className="bg-white/95 border border-green-100 p-12 rounded-3xl text-center animate-fade-in shadow-xl backdrop-blur-sm">
                                <div className="w-24 h-24 bg-[#E8F5E9] text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-4 ring-green-50">
                                    <Send size={40} className="ml-1 mt-1" />
                                </div>
                                <h3 className="text-4xl font-black text-[#1B5E20] mb-4 tracking-tight drop-shadow-sm">ההודעה נשלחה בהצלחה!</h3>
                                <p className="text-gray-600 text-xl font-light leading-relaxed max-w-lg mx-auto">
                                    תודה שפנית אלינו, צוות מרציפן קיבל את הפנייה ונחזור אליך בהקדם האפשרי.
                                </p>
                                <button
                                    onClick={() => setSubmitStatus(null)}
                                    className="mt-10 px-8 py-3 bg-gray-50 hover:bg-gray-100 text-[#B91C1C] font-bold rounded-xl transition-all shadow-sm border border-gray-200 hover:shadow-md active:scale-95"
                                >
                                    שלח הודעה נוספת
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5 mt-8" noValidate>
                                {/* Honeypot - Anti Spam */}
                                <input
                                    type="text"
                                    name="_honey"
                                    value={formData._honey}
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                    tabIndex="-1"
                                    autoComplete="off"
                                />

                                {/* Row 1: Name, Phone, Email */}
                                <div className="grid grid-cols-1 gap-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Name Input */}
                                        <div className="relative group">
                                            <div className={`absolute top-1/2 -translate-y-1/2 right-3 transition-colors ${errors.name ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[#B91C1C]'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="* שם מלא"
                                                aria-label="שם מלא"
                                                autoComplete="name"
                                                aria-invalid={!!errors.name}
                                                aria-describedby={errors.name ? "name-error" : undefined}
                                                className={`w-full pl-4 pr-10 py-3.5 bg-gray-50 border rounded-xl outline-none text-right transition-all group-hover:bg-white
                                                    ${errors.name
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50'
                                                        : 'border-gray-200 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]'
                                                    }`}
                                            />
                                            {errors.name && <p id="name-error" className="text-red-500 text-xs mt-1 mr-1">{errors.name}</p>}
                                        </div>

                                        {/* Phone Input */}
                                        <div className="relative group">
                                            <div className={`absolute top-1/2 -translate-y-1/2 right-3 transition-colors ${errors.phone ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[#B91C1C]'}`}>
                                                <Phone size={20} />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="* טלפון"
                                                aria-label="מספר טלפון"
                                                inputMode="tel"
                                                autoComplete="tel"
                                                aria-invalid={!!errors.phone}
                                                aria-describedby={errors.phone ? "phone-error" : undefined}
                                                className={`w-full pl-4 pr-10 py-3.5 bg-gray-50 border rounded-xl outline-none text-right transition-all group-hover:bg-white
                                                    ${errors.phone
                                                        ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50'
                                                        : 'border-gray-200 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]'
                                                    }`}
                                            />
                                            {errors.phone && <p id="phone-error" className="text-red-500 text-xs mt-1 mr-1">{errors.phone}</p>}
                                        </div>
                                    </div>

                                    {/* Email Input */}
                                    <div className="relative group">
                                        <div className={`absolute top-1/2 -translate-y-1/2 right-3 transition-colors ${errors.email ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[#B91C1C]'}`}>
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="* דוא״ל"
                                            aria-label="כתובת דוא״ל"
                                            inputMode="email"
                                            autoComplete="email"
                                            className={`w-full pl-4 pr-10 py-3.5 bg-gray-50 border rounded-xl outline-none text-right transition-all group-hover:bg-white
                                                ${errors.email
                                                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50'
                                                    : 'border-gray-200 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]'
                                                }`}
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1 mr-1">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* Row 2: Branch Select */}
                                <div className="relative group">
                                    <div className={`absolute top-1/2 -translate-y-1/2 right-3 transition-colors z-10 ${errors.branch ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[#B91C1C]'}`}>
                                        <MapPin size={20} />
                                    </div>
                                    <select
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        aria-label="בחירת סניף"
                                        className={`w-full pl-4 pr-10 py-3.5 bg-gray-50 border rounded-xl outline-none text-right appearance-none transition-all group-hover:bg-white cursor-pointer relative z-0
                                            ${formData.branch === "" ? "text-gray-500" : "text-gray-900"}
                                            ${errors.branch
                                                ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50'
                                                : 'border-gray-200 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]'
                                            }`}
                                    >
                                        <option value="" disabled>* סניף</option>

                                        {BRANCHES.map(branch => (
                                            <option key={branch.id} value={branch.name}>{branch.name}: {branch.address}</option>
                                        ))}
                                        <option value="other">אחר</option>
                                    </select>
                                    <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-gray-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                    {errors.branch && <p className="text-red-500 text-xs mt-1 mr-1">{errors.branch}</p>}
                                </div>

                                {/* Row 3: Message */}
                                <div className="relative group">
                                    <div className={`absolute top-4 right-3 transition-colors ${errors.message ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[#B91C1C]'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                    </div>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="* תוכן הפנייה..."
                                        aria-label="תוכן ההודעה"
                                        maxLength={2000}
                                        className={`w-full pl-4 pr-10 py-3.5 bg-gray-50 border rounded-xl outline-none text-right resize-none transition-all group-hover:bg-white
                                            ${errors.message
                                                ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50'
                                                : 'border-gray-200 focus:border-[#B91C1C] focus:ring-1 focus:ring-[#B91C1C]'
                                            }`}
                                    ></textarea>
                                    {errors.message && <p className="text-red-500 text-xs mt-1 mr-1">{errors.message}</p>}
                                </div>

                                {/* Row 4: Newsletter Checkbox */}
                                <div className="flex items-center gap-3 justify-start pt-2">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            id="newsletter"
                                            name="newsletter"
                                            checked={formData.newsletter}
                                            onChange={handleChange}
                                            className="peer w-5 h-5 text-[#B91C1C] border-2 border-gray-300 rounded focus:ring-[#B91C1C] cursor-pointer transition-all checked:bg-[#B91C1C] checked:border-[#B91C1C]"
                                        />
                                        <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200" viewBox="0 0 14 14" fill="none">
                                            <path d="M3 8L6 11L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <label htmlFor="newsletter" className="text-gray-600 font-medium text-sm select-none cursor-pointer hover:text-[#B91C1C] transition-colors">
                                        אשמח לקבל הטבות ומבצעים מתוקים למייל 🍰
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-start pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`group relative overflow-hidden bg-[#B91C1C] text-white font-bold text-lg py-4 px-12 rounded-xl transition-all duration-300 shadow-xl transform w-full md:w-auto flex items-center justify-center gap-3
                                            ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#8B1515] hover:shadow-2xl hover:shadow-red-900/20 hover:-translate-y-1 active:scale-95'}
                                        `}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="relative z-10">שולח...</span>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="relative z-10">שלח הודעה</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 transform group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                            </>
                                        )}
                                    </button>
                                </div>

                            </form>
                        )}
                    </div>
                </div>

            </div >
        </section >
    );
};

export default Contact;
