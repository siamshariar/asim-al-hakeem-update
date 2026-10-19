import { useRouter } from 'next/router';
import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { server } from "../../../lib/config";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory, getQnaByLimit } from "../../../lib/fetch";
import Meta from "../../../components/meta";
import Header2 from "../../../components/header1";
import Link from "next/link";
import { MessageCircle, Folder, User, FolderOpen, Search, X, ArrowRight, HelpCircle } from "lucide-react";
import PageHero from "../../../components/page-hero";
import ShareLinks from "../../../components/share-links";
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
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  const fromCategory = typeof router.query.from === "string"
    ? router.query.from
    : typeof router.query.category === "string"
      ? router.query.category
      : "";

  // Ensure the answer page always opens at the top (run before paint)
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    let previousScrollRestoration = null;
    if ("scrollRestoration" in window.history) {
      previousScrollRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
    }
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    // Direct jump to top to avoid smooth scrolling
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    return () => {
      document.documentElement.style.scrollBehavior = previousBehavior;
      if (previousScrollRestoration !== null && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  if (router.isFallback) {
    return (
      <section className="ah ah-error">
        <div className="ah-wrap">
          <div className="ah-loading" role="status">
            <span className="ah-spinner" aria-hidden="true" />
            Loading...
          </div>
        </div>
      </section>
    );
  }

  if (!answer) {
    return (
      <>
        <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />
        <section className="ah ah-error">
          <div className="ah-wrap">
            <MessageCircle size={44} aria-hidden="true" style={{ margin: "0 auto", color: "var(--ah-crimson)" }} />
            <h1>Answer not found</h1>
            <p>The answer you're looking for doesn't exist or has been removed.</p>
            <div className="ah-actions">
              <Link href="/qna" className="ah-btn ah-btn--primary">Back to Q&amp;A</Link>
            </div>
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

  // Handle back navigation with router
  const handleBackNavigation = (e, url) => {
    e.preventDefault();
    const canUseBrowserBack = typeof window !== "undefined" && !!sessionStorage.getItem("qna_scroll_state");

    // Store that we want to restore scroll position
    if (typeof window !== "undefined") {
      sessionStorage.setItem("qna_scroll_restore", "true");
    }

    if (canUseBrowserBack && window.history.length > 1) {
      router.back();
      return;
    }

    // Fallback for direct visits or when history back is unavailable.
    router.push(url, undefined, { scroll: false });
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

  const crumbs = [{ label: "Q&A", href: "/qna", onClick: (e) => handleBackNavigation(e, "/qna") }];
  if (category) {
    crumbs.push({ label: category.title, href: `/qna/${category.slug}`, onClick: (e) => handleBackNavigation(e, `/qna/${category.slug}`) });
  }
  crumbs.push({ label: "Answer" });

  return (
    <>
      <Meta
        title={`${answer.question} - Sheikh Assim Al Hakeem`}
        description={answer.answer.substring(0, 160) + '...'}
        url={shareUrl}
        type="article"
      />

      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />

      <PageHero
        eyebrow="Question"
        title={answer.question}
        longTitle
        breadcrumbs={crumbs}
      >
        <div className="ah-meta">
          <span><Folder size={16} aria-hidden="true" />{category?.title || 'General'}</span>
          <span><User size={16} aria-hidden="true" />Answered by Sheikh Assim Al Hakeem</span>
        </div>
      </PageHero>

      <section className="ah ah-page">
        <div className="ah-wrap ah-layout">
          <article className="ah-card">
            <p className="ah-answer__label"><MessageCircle size={16} aria-hidden="true" />Answer</p>

            {audioUrls.length > 0 && (
              <div className="ah-media">
                {audioUrls.map((src) => (
                  <audio key={src} controls preload="none">
                    <source src={src} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                ))}
              </div>
            )}

            <div className="ah-prose">
              {prominentAnswerLine && <p className="ah-answer__lead">{prominentAnswerLine}</p>}
              {remainingAnswerText && <p className="ah-answer__more">{remainingAnswerText}</p>}
            </div>

            {uniqueVideoSources.length > 0 && (
              <div className="ah-media">
                {uniqueVideoSources.map((src, idx) => (
                  <iframe
                    key={src}
                    src={src}
                    title={`${answer.question} - Video ${idx + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            {(metaText || citationText) && (
              <div className="ah-answer__meta">
                {metaText && metaText.split('\n').filter(Boolean).map((line) => <p key={line}>{line}</p>)}
                {citationText && <p style={{ whiteSpace: "pre-line" }}>{citationText}</p>}
              </div>
            )}

            <div className="ah-footnote" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
              <ShareLinks url={sharePageUrl} title={answer.question} label="Share this answer" />
              <a href={backUrl} onClick={(e) => handleBackNavigation(e, backUrl)} className="ah-link">
                Back to questions <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </article>

          <aside className="ah-aside" aria-label="More">
            <div className="ah-box ah-ask">
              <h3>Have a question?</h3>
              <p className="ah-ask__note">Submit your question for guidance from Sheikh Assim Al Hakeem. Questions open daily at 6 p.m. Makkah time.</p>
              <Link href="/ask-question" className="ah-btn ah-btn--white"><HelpCircle size={17} aria-hidden="true" />Ask a Question</Link>
            </div>

            <div className="ah-cat-box">
              <div className="ah-cat-box__head">
                <h3>Categories</h3>
                <p>{visibleCategories.length} categories</p>
                <div className="ah-search">
                  <Search size={15} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search categories"
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="ah-input"
                    aria-label="Search categories"
                  />
                  {categorySearchTerm && (
                    <button type="button" onClick={() => setCategorySearchTerm("")} className="ah-search__clear" aria-label="Clear category search">
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <div className="ah-cat-list" style={{ maxHeight: 420 }}>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/qna/${cat.slug}`}
                      className={`ah-cat-item${cat.slug === answer.cat_slug ? " is-active" : ""}`}
                      aria-current={cat.slug === answer.cat_slug ? "true" : undefined}
                    >
                      <FolderOpen size={15} aria-hidden="true" />
                      <span>{cat.title}</span>
                    </Link>
                  ))
                ) : (
                  <p className="ah-end-note">No categories found</p>
                )}
              </div>
              <div className="ah-cat-box__foot">
                <Link href="/qna" className="ah-link">View all questions <ArrowRight size={16} aria-hidden="true" /></Link>
              </div>
            </div>
          </aside>
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