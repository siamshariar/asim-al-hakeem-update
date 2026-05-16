import { useState, useRef } from 'react';
import { getAllPlaylists2, getAllQnaCategory, getHeaderLectures } from '../lib/fetch';
import Meta from '../components/meta';
import Header2 from '../components/header1';
import PageHero from '../components/page-hero';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, Facebook, Youtube, Instagram, Twitter, CheckCircle } from 'lucide-react';

export default function Contact({ playlists, headerLectures, qna_categories }) {
    const [formData, setFormData] = useState({ firstName: '', subject: '', email: '', phone: '', message: '' });
    const [formStatus, setFormStatus] = useState({ submitted: false, success: false, message: '' });
    const [errors, setErrors] = useState({});

    const contactInfo = [
        { icon: Phone, title: 'Phone', details: ['+966 12 345 6789'], color: 'bg-green-500' },
        { icon: Mail, title: 'Email', details: ['sheikhassim.bookings@gmail.com'], color: 'bg-blue-500' },
        { icon: MapPin, title: 'Location', details: ['Jeddah, Saudi Arabia'], color: 'bg-red-500' },
        { icon: Clock, title: 'Working Hours', details: ['Sat-Thu: 9AM-6PM', 'Friday: Closed'], color: 'bg-purple-500' }
    ];

    const socialLinks = [
        { icon: Facebook, href: 'https://www.facebook.com/SheikhAssimAlhakeemTeam/', color: 'hover:bg-blue-600' },
        { icon: Youtube, href: 'https://www.youtube.com/user/assimalhakeem', color: 'hover:bg-red-600' },
        { icon: Instagram, href: 'https://www.instagram.com/assimalhakeem?igshid=1v9psnayget6c', color: 'hover:bg-pink-600' },
        { icon: Twitter, href: 'https://x.com/Assimalhakee', color: 'hover:bg-sky-500' },
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'Name is required';
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        return newErrors;
    };

    // whether the form is currently valid (used to show helper title)
    const canSubmit = Object.keys(validateForm()).length === 0;

    // refs to focus invalid fields
    const firstNameRef = useRef(null);
    const subjectRef = useRef(null);
    const emailRef = useRef(null);
    const messageRef = useRef(null);

    const focusFirstInvalid = (errs) => {
        if (!errs) return;
        if (errs.firstName && firstNameRef.current) { firstNameRef.current.focus(); return; }
        if (errs.subject && subjectRef.current) { subjectRef.current.focus(); return; }
        if (errs.email && emailRef.current) { emailRef.current.focus(); return; }
        if (errs.message && messageRef.current) { messageRef.current.focus(); return; }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) { setErrors(newErrors); focusFirstInvalid(newErrors); return; }
        setFormStatus({ submitted: true, success: false, message: 'Sending...' });
        try {
            const res = await fetch('/api/sendMail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.firstName,
                    subject: formData.subject,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message
                })
            });

            if (res.ok) {
                setFormStatus({ submitted: true, success: true, message: 'Message sent successfully!' });
                setFormData({ firstName: '', subject: '', email: '', phone: '', message: '' });
            } else {
                let errText = '';
                try { errText = await res.text(); } catch (e) { errText = res.statusText }
                setFormStatus({ submitted: true, success: false, message: `Send failed: ${res.status} ${errText}` });
            }
        } catch (err) {
            setFormStatus({ submitted: true, success: false, message: 'Network error. Please try again later.' });
        }
    };

    return (
        <>
            <Meta title="Contact Sheikh Assim Al Hakeem" description="Get in touch with Sheikh Assim Al Hakeem" />
            <Header2 playlists={playlists} headerLectures={headerLectures} qna_categories={qna_categories} />
            
            <PageHero
                title="Get In Touch"
                subtitle="Have questions or need guidance? We're here to help. Reach out to us anytime."
                Icon={Mail}
            />

            {/* Contact Info Cards */}
            {/* <section className="py-8 sm:py-12 lg:py-16">
                <div className="container max-w-[1260px] mx-auto px-4">
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                        {contactInfo.map((info, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -3 }} className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 text-center hover:shadow-xl transition-all">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 ${info.color} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}>
                                    <info.icon size={22} className="sm:w-6 sm:h-6 text-white" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-[#1a1f2e] mb-2">{info.title}</h3>
                                {info.details.map((detail, i) => (
                                    <p key={i} className="text-xs sm:text-sm text-gray-600">{detail}</p>
                                ))}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Contact Form */}
            <section className="py-8 sm:py-12 lg:py-16">
                <div className="container max-w-[1260px] mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a1f2e] mb-4 sm:mb-6">Send Us a Message</h2>
                            
                            {formStatus.success && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 text-green-700 text-xs sm:text-sm">
                                    <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                                    <span>{formStatus.message}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                        <input ref={firstNameRef} type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${errors.firstName ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#10b981]/20 focus:border-[#10b981]'}`}
                                            placeholder="Your name" />
                                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                        <input ref={subjectRef} type="text" name="subject" value={formData.subject} onChange={handleChange}
                                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${errors.subject ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#10b981]/20 focus:border-[#10b981]'}`}
                                            placeholder="Message subject" />
                                        {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input ref={emailRef} type="email" name="email" value={formData.email} onChange={handleChange}
                                            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all text-sm ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#10b981]/20 focus:border-[#10b981]'}`}
                                            placeholder="your@email.com" />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] text-sm"
                                            placeholder="+966 XX XXX XXXX" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Message *</label>
                                    <textarea ref={messageRef} name="message" rows="4" value={formData.message} onChange={handleChange}
                                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all resize-none text-sm ${errors.message ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#10b981]/20 focus:border-[#10b981]'}`}
                                        placeholder="Your message..." />
                                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                </div>

                                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
                                    disabled={(formStatus.submitted && !formStatus.success)}
                                    title={!canSubmit ? 'Please complete all required fields correctly' : ''}
                                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                                    <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    {formStatus.submitted && !formStatus.success ? 'Sending...' : 'Send Message'}
                                </motion.button>
                            </form>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                            className="space-y-4 sm:space-y-5 lg:space-y-6">
                            <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8">
                                <h3 className="text-lg sm:text-xl font-semibold text-[#1a1f2e] mb-4">Connect With Us</h3>
                                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5">
                                    Follow us on social media for the latest updates, lectures, and Islamic content.
                                </p>
                                <div className="flex gap-2 sm:gap-3">
                                    {socialLinks.map((social, idx) => (
                                        <motion.a key={idx} href={social.href} target="_blank" rel="noopener noreferrer"
                                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                                            className={`p-3 sm:p-3.5 bg-gray-100 rounded-lg sm:rounded-xl text-gray-600 transition-all ${social.color} hover:text-white`}>
                                            <social.icon size={18} className="sm:w-5 sm:h-5" />
                                        </motion.a>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl p-5 sm:p-6 lg:p-8 text-white">
                                <h3 className="text-white text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Need Urgent Help?</h3>
                                <p className="text-white/90 text-xs sm:text-sm mb-4 sm:mb-5">
                                    For counseling sessions or urgent inquiries, you can reach out directly:
                                </p>
                                <div className="space-y-2 sm:space-y-3">
                                    <a href="mailto:sheikhassim.bookings@gmail.com" className="flex items-center gap-2 sm:gap-3 text-white/90 hover:text-white transition-colors text-xs sm:text-sm">
                                        <Mail size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                                        <span className="break-all">sheikhassim.bookings@gmail.com</span>
                                    </a>
                                    {/* <a href="https://wa.me/966123456789" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 sm:gap-3 text-white/90 hover:text-white transition-colors text-xs sm:text-sm">
                                        <Phone size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                                        <span>WhatsApp: +966 12 345 6789</span>
                                    </a> */}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </>
    );
}

export const getStaticProps = async () => {
    const playlists = await getAllPlaylists2();
    const headerLectures = await getHeaderLectures();
    const qna_categories = await getAllQnaCategory();
    return { props: { playlists: playlists?.playlists || [], headerLectures: headerLectures || [], qna_categories: qna_categories || [] } };
};