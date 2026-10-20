import { useState, useRef } from 'react';
import Link from 'next/link';
import { getAllPlaylists2, getAllQnaCategory, getHeaderLectures } from '../lib/fetch';
import Meta from '../components/meta';
import Header2 from '../components/header1';
import PageHero from '../components/page-hero';
import SocialLinks from '../components/social-links';
import EmailText from '../components/email-text';
import { Mail, MapPin, Send, CheckCircle, AlertCircle, Calendar, HelpCircle } from 'lucide-react';

export default function Contact({ playlists, headerLectures, qna_categories }) {
    const [formData, setFormData] = useState({ firstName: '', subject: '', email: '', phone: '', message: '' });
    const [formStatus, setFormStatus] = useState({ submitted: false, success: false, message: '' });
    const [errors, setErrors] = useState({});

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

    const fieldClass = (name) => `ah-input${errors[name] ? ' is-invalid' : ''}`;

    return (
        <>
            <Meta title="Contact Sheikh Assim Al Hakeem" description="Get in touch with Sheikh Assim Al Hakeem" />
            <Header2 playlists={playlists} headerLectures={headerLectures} qna_categories={qna_categories} />

            <PageHero
                eyebrow="Contact"
                title="Get in Touch"
                subtitle="Have a question about the website, lectures or bookings? Send a message and the team will reply by email."
                breadcrumbs={[{ label: 'Contact' }]}
            />

            <section className="ah ah-page">
                <div className="ah-wrap ah-layout">
                    <div className="ah-card">
                        <h2>Send a Message</h2>

                        {formStatus.submitted && formStatus.success && (
                            <div className="ah-alert ah-alert--success" role="status" style={{ marginBottom: 18 }}>
                                <CheckCircle size={18} aria-hidden="true" />
                                <span>{formStatus.message}</span>
                            </div>
                        )}
                        {formStatus.submitted && !formStatus.success && formStatus.message !== 'Sending...' && (
                            <div className="ah-alert ah-alert--error" role="alert" style={{ marginBottom: 18 }}>
                                <AlertCircle size={18} aria-hidden="true" />
                                <span>{formStatus.message}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="ah-form" noValidate>
                            <div className="ah-form__row">
                                <div className="ah-field">
                                    <label htmlFor="contact-name">Full name <span className="ah-field__req">*</span></label>
                                    <input id="contact-name" ref={firstNameRef} type="text" name="firstName" value={formData.firstName} onChange={handleChange}
                                        className={fieldClass('firstName')} placeholder="Your name" autoComplete="name"
                                        aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? 'contact-name-error' : undefined} />
                                    {errors.firstName && <p id="contact-name-error" className="ah-field__error">{errors.firstName}</p>}
                                </div>
                                <div className="ah-field">
                                    <label htmlFor="contact-subject">Subject <span className="ah-field__req">*</span></label>
                                    <input id="contact-subject" ref={subjectRef} type="text" name="subject" value={formData.subject} onChange={handleChange}
                                        className={fieldClass('subject')} placeholder="What is it about?"
                                        aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'contact-subject-error' : undefined} />
                                    {errors.subject && <p id="contact-subject-error" className="ah-field__error">{errors.subject}</p>}
                                </div>
                            </div>

                            <div className="ah-form__row">
                                <div className="ah-field">
                                    <label htmlFor="contact-email">Email <span className="ah-field__req">*</span></label>
                                    <input id="contact-email" ref={emailRef} type="email" name="email" value={formData.email} onChange={handleChange}
                                        className={fieldClass('email')} placeholder="your@email.com" autoComplete="email"
                                        aria-invalid={!!errors.email} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
                                    {errors.email && <p id="contact-email-error" className="ah-field__error">{errors.email}</p>}
                                </div>
                                <div className="ah-field">
                                    <label htmlFor="contact-phone">Phone <span className="ah-field__hint">(optional)</span></label>
                                    <input id="contact-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange}
                                        className="ah-input" placeholder="Include country code" autoComplete="tel" />
                                </div>
                            </div>

                            <div className="ah-field">
                                <label htmlFor="contact-message">Message <span className="ah-field__req">*</span></label>
                                <textarea id="contact-message" ref={messageRef} name="message" rows="6" value={formData.message} onChange={handleChange}
                                    className={fieldClass('message')} placeholder="Write your message"
                                    aria-invalid={!!errors.message} aria-describedby={errors.message ? 'contact-message-error' : undefined} />
                                {errors.message && <p id="contact-message-error" className="ah-field__error">{errors.message}</p>}
                            </div>

                            <div>
                                <button type="submit" className="ah-btn ah-btn--primary"
                                    disabled={formStatus.submitted && !formStatus.success && formStatus.message === 'Sending...'}
                                    title={!canSubmit ? 'Please complete all required fields correctly' : ''}>
                                    <Send size={17} aria-hidden="true" />
                                    {formStatus.submitted && !formStatus.success && formStatus.message === 'Sending...' ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <aside className="ah-aside" aria-label="Contact details">
                        <div className="ah-box">
                            <h3>Contact Details</h3>
                            <ul className="ah-footer__contact ah-contact-list">
                                <li>
                                    <Mail size={17} aria-hidden="true" />
                                    <a href="mailto:sheikhassim.bookings@gmail.com"><EmailText email="sheikhassim.bookings@gmail.com" /></a>
                                </li>
                                <li>
                                    <MapPin size={17} aria-hidden="true" />
                                    <span>Jeddah, Saudi Arabia</span>
                                </li>
                            </ul>
                        </div>

                        <div className="ah-box">
                            <h3>Follow</h3>
                            <p className="ah-box__text">Lectures, short answers and updates are shared on these channels.</p>
                            <SocialLinks className="ah-about__social" />
                        </div>

                        <div className="ah-box ah-ask">
                            <h3>Looking for something else?</h3>
                            <p className="ah-ask__note">Religious questions are answered through the daily question form, and private sessions are booked separately.</p>
                            <Link href="/ask-question" className="ah-btn ah-btn--white"><HelpCircle size={17} aria-hidden="true" />Ask a Question</Link>
                            <Link href="/counselling" className="ah-btn ah-btn--ghost-light" style={{ width: '100%', marginTop: 10 }}><Calendar size={17} aria-hidden="true" />Book Counselling</Link>
                        </div>
                    </aside>
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