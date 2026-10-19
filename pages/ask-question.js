import Link from 'next/link';
import { server } from "../lib/config";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory } from "../lib/fetch";
import Meta from "../components/meta";
import Header2 from "../components/header1";
import PageHero from "../components/page-hero";
import ShareLinks from "../components/share-links";
import { Mail, DollarSign, Clock, CheckCircle, Send } from 'lucide-react';
import { useState } from 'react';

export default function AskAQuestion({ playlists, headerLectures, qna_categories }) {
  const [formValues, setFormValues] = useState({ name: '', email: '', question: '' });
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Question submitted:', formValues);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormValues({ name: '', email: '', question: '' });
  };

  return (
    <>
      <Meta title="Ask a Question - Sheikh Assim Al Hakeem" description="Submit your Islamic questions to Sheikh Assim bin Luqman al-Hakeem for authentic guidance." image={`${server}/img/id/default_share.jpeg`} url={`${server}/ask-question`} type="website" />
      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qna_categories} />

      <PageHero
        eyebrow="Questions & Answers"
        title="Ask a Question"
        subtitle="Submit your question for guidance from Sheikh Assim Al Hakeem. Before asking, you may find your answer in the Q&A archive."
        breadcrumbs={[{ label: 'Q&A', href: '/qna' }, { label: 'Ask a Question' }]}
      />

      <section className="ah ah-page">
        <div className="ah-wrap ah-layout">
          <div className="ah-card">
            <h2>Submit Your Question</h2>

            <div className="ah-alert ah-alert--notice" style={{ marginBottom: 22 }}>
              <Clock size={18} aria-hidden="true" />
              <p>
                Assalamu alaikum. Questions are taken from <strong>6 p.m. (Makkah time)</strong> until the daily quota finishes, usually within the first 5 to 10 minutes. Saturday is our day off. Jazakum Allahu khairan.
              </p>
            </div>

            {submitted && (
              <div className="ah-alert ah-alert--success" role="status" style={{ marginBottom: 18 }}>
                <CheckCircle size={18} aria-hidden="true" />
                <span>Your question has been submitted successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="ah-form">
              <div className="ah-form__row">
                <div className="ah-field">
                  <label htmlFor="q-name">Your name <span className="ah-field__req">*</span></label>
                  <input id="q-name" type="text" name="name" value={formValues.name} onChange={handleChange}
                    className="ah-input" placeholder="Your name" autoComplete="name" required />
                </div>
                <div className="ah-field">
                  <label htmlFor="q-email">Email address <span className="ah-field__req">*</span></label>
                  <input id="q-email" type="email" name="email" value={formValues.email} onChange={handleChange}
                    className="ah-input" placeholder="your@email.com" autoComplete="email" required />
                </div>
              </div>

              <div className="ah-field">
                <label htmlFor="q-question">Your question <span className="ah-field__req">*</span></label>
                <textarea id="q-question" name="question" value={formValues.question} onChange={handleChange} rows="7"
                  className="ah-input" placeholder="Write your question clearly, with any details that matter" required />
              </div>

              <div>
                <button type="submit" className="ah-btn ah-btn--primary">
                  <Send size={17} aria-hidden="true" />
                  Submit Question
                </button>
              </div>
            </form>

            <hr className="ah-divider" />
            <ShareLinks url={`${server}/ask-question`} title="Ask Sheikh Assim Al Hakeem a question" label="Share this page" />
          </div>

          <aside className="ah-aside" aria-label="More options">
            <div className="ah-box">
              <h3>Search the archive first</h3>
              <p className="ah-box__text">Thousands of questions have already been answered, from prayer and fasting to family life.</p>
              <Link href="/qna" className="ah-link">Browse the Q&amp;A archive</Link>
            </div>

            <div className="ah-box">
              <h3>Counselling Sessions</h3>
              <p className="ah-box__text">Need marriage counselling or one-to-one live counselling with Sheikh Assim?</p>
              <ul className="ah-footer__contact ah-contact-list">
                <li><Mail size={17} aria-hidden="true" /><a href="mailto:sheikhassim.bookings@gmail.com">sheikhassim.bookings@gmail.com</a></li>
                <li><DollarSign size={17} aria-hidden="true" /><span>$100 / half hour</span></li>
              </ul>
              <Link href="/counselling" className="ah-link" style={{ marginTop: 12 }}>Book a session</Link>
            </div>

            <div className="ah-box ah-ask">
              <h3>Donate for the Needy</h3>
              <p className="ah-ask__note">Help a brother or sister in need who cannot afford counselling.</p>
              <p className="ah-ask__note">Contact: sheikhassim.bookings@gmail.com</p>
              <Link href="/counselling#donate" className="ah-btn ah-btn--white">Learn about donations</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export async function getStaticProps() {
  const playlists = await getAllPlaylists2();
  const headerLectures = await getHeaderLectures();
  const qna_categories = await getAllQnaCategory();
  return { props: { playlists: playlists?.playlists || [], headerLectures: headerLectures || [], qna_categories: qna_categories || [] } };
}