import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { server } from "../lib/config";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory } from "../lib/fetch";
import Meta from "../components/meta";
import Header2 from "../components/header1";
import PageHero from "../components/page-hero";
import ShareLinks from "../components/share-links";
import EmailText from "../components/email-text";
import { Send, Clock, DollarSign, User, Phone, Mail, Heart, CheckCircle } from 'lucide-react';

const details = [
  { term: "Duration", value: "30 minutes", Icon: Clock },
  { term: "Session fee", value: "$100 / half hour", Icon: DollarSign },
  { term: "Session type", value: "Private one-to-one", Icon: User },
  { term: "Via", value: "Skype, FaceTime, phone", Icon: Phone },
  { term: "Booking email", value: "sheikhassim.bookings@gmail.com", Icon: Mail, wide: true },
];

export default function CounsellingSession({ playlists, headerLectures, qna_categories }) {
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  const [formValues, setFormValues] = useState({
    fullname: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });

  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleFocusDate = () => {
      if (dateInputRef.current) {
        dateInputRef.current.showPicker?.();
      }
    };
    const handleFocusTime = () => {
      if (timeInputRef.current) {
        timeInputRef.current.showPicker?.();
      }
    };
    const dateInput = dateInputRef.current;
    const timeInput = timeInputRef.current;
    if (dateInput) dateInput.addEventListener('focus', handleFocusDate);
    if (timeInput) timeInput.addEventListener('focus', handleFocusTime);
    return () => {
      if (dateInput) dateInput.removeEventListener('focus', handleFocusDate);
      if (timeInput) timeInput.removeEventListener('focus', handleFocusTime);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.fullname.trim()) newErrors.fullname = 'Name is required';
    if (!formValues.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formValues.date) newErrors.date = 'Date is required';
    if (!formValues.time) newErrors.time = 'Time is required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log('Form submitted:', formValues);
    setSubmissionSuccess(true);
    setTimeout(() => setSubmissionSuccess(false), 5000);
  };

  const shareUrl = `${server}/counselling`;

  return (
    <>
      <Meta
        title="Counselling Session - Sheikh Assim Al Hakeem"
        description="Book a one-to-one live counseling session with Sheikh Assim Al-Hakeem for marriage counseling, personal guidance, and Islamic advice."
        image={`${server}/img/id/default_share.jpeg`}
        url={`${server}/counselling`}
        type="website"
      />

      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qna_categories} />

      <PageHero
        eyebrow="By Appointment"
        title="Private Counselling"
        subtitle="One-to-one live counselling with Sheikh Assim Al-Hakeem via Skype, FaceTime or phone call, for marriage and personal guidance."
        breadcrumbs={[{ label: 'Counselling' }]}
      />

      <section className="ah ah-page">
        <div className="ah-wrap ah-layout">
          <div className="ah-card">
            <h2>Request a Session</h2>
            <p className="ah-box__text">Share your preferred date and time and a short note about what you would like to discuss.</p>

            {submissionSuccess && (
              <div className="ah-alert ah-alert--success" role="status" style={{ marginBottom: 18 }}>
                <CheckCircle size={18} aria-hidden="true" />
                <span>Your booking request has been submitted! We'll contact you shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ah-form" noValidate>
              <div className="ah-form__row">
                <div className="ah-field">
                  <label htmlFor="c-name">Full name <span className="ah-field__req">*</span></label>
                  <input id="c-name" type="text" name="fullname" value={formValues.fullname} onChange={handleChange}
                    className={`ah-input${errors.fullname ? ' is-invalid' : ''}`} placeholder="Your full name" autoComplete="name"
                    aria-invalid={!!errors.fullname} />
                  {errors.fullname && <p className="ah-field__error">{errors.fullname}</p>}
                </div>
                <div className="ah-field">
                  <label htmlFor="c-email">Email <span className="ah-field__req">*</span></label>
                  <input id="c-email" type="email" name="email" value={formValues.email} onChange={handleChange}
                    className={`ah-input${errors.email ? ' is-invalid' : ''}`} placeholder="your@email.com" autoComplete="email"
                    aria-invalid={!!errors.email} />
                  {errors.email && <p className="ah-field__error">{errors.email}</p>}
                </div>
              </div>

              <div className="ah-field">
                <label htmlFor="c-phone">Phone <span className="ah-field__hint">(optional)</span></label>
                <input id="c-phone" type="tel" name="phone" value={formValues.phone} onChange={handleChange}
                  className="ah-input" placeholder="Include country code" autoComplete="tel" />
              </div>

              <div className="ah-form__row">
                <div className="ah-field">
                  <label htmlFor="c-date">Preferred date <span className="ah-field__req">*</span></label>
                  <input id="c-date" type="date" name="date" ref={dateInputRef} value={formValues.date} onChange={handleChange}
                    className={`ah-input${errors.date ? ' is-invalid' : ''}`} aria-invalid={!!errors.date} />
                  {errors.date && <p className="ah-field__error">{errors.date}</p>}
                </div>
                <div className="ah-field">
                  <label htmlFor="c-time">Preferred time <span className="ah-field__req">*</span></label>
                  <input id="c-time" type="time" name="time" ref={timeInputRef} value={formValues.time} onChange={handleChange}
                    className={`ah-input${errors.time ? ' is-invalid' : ''}`} aria-invalid={!!errors.time} />
                  {errors.time && <p className="ah-field__error">{errors.time}</p>}
                </div>
              </div>

              <div className="ah-field">
                <label htmlFor="c-message">Message <span className="ah-field__hint">(optional)</span></label>
                <textarea id="c-message" name="message" value={formValues.message} onChange={handleChange} rows="4"
                  className="ah-input" placeholder="Briefly describe what you would like to discuss" />
              </div>

              <div>
                <button type="submit" className="ah-btn ah-btn--primary">
                  <Send size={17} aria-hidden="true" />
                  Submit Booking Request
                </button>
              </div>
            </form>

            <hr className="ah-divider" />
            <ShareLinks url={shareUrl} title="Counselling sessions with Sheikh Assim Al-Hakeem" label="Share this page" />
          </div>

          <aside className="ah-aside" aria-label="Session details">
            <dl className="ah-chips ah-chips--stack">
              {details.map(({ term, value, Icon, wide }) => (
                <div key={term} className={wide ? "ah-chips__wide" : undefined}>
                  <span className="ah-chips__icon"><Icon size={18} aria-hidden="true" /></span>
                  <div>
                    <dt>{term}</dt>
                    <dd>{value.includes("@") ? <EmailText email={value} /> : value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <div className="ah-box ah-ask" id="donate">
              <h3><Heart size={18} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px', marginRight: 8 }} />Donate for the Needy</h3>
              <p className="ah-ask__note">Help a brother or sister in need who cannot afford counselling for marital issues, OCD, waswas and more.</p>
              <p className="ah-ask__note">Contact: <EmailText email="sheikhassim.bookings@gmail.com" /></p>
              <a href="mailto:sheikhassim.bookings@gmail.com?subject=Donation%20for%20counselling" className="ah-btn ah-btn--white">Contact to Donate</a>
            </div>

            <div className="ah-box">
              <h3>Have a religious question?</h3>
              <p className="ah-box__text">General questions are answered for free through the daily question form.</p>
              <Link href="/ask-question" className="ah-link">Ask a Question</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export async function getStaticProps() {
  try {
    const playlists = await getAllPlaylists2();
    const headerLectures = await getHeaderLectures();
    const qna_categories = await getAllQnaCategory();

    return {
      props: {
        playlists: playlists?.playlists || [],
        headerLectures: headerLectures || [],
        qna_categories: qna_categories || [],
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        playlists: [],
        headerLectures: [],
        qna_categories: [],
      },
    };
  }
}
