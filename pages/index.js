import {
  getHomeLectures,
  getOptHomeQuotes,
  getHomeArticles,
  getAllPlaylists2,
  getHomeBooks,
  getQnaByLimit,
  getHeaderLectures,
  getAllQnaCategory,
  getQnaOverview,
} from "../lib/fetch";

import Meta from "../components/meta";
import Header2 from "../components/header1";
import HeroBanner from "../components/home/hero-banner";
import QuickAccess from "../components/home/quick-access";
import RecentLecturesEnhanced from "../components/home/recent-lectures-enhanced";
import RecentQnaEnhanced from "../components/home/recent-qna-enhanced";
import AboutPreview from "../components/home/about-preview";
import FeaturedBooks from "../components/home/featured-books";
import ArticlesSection from "../components/home/articles-enhanced";
import CounsellingCTA from "../components/home/counselling-cta";

export default function Home({
  lectures = null,
  headerLectures = null,
  articles = [],
  playlists = [],
  books = [],
  qna = [],
  qna_categories = [],
  qnaOverview = { totalAnswers: 0, totalTopics: 0, topTopics: [] },
}) {
  return (
    <>
      <Meta
        title="Sheikh Assim Al Hakeem - Official Website"
        description="Sheikh Assim bin Luqman al-Hakeem is a prominent Islamic scholar providing authentic Islamic knowledge through lectures, books, articles, and Q&A sessions."
        url="https://assimalhakeem.com"
        image="/img/id/default_share.jpeg"
        type="website"
      />

      <Header2
        playlists={playlists}
        lectures={headerLectures}
        qna_categories={qna_categories}
      />

      <main className="overflow-x-hidden">
        <HeroBanner totalAnswers={qnaOverview.totalAnswers} totalTopics={qnaOverview.totalTopics} />
        <QuickAccess totalAnswers={qnaOverview.totalAnswers} totalTopics={qnaOverview.totalTopics} />
        <RecentLecturesEnhanced lectures={lectures} />
        <RecentQnaEnhanced
          qna={qna}
          topics={qnaOverview.topTopics}
          totalAnswers={qnaOverview.totalAnswers}
          totalTopics={qnaOverview.totalTopics}
        />
        <AboutPreview />
        <FeaturedBooks books={books} />
        <ArticlesSection articles={articles} />
        <CounsellingCTA />
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
      qnaOverview,
    ] = await Promise.all([
      getHomeLectures().catch(() => null),
      getHeaderLectures().catch(() => null),
      getOptHomeQuotes().catch(() => []),
      getHomeArticles().catch(() => []),
      getAllPlaylists2().catch(() => ({ playlists: [], playlistsTitle: {} })),
      getHomeBooks().catch(() => []),
      getQnaByLimit(4).catch(() => []),
      getQnaByLimit(4).catch(() => []),
      getAllQnaCategory().catch(() => []),
      getQnaOverview(6).catch(() => null),
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
        qnaOverview: qnaOverview || { totalAnswers: 0, totalTopics: 0, topTopics: [] },
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
        qnaOverview: { totalAnswers: 0, totalTopics: 0, topTopics: [] },
      },
      revalidate: 60,
    };
  }
}
