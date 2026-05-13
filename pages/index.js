import {
  getHomeLectures,
  getOptHomeQuotes,
  getHomeArticles,
  getAllPlaylists2,
  getHomeBooks,
  getHomeQna,
  getQnaByLimit,
  getHeaderLectures,
  getAllQnaCategory,
} from "../lib/fetch";

import Meta from "../components/meta";
import Header2 from "../components/header1";
import HeroBanner from "../components/home/hero-banner";
import RecentLecturesEnhanced from "../components/home/recent-lectures-enhanced";
import FeaturedBooks from "../components/home/featured-books";
import ArticlesSection from "../components/home/articles-enhanced";
import RecentQnaEnhanced from "../components/home/recent-qna-enhanced";
import QASection from "../components/home/qa-section";
import CounsellingCTA from "../components/home/counselling-cta";
import TestimonialsSection from "../components/home/testimonials-section";
import NewsletterSection from "../components/home/newsletter-section";
import AboutPreview from "../components/home/about-preview";
import AskQuestionCounselling from "../components/home/askquestion-counselling";

export default function Home({
  lectures = null,
  headerLectures = null,
  quotes = [],
  articles = [],
  playlists = [],
  books = [],
  qna = [],
  qna_categories = [],
}) {
  return (
    <>
      <Meta
        title="Sheikh Assim Al Hakeem - Official Website"
        description="Sheikh Assim bin Luqman al-Hakeem is a prominent Islamic scholar providing authentic Islamic knowledge through lectures, books, articles, and Q&A sessions."
        url="https://assimalhakeem.com"
        image="/img/og-image.jpg"
        type="website"
      />

      <Header2
        playlists={playlists}
        lectures={headerLectures}
        qna_categories={qna_categories}
      />

      <main className="overflow-x-hidden">
        {/* Hero Banner - Dark Background */}
        <HeroBanner />

        {/* Recent Lectures - Light Gray Background */}
        <RecentLecturesEnhanced lectures={lectures} />

        {/* Articles Section - Light Gray Background */}
        <ArticlesSection articles={articles} />
        
        {/* About Preview - White Background */}
        <AboutPreview />

        {/* Featured Books - Light Gray Background */}
        <FeaturedBooks books={books} />

        {/* Recent Q&A - Light Green Background */}
        <RecentQnaEnhanced qna={qna} />

        {/* Q&A and Counselling - Distinct Light Blue Background */}
        <section className="py-12 lg:py-20 bg-gradient-to-br from-[#eef2ff] via-[#f7f7fe] to-white">
          <div className="container max-w-[1260px] mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <QASection qna={qna} />
              <CounsellingCTA />
            </div>
          </div>
        </section>

        {/* Testimonials - White Background */}
        <TestimonialsSection />

        {/* Newsletter - Accent Gradient Background */}
        <NewsletterSection />
      </main>
    </>
  );
}

export async function getStaticProps(context) {
  try {
    const [
      lectures,
      headerLectures,
      quotes,
      articles,
      playlistsData,
      books,
      qna,
      qnaFallback,
      qna_categories,
    ] = await Promise.all([
      getHomeLectures().catch(() => null),
      getHeaderLectures().catch(() => null),
      getOptHomeQuotes().catch(() => []),
      getHomeArticles().catch(() => []),
      getAllPlaylists2().catch(() => ({ playlists: [], playlistsTitle: {} })),
      getHomeBooks().catch(() => []),
      getQnaByLimit(3).catch(() => []),
      getQnaByLimit(3).catch(() => []),
      getAllQnaCategory().catch(() => []),
    ]);

    return {
      props: {
        lectures: lectures || null,
        headerLectures: headerLectures || null,
        quotes: quotes || [],
        articles: articles || [],
        playlists: playlistsData?.playlists || [],
        books: books || [],
        qna: (qna && qna.length ? qna : qnaFallback) || [],
        qna_categories: qna_categories || [],
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      props: {
        lectures: null,
        headerLectures: null,
        quotes: [],
        articles: [],
        playlists: [],
        books: [],
        qna: [],
        qna_categories: [],
      },
      revalidate: 60,
    };
  }
}
