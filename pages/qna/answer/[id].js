import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';
import { server } from "../../../lib/config";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory, getQnaByLimit } from "../../../lib/fetch";
import Meta from "../../../components/meta";
import Header2 from "../../../components/header1";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Share2, Calendar, Folder, ChevronRight, CheckCircle, Copy, FolderOpen, Search, X } from "lucide-react";
import { getAnsById } from "../../../lib/fetch";


const LAST_QNA_CATEGORY_KEY = "qna_last_category";

const toYoutubeEmbedUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.includes("youtube.com/embed/")) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/i);
  if (watchMatch?.[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/i);
  if (shortMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return "";
};

export default function QnaAnswerDetail({ answer, playlists, headerLectures, qnaCategories }) {
  const router = useRouter();
  const [copiedShare, setCopiedShare] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const shareTimeoutRef = useRef(null);

  const fromCategory = typeof router.query.from === "string"
    ? router.query.from
    : typeof router.query.category === "string"
      ? router.query.category
      : "";

  // Cleanup share timeout on unmount
  useEffect(() => {
    return () => {
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    };
  }, []);

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!answer) {
    return (
      <>
        <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />
        <section className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <MessageCircle size={40} className="sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a1f2e] mb-2">Answer Not Found</h1>
            <p className="text-sm sm:text-base text-gray-500 mb-6">The answer you're looking for doesn't exist or has been removed.</p>
            <Link href="/qna" className="inline-block px-5 sm:px-6 py-2.5 sm:py-3 bg-[#10b981] text-white rounded-full text-sm sm:text-base font-medium hover:bg-[#059669] transition-colors">
              Back to Q&A
            </Link>
          </div>
        </section>
      </>
    );
  }

  const categorySlug = answer.cat_slug || answer.category_slug || "all";
  const storedCategory = typeof window !== "undefined" ? window.sessionStorage.getItem(LAST_QNA_CATEGORY_KEY) : "";
  const sourceCategory = fromCategory || storedCategory || categorySlug;
  const backCategory = sourceCategory && sourceCategory !== "all" ? sourceCategory : "";
  const backUrl = backCategory ? `/qna/${backCategory}` : `/qna`;
  const category = qnaCategories?.find(cat => cat.slug === categorySlug);
  const shareUrl = `${server}/qna/answer/${answer.id}`;
  const sharePageUrl = `${server}/qna/answer/${answer.id}`;
  const normalizeEmbedUrl = (value) => {
    if (!value) return "";
    return String(value).trim().replace(/[?#].*$/, "");
  };

  const stripTrailingNumericNoise = (value) => {
    const tokens = String(value || "").trim().split(/\s+/).filter(Boolean);

    while (tokens.length > 0 && /^[+-]?\d+$/.test(tokens[tokens.length - 1])) {
      tokens.pop();
    }

    return tokens.join(" ").trim();
  };

  const videoSources = [
    ...(Array.isArray(answer.youtube_videos)
      ? answer.youtube_videos.map((video) => video?.embed_url || toYoutubeEmbedUrl(video?.url || video?.video_url || video?.link)).filter(Boolean)
      : []),
    toYoutubeEmbedUrl(answer.embed_url),
    toYoutubeEmbedUrl(answer.video),
    toYoutubeEmbedUrl(answer.video_url),
  ].filter(Boolean);
  const uniqueVideoSources = [...new Map(videoSources.map((src) => [normalizeEmbedUrl(src), normalizeEmbedUrl(src)])).values()].filter(Boolean);

  // Prepare sanitized answer text (remove any embedded question repetitions and strip HTML)
  const rawAnswerContent = answer.answer || answer.content || "";
  let sanitizedAnswerText = String(rawAnswerContent || "");
  try {
    // Remove raw URL lines from the visible text so audio links never appear in the answer body.
    sanitizedAnswerText = sanitizedAnswerText.replace(/https?:\/\/[^\s'"<>]+/gi, "");
    // Remove CTA and boilerplate text
    sanitizedAnswerText = sanitizedAnswerText.replace(/Need One to One live Counseling with Sheikh Assim[^.]*\.?/gi, "");
    sanitizedAnswerText = sanitizedAnswerText.replace(/Do you have a question[^?]*\??/gi, "");
    sanitizedAnswerText = sanitizedAnswerText.replace(/Ask a Question[^.]*\.?/gi, "");
    sanitizedAnswerText = sanitizedAnswerText.replace(/Submit your question[^.]*\.?/gi, "");
    // Remove recurring boilerplate fragments that should not be shown as answer text.
    sanitizedAnswerText = sanitizedAnswerText.replace(/\bthe website itself, this seems permissible\.?/gi, "");
    // Remove any iframe blocks (we render videos separately)
    sanitizedAnswerText = sanitizedAnswerText.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
    // Remove the question text if it appears inside the answer
    if (answer.question) {
      const qEsc = answer.question.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      sanitizedAnswerText = sanitizedAnswerText.replace(new RegExp(qEsc, 'gi'), '');
    }
    // Strip remaining HTML tags
    sanitizedAnswerText = sanitizedAnswerText.replace(/<[^>]+>/g, '');
    // Collapse whitespace and preserve newlines
    sanitizedAnswerText = sanitizedAnswerText.replace(/[\t\r]+/g, ' ').replace(/\n{2,}/g, '\n').replace(/ {2,}/g, ' ').trim();
  } catch (e) {
    sanitizedAnswerText = String(rawAnswerContent || "");
  }

  // Split sanitized answer into normal text and citation/meta text.
  const answerLines = sanitizedAnswerText
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const citationLinePatterns = [
    /^QUESTION:?$/i,
    /^QUESTION:\s*/i,
    /\|\s*[A-Za-z]+\s+\d{1,2},\s+\d{4}/,
  ];
  const citationLines = [];
  const metaLines = [];
  const contentLines = [];
  const noisyLinePatterns = [
    /^\d+\s*[+\-]\s*\d+/,
    /^\d+(\s+[+\-]\s*\d+)+$/,
    /^Views?$/i,
    /^Tags?:\s*/i,
    /^Category:\s*/i,
    /^\.?video-toolbar-item\./i,
  ];

  const pushMetaPair = (line) => {
    const categoryMatch = line.match(/Category:\s*([^]+?)(?:\s+Tags?:|$)/i);
    const tagsMatch = line.match(/Tags?:\s*(.+?)(?:\s+[\d\s+\-]+$|$)/i);

    if (categoryMatch?.[1]) {
      const categoryText = stripTrailingNumericNoise(categoryMatch[1].replace(/\s+/g, " ")).replace(/[,;\s]+$/g, "");
      if (categoryText) metaLines.push(`Category: ${categoryText}`);
    }

    if (tagsMatch?.[1]) {
      const tagsText = stripTrailingNumericNoise(tagsMatch[1].replace(/\s+/g, " ")).replace(/[,;\s]+$/g, "");
      if (tagsText) metaLines.push(`Tags: ${tagsText}`);
    }
  };

  answerLines.forEach((line) => {
    if (citationLinePatterns.some((pattern) => pattern.test(line))) {
      const cleanedLine = line.replace(/^QUESTION:\s*/i, "").trim();
      if (cleanedLine) citationLines.push(cleanedLine);
      return;
    }
    if (/^Category:\s*/i.test(line) && /\bTags?:\s*/i.test(line)) {
      pushMetaPair(line);
      return;
    }
    if (noisyLinePatterns.some((pattern) => pattern.test(line))) {
      const cleanedMeta = line
        .replace(/\s{2,}/g, " ")
        .replace(/^Category:\s*/i, "Category: ")
        .replace(/^Tags?:\s*/i, "Tags: ")
        .trim();

      if (cleanedMeta.startsWith("Category:") || cleanedMeta.startsWith("Tags:")) {
        const [label, ...rest] = cleanedMeta.split(":");
        const cleanedValue = stripTrailingNumericNoise(rest.join(":").trim()).replace(/[,;\s]+$/g, "");
        if (cleanedValue) {
          metaLines.push(`${label}: ${cleanedValue}`);
        }
      }
      return;
    }
    contentLines.push(line);
  });
  const prominentAnswerLine = contentLines.length ? contentLines[0] : "";
  const remainingAnswerText = contentLines.length > 1 ? contentLines.slice(1).join('\n\n') : "";
  const citationText = citationLines.join('\n');
  const metaText = metaLines.join('\n');

  const getCanonicalAudioUrl = (value) => {
    if (!value) return "";
    return String(value).trim().replace(/[?#].*$/, "");
  };

  // Extract MP3 links from content or audio fields and dedupe by base URL.
  const audioUrlMap = new Map();
  const addAudioUrl = (value) => {
    const canonicalUrl = getCanonicalAudioUrl(value);
    if (!canonicalUrl || !/\.mp3$/i.test(canonicalUrl)) return;
    if (!audioUrlMap.has(canonicalUrl)) {
      audioUrlMap.set(canonicalUrl, canonicalUrl);
    }
  };
  try {
    const mp3Regex = /https?:\/\/[^\s'"<>]+\.mp3[^\s'"<>]*/gi;
    let match;
    while ((match = mp3Regex.exec(rawAnswerContent))) {
      addAudioUrl(match[0]);
    }
    if (Array.isArray(answer.audio_files)) {
      answer.audio_files.forEach((audioFile) => {
        if (!audioFile) return;
        if (typeof audioFile === 'string') addAudioUrl(audioFile);
        if (audioFile.url) addAudioUrl(audioFile.url);
      });
    }
    if (answer.audio_url) addAudioUrl(answer.audio_url);
  } catch (e) {
    // ignore
  }
  const audioUrls = [...audioUrlMap.values()];

  const handleCopyLink = () => {
    const currentUrl = typeof window !== "undefined"
      ? window.location.href
      : `${server}/qna/answer/${answer.id}`;

    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedShare(true);
      if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
      shareTimeoutRef.current = setTimeout(() => setCopiedShare(false), 2000);
    }).catch(() => {
      alert('Failed to copy link. Please try again.');
    });
  };

  // Handle back navigation with router
  const handleBackNavigation = (e, url) => {
    e.preventDefault();
    // Store that we want to restore scroll position
    if (typeof window !== "undefined") {
      sessionStorage.setItem("qna_scroll_restore", "true");
    }
    // Use router.push for client-side navigation
    router.push(url);
  };

  // Filter categories for display
  const EXCLUDE_SLUGS = ["books", "videos", "articles", "audios"];
  const visibleCategories = qnaCategories?.filter(c => c.slug !== 'all' && !EXCLUDE_SLUGS.includes(c.slug)) || [];
  
  const filteredCategories = categorySearchTerm.trim() 
    ? visibleCategories.filter(cat => 
        cat.title.toLowerCase().includes(categorySearchTerm.toLowerCase()) || 
        cat.slug.toLowerCase().includes(categorySearchTerm.toLowerCase())
      )
    : visibleCategories;

  return (
    <>
      <style jsx global>{`
        .category-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .category-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .category-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .category-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>

      <Meta
        title={`${answer.question} - Sheikh Assim Al Hakeem`}
        description={answer.answer.substring(0, 160) + '...'}
        url={shareUrl}
        type="article"
      />

      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#24334d] via-[#2b3f5e] to-[#334a6b] py-8 sm:py-10 lg:py-12">
        <div className="container max-w-[1000px] mx-auto px-4">
          <a 
            href={backUrl}
            onClick={(e) => handleBackNavigation(e, backUrl)}
            className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-300 hover:text-white mb-3 sm:mb-4 transition-colors text-sm sm:text-base cursor-pointer"
          >
            <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Back to Q&A
          </a>
          {category && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-3 sm:mb-4 flex-wrap">
              <a 
                href={`/qna`}
                onClick={(e) => handleBackNavigation(e, `/qna`)}
                className="text-gray-400 hover:text-white focus:outline-none focus:ring-0 focus:border-transparent cursor-pointer"
              >
                Q&A
              </a>
              <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500" />
              <a 
                href={`/qna/${category.slug}`}
                onClick={(e) => handleBackNavigation(e, `/qna/${category.slug}`)}
                className="text-[#10b981] hover:text-[#34d399] focus:outline-none focus:ring-0 focus:border-transparent cursor-pointer"
              >
                {category.title}
              </a>
            </div>
          )}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <MessageCircle size={32} className="sm:w-9 sm:h-9 text-[#34d399] mb-3" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
              {answer.question}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Answer Content */}
      <section className="py-8 sm:py-10 lg:py-14 bg-gray-50">
        <div className="container max-w-[1000px] mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-5 sm:p-6 lg:p-8">
                  <div className="mb-6">
                    <img
                      src="/img/qna/qna.jpg"
                      alt={answer.question}
                      className="w-full h-56 rounded-lg"
                    />
                  </div>
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6 pb-4 border-b border-gray-100">
                    <span className="flex items-center gap-1">
                      <Folder size={14} className="text-[#10b981]" />
                      {category?.title || 'General'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-[#10b981]" />
                      Answered by Sheikh Assim
                    </span>
                  </div>

                  {/* Question */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MessageCircle size={14} className="sm:w-4 sm:h-4 text-[#10b981]" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-semibold text-[#1a1f2e] mb-2">Question:</h2>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{answer.question}</p>
                      </div>
                    </div>
                  </div>

                  {/* Answer */}
                  <div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#059669] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs sm:text-sm font-bold">A</span>
                      </div>
                      <div className="w-full">
                        <h2 className="text-base sm:text-lg font-semibold text-[#1a1f2e] mb-2">Answer:</h2>
                        {audioUrls.length > 0 && (
                          <div className="mb-4 space-y-3">
                            {audioUrls.map((src) => (
                              <audio key={src} controls className="w-full">
                                <source src={src} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            ))}
                          </div>
                        )}
                        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mt-3">
                          {prominentAnswerLine && (
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{prominentAnswerLine}</p>
                          )}
                          {remainingAnswerText && (
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line mt-2">{remainingAnswerText}</p>
                          )}
                        </div>

                        {uniqueVideoSources.length > 0 && (
                          <div className="mt-4 space-y-4">
                            {uniqueVideoSources.map((src, idx) => (
                              <div key={src} className="w-full">
                                <iframe
                                  src={src}
                                  title={`${answer.question} - Video ${idx + 1}`}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full rounded-xl"
                                  style={{ aspectRatio: '16/9', minHeight: '300px' }}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {metaText && (
                          <div className="mt-8 sm:mt-10 space-y-1.5">
                            {metaText.split('\n').filter(Boolean).map((line) => (
                              <p
                                key={line}
                                className="text-xs sm:text-sm text-gray-500 leading-relaxed"
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        )}

                        {citationText && (
                          <div className="mt-4">
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-line">{citationText}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Share */}
                  <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100">
                    <p className="text-xs sm:text-sm text-gray-500 mb-3">Share this answer</p>
                    <div className="flex gap-2 sm:gap-3">
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}&quote=${encodeURIComponent(answer.question || "Sheikh Assim Al Hakeem Q&A")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:p-2.5 bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90 inline-flex items-center justify-center"
                        style={{ color: 'white', outline: 'none' }}
                        title="Share on Facebook"
                        aria-label="Share on Facebook"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="white" viewBox="0 0 24 24">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                        </svg>
                      </motion.a>
                      <motion.a 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(answer.question + ' - Answered by Sheikh Assim Al-Hakeem')}&via=AssimAlHakeem`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:p-2.5 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1DA1F2]/90 inline-flex items-center justify-center"
                        style={{ color: 'white', outline: 'none' }}
                        title="Share on Twitter"
                        aria-label="Share on Twitter"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="white" viewBox="0 0 24 24">
                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                        </svg>
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
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Updated UI */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.1 }}
                className="space-y-5 sm:space-y-6"
              >
                {/* Ask Question CTA */}
                <div className="bg-gradient-to-br from-[#10b981] to-[#059669] rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-6 text-white">
                  <h3 className="text-white text-base sm:text-lg font-bold mb-2">Have a Question?</h3>
                  <p className="text-white/90 text-xs sm:text-sm mb-4">
                    Submit your question to get authentic Islamic guidance from Sheikh Assim Al Hakeem.
                  </p>
                  <Link 
                    href="/ask-question"
                    className="inline-block w-full text-center py-2 sm:py-2.5 bg-white text-[#10b981] rounded-lg text-sm sm:text-base font-medium hover:bg-gray-50 transition-colors"
                  >
                    Ask a Question
                  </Link>
                </div>

                {/* Categories - Updated UI for Web, Mobile, Tablet */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                  {/* Categories Header */}
                  <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-[#f0fdf4] to-white">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                        <FolderOpen size={18} className="text-[#10b981]" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-[#1a1f2e]">Categories</h3>
                        <p className="text-xs text-gray-400">{visibleCategories.length} categories</p>
                      </div>
                    </div>
                    {/* Category Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search categories..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                      />
                      {categorySearchTerm && (
                        <button
                          onClick={() => setCategorySearchTerm("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category List */}
                  <div className="max-h-[400px] sm:max-h-[500px] overflow-y-auto category-scrollbar p-3 sm:p-4 space-y-1">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((cat) => (
                        <Link 
                          key={cat.id} 
                          href={`/qna/${cat.slug}`}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border-0 outline-none
                            ${cat.slug === answer.cat_slug 
                              ? 'bg-[#10b981] text-white shadow-md' 
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                            }`}
                          style={{
                            boxShadow: cat.slug === answer.cat_slug ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                        >
                          <FolderOpen size={14} className={`flex-shrink-0 ${cat.slug === answer.cat_slug ? "text-white" : "text-[#10b981]"}`} />
                          <span className="leading-snug flex-1 break-words">{cat.title}</span>
                          {cat.slug === answer.cat_slug && (
                            <span className="flex-shrink-0 w-1.5 h-1.5 bg-white rounded-full ml-auto" />
                          )}
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-6 text-gray-400">
                        <FolderOpen size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No categories found</p>
                      </div>
                    )}
                  </div>

                  {/* View All Link */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <Link 
                      href="/qna"
                      className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-[#10b981] font-medium hover:text-[#059669] transition-colors"
                    >
                      View All Categories
                      <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                    </Link>
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

export async function getStaticProps({ params }) {
  const { id } = params;
  const answers = await getAnsById(id);
  const answer = answers?.[0] || null;
  const playlists = await getAllPlaylists2();
  const headerLectures = await getHeaderLectures();
  const qnaCategories = await getAllQnaCategory();

  return {
    props: {
      answer,
      playlists: playlists?.playlists || [],
      headerLectures: headerLectures || null,
      qnaCategories: qnaCategories || [],
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const qna = await getQnaByLimit(50);
  
  // Pre-render only the first 50 items to avoid OOM during build
  const paths = qna.map(item => ({
    params: { id: String(item.id) },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}