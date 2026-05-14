import { server } from "../lib/config";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory } from "../lib/fetch";
import Meta from "../components/meta";
import Header2 from "../components/header1";
import { motion } from "framer-motion";
import { Mail, DollarSign, AlertCircle, Copy, CheckCircle, Send, User, HelpCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function AskAQuestion({ playlists, headerLectures, qna_categories }) {
  const [formValues, setFormValues] = useState({ name: '', email: '', question: '' });
  const [submitted, setSubmitted] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const shareTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  const handleChange = (e) => setFormValues({ ...formValues, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Question submitted:', formValues);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormValues({ name: '', email: '', question: '' });
  };

  const handleCopyLink = () => {
    const currentUrl = typeof window !== "undefined"
      ? window.location.href
      : `${server}/ask-question`;

    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedShare(true);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setCopiedShare(false), 2000);
    }).catch(() => {
      // Keep silent to avoid alert popups; UX stays non-blocking.
    });
  };

  return (
    <>
      <Meta title="Ask a Question - Sheikh Assim Al Hakeem" description="Submit your Islamic questions to Sheikh Assim bin Luqman al-Hakeem for authentic guidance." image={`${server}/img/id/default_share.jpeg`} url={`${server}/ask-question`} type="website" />
      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qna_categories} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1a1f2e] to-[#2a3142] py-8 sm:py-10 lg:py-14">
        <div className="container max-w-[1260px] mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <HelpCircle size={36} className="sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#10b981] mx-auto mb-3 sm:mb-4" />
            <h1 className="page-title text-white mb-2 sm:mb-3">Ask a Question</h1>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto">Submit your Islamic questions for authentic guidance from Sheikh Assim Al Hakeem</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-10 lg:py-14 bg-gray-50">
        <div className="container max-w-[1260px] mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Info */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-5">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="bg-amber-50 border-l-4 border-amber-500 p-4 sm:p-5 rounded-lg sm:rounded-xl">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle size={18} className="sm:w-5 sm:h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800 text-sm sm:text-base mb-1 sm:mb-2">Important Notice</p>
                    <p className="text-amber-700 text-xs sm:text-sm leading-relaxed">
                      Assalamu alaikum,<br /><br />
                      NEW TIMING: <strong>6 P.M (Makkah Time)</strong> until quota finishes.<br />
                      Saturday is our day off.<br />
                      Jazakum Allahu Khairan (ADMIN)
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-[#1a1f2e] mb-2 sm:mb-3">Counselling Sessions</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Need marriage counseling or one-to-one live counseling with Sheikh Assim?</p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <a href="mailto:sheikhassim.bookings@gmail.com" className="flex items-center gap-2 text-[#10b981] hover:underline break-all"><Mail size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />sheikhassim.bookings@gmail.com</a>
                  <p className="flex items-center gap-2 text-gray-700"><DollarSign size={14} className="sm:w-4 sm:h-4 text-[#10b981]" />$100 / Half Hour</p>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5 text-white">
                <h3 className="text-white text-base sm:text-lg font-bold mb-2 sm:mb-3">Donate for the Needy</h3>
                <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4">Help a brother/sister in need who cannot afford counseling.</p>
                <div className="bg-white/10 text-white rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm space-y-1">
                  <p className="font-medium text-white">Assim Al Alhakeem</p>
                  <p className="text-white text-sm">Contact: sheikhassim.bookings@gmail.com</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1f2e] mb-4 sm:mb-6">Submit Your Question</h2>

                {submitted && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs sm:text-sm">
                    Your question has been submitted successfully!
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Your Name</label>
                      <div className="relative">
                        {/* <User size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" /> */}
                        <input type="text" name="name" value={formValues.name} onChange={handleChange}
                          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] text-sm" placeholder="Your name" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <div className="relative">
                        {/* <Mail size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" /> */}
                        <input type="email" name="email" value={formValues.email} onChange={handleChange}
                          className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] text-sm" placeholder="your@email.com" required />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Your Question</label>
                    <textarea name="question" value={formValues.question} onChange={handleChange} rows="5"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] resize-none text-sm" placeholder="Type your question here..." required />
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg shadow-[#10b981]/25 hover:shadow-xl hover:shadow-[#10b981]/30 transition-all flex items-center justify-center gap-2">
                    <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Submit Question</span>
                  </motion.button>
                </form>

                <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Share this page</p>
                  <button onClick={handleCopyLink}
                    className={`inline-flex items-center gap-1.5 sm:gap-2 transition-colors text-xs sm:text-sm font-medium py-2 px-3 rounded-lg ${copiedShare ? 'bg-[#10b981] text-white' : 'text-[#10b981] hover:bg-[#10b981]/5'}`}
                    title={copiedShare ? 'Copied to clipboard!' : 'Copy link to clipboard'}
                    aria-label={copiedShare ? 'Copied to clipboard!' : 'Copy link to clipboard'}
                  >
                    {copiedShare ? (
                      <>
                        <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
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