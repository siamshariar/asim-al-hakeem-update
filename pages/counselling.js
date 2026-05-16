import { useState, useEffect, useRef } from 'react';
import { server } from "../lib/config";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory } from "../lib/fetch";
import Meta from "../components/meta";
import Header2 from "../components/header1";
import PageHero from "../components/page-hero";
import { motion } from "framer-motion";
import { Mail, Send, Calendar, Clock, User, Phone, DollarSign, Heart, Share2, CheckCircle, Copy } from 'lucide-react';

export default function CounsellingSession({ playlists, headerLectures, qna_categories }) {
  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);
  const shareTimeoutRef = useRef(null);

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
  const [copiedShare, setCopiedShare] = useState(false);

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
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedShare(true);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setCopiedShare(false), 2000);
    }).catch(() => {
      alert('Failed to copy link. Please try again.');
    });
  };

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
        title="Counselling Session"
        subtitle="One-to-one Live Counseling with Sheikh Assim Al-Hakeem via Skype, FaceTime, or Phone Call"
        Icon={Calendar}
      />

      <section className="py-8 sm:py-10 lg:py-14 bg-gray-50">
        <div className="container max-w-[1260px] mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Info Cards */}
            <div className="lg:col-span-1 space-y-4 sm:space-y-5 lg:space-y-6">
              {/* About Session */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-[#10b981]/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <User size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#10b981]" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1a1f2e]">About the Session</h2>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Need Marriage Counseling? Or any other one-to-one Live Counseling with Sheikh Assim Al-Hakeem? 
                  Get personalized Islamic guidance from one of the most trusted scholars.
                </p>
              </motion.div>

              {/* Session Details */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 bg-[#10b981]/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Clock size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#10b981]" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#1a1f2e]">Session Details</h2>
                </div>
                <ul className="space-y-2 sm:space-y-3 text-gray-600">
                  <li className="flex items-center gap-2 text-xs sm:text-sm">
                    <Clock size={14} className="sm:w-4 sm:h-4 text-[#10b981] flex-shrink-0" />
                    <span>Duration: 30 Minutes</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm">
                    <DollarSign size={14} className="sm:w-4 sm:h-4 text-[#10b981] flex-shrink-0" />
                    <span>Fee: $100 / Half Hour</span>
                  </li>
                  <li className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar size={14} className="sm:w-4 sm:h-4 text-[#10b981] flex-shrink-0" />
                    <span>Flexible Scheduling</span>
                  </li>
                </ul>
              </motion.div>

              {/* Donation Card */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 lg:p-6 text-white">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Heart size={20} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  <h2 className="text-white text-lg sm:text-xl font-bold">Donate for the Needy</h2>
                </div>
                <p className="text-white/90 text-xs sm:text-sm mb-3 sm:mb-4">
                  Help a brother/sister in need who cannot afford counseling for marital issues, OCD, Waswas, and more.
                </p>
                <div className="bg-white/10 text-white rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm space-y-1">
                  <p className="font-medium text-white">Assim Al Alhakeem</p>
                  <p className="text-white text-sm">Contact: sheikhassim.bookings@gmail.com</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a1f2e] mb-4 sm:mb-6">Book Your Session</h2>
                
                {submissionSuccess && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl flex items-center gap-2 sm:gap-3 text-green-700 text-xs sm:text-sm">
                    <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px] flex-shrink-0" />
                    <span>Your booking request has been submitted! We'll contact you shortly.</span>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" name="fullname" value={formValues.fullname} onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all text-sm
                          ${errors.fullname ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#10b981]/20 focus:border-[#10b981]'}`}
                        placeholder="Your full name" />
                      {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" name="email" value={formValues.email} onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all text-sm
                          ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#10b981]/20 focus:border-[#10b981]'}`}
                        placeholder="your@email.com" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                    <input type="tel" name="phone" value={formValues.phone} onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] text-sm"
                      placeholder="+966 XX XXX XXXX" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
                      <input type="date" name="date" ref={dateInputRef} value={formValues.date} onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all cursor-pointer text-sm
                          ${errors.date ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#10b981]/20 focus:border-[#10b981]'}`} />
                      {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Preferred Time *</label>
                      <input type="time" name="time" ref={timeInputRef} value={formValues.time} onChange={handleChange}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 transition-all cursor-pointer text-sm
                          ${errors.time ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-[#10b981]/20 focus:border-[#10b981]'}`} />
                      {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                    <textarea name="message" value={formValues.message} onChange={handleChange} rows="3"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] resize-none text-sm"
                      placeholder="Briefly describe what you'd like to discuss..." />
                  </div>

                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-lg shadow-[#10b981]/25 hover:shadow-xl hover:shadow-[#10b981]/30 transition-all flex items-center justify-center gap-2">
                    <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Submit Booking Request</span>
                  </motion.button>
                </form>

                {/* Share Section */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">Share this counseling session page</p>
                  <div className="flex gap-2 sm:gap-3">
                    <motion.a 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 sm:p-2.5 bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90 inline-flex items-center justify-center"
                      style={{ color: 'white', outline: 'none' }}
                      title="Share on Facebook"
                      aria-label="Share on Facebook"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </motion.a>
                    <motion.a 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this counseling session booking with Sheikh Assim Al-Hakeem!')}&via=AssimAlHakeem`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 sm:p-2.5 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1DA1F2]/90 inline-flex items-center justify-center"
                      style={{ color: 'white', outline: 'none' }}
                      title="Share on Twitter"
                      aria-label="Share on Twitter"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="white" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
                    </motion.a>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyLink}
                      className={`p-2 sm:p-2.5 rounded-lg inline-flex items-center justify-center ${copiedShare ? 'bg-green-500' : 'bg-[#10b981] hover:bg-[#059669]'}`}
                      style={{ color: 'white', outline: 'none', border: 'none', cursor: 'pointer' }}
                      title={copiedShare ? 'Copied to clipboard!' : 'Copy link to clipboard'}
                      aria-label={copiedShare ? 'Copied to clipboard!' : 'Copy link to clipboard'}
                    >
                      {copiedShare ? (
                        <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px] !text-white" />
                      ) : (
                        <Copy size={16} className="sm:w-[18px] sm:h-[18px] !text-white" />
                      )}
                    </motion.button>
                  </div>
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
