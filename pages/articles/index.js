import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useRef, useDeferredValue, useCallback } from "react";
import { server } from "../../lib/config";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory, getAllArticles } from "../../lib/fetch";
import Meta from "../../components/meta";
import Header2 from "../../components/header1";
import PageHero from "../../components/page-hero";
import Link from "next/link";
import ArticleCardImage from "../../components/article-card-image";
import { ArrowRight, Search, X } from 'lucide-react';
import { date as formatDate } from "../../lib/format";
import useOnScreen from "../../hooks/useOnScreen";

const ARTICLES_PER_PAGE = 9;

const formatArticleDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatDate(value);
};

export default function Articles({ playlists, headerLectures, qnaCategories, initialArticlesPage }) {
  const router = useRouter();
  const isArticlesPage = router.pathname === '/articles';
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  // Pagination states
  const [loadedPages, setLoadedPages] = useState(
    initialArticlesPage?.articleItems?.length ? [initialArticlesPage.articleItems] : []
  );
  const [currentPage, setCurrentPage] = useState(initialArticlesPage?.currentPage || 1);
  const [totalPages, setTotalPages] = useState(initialArticlesPage?.numberOfPages || 1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const fetchingRef = useRef(false);
  const loadMoreRef = useRef(null);
  const lastLoadTimeRef = useRef(0);
  const searchTimeoutRef = useRef(null);
  const loadingTimeoutRef = useRef(null);
  
  // Force re-trigger by changing key when new data loads
  const [sentinelKey, setSentinelKey] = useState(0);
  
  const isLoadMoreVisible = useOnScreen(loadMoreRef, { 
    rootMargin: '200px', 
    threshold: 0 
  });

  // Get all loaded articles
  const displayedArticles = useMemo(() => {
    return loadedPages.flat().filter(Boolean);
  }, [loadedPages]);

  const hasMoreToLoad = currentPage < totalPages;

  // Search handler
  const performSearch = useCallback(async (searchValue) => {
    // Clear any pending loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    setIsSearching(true);
    setIsLoadingMore(false);
    fetchingRef.current = false;
    lastLoadTimeRef.current = 0;
    
    setLoadedPages([]);
    setCurrentPage(1);
    setTotalPages(1);

    try {
      const result = await getAllArticles({ 
        currentPage: 1, 
        search: searchValue, 
        pageSize: ARTICLES_PER_PAGE 
      });
      
      if (result?.articleItems?.length > 0) {
        setLoadedPages([result.articleItems]);
        setCurrentPage(1);
        setTotalPages(result.numberOfPages || 1);
        // Force sentinel re-trigger
        setSentinelKey(prev => prev + 1);
      } else {
        setLoadedPages([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Search error:", error);
      setLoadedPages([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    // If search is empty, restore initial page (don't treat as a search)
    if (!deferredSearchTerm || deferredSearchTerm.trim() === '') {
      // cancel pending search
      setIsSearching(false);
      setLoadedPages(initialArticlesPage?.articleItems?.length ? [initialArticlesPage.articleItems] : []);
      setCurrentPage(initialArticlesPage?.currentPage || 1);
      setTotalPages(initialArticlesPage?.numberOfPages || 1);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(deferredSearchTerm);
    }, 300);

    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [deferredSearchTerm, performSearch]);

  // Load more articles with 1 second delay
  const loadMoreArticles = useCallback(async () => {
    if (fetchingRef.current || isSearching || isLoadingMore || !hasMoreToLoad) {
      return;
    }

    const now = Date.now();
    if (now - lastLoadTimeRef.current < 1500) {
      return;
    }

    fetchingRef.current = true;
    lastLoadTimeRef.current = now;
    setIsLoadingMore(true);

    try {
      const nextPageNumber = currentPage + 1;
      
      // Fetch data first
      const result = await getAllArticles({ 
        currentPage: nextPageNumber, 
        search: deferredSearchTerm, 
        pageSize: ARTICLES_PER_PAGE 
      });
      
      // Wait 1 second to show loading
      await new Promise(resolve => {
        loadingTimeoutRef.current = setTimeout(resolve, 1000);
      });

      if (result?.articleItems?.length > 0) {
        setLoadedPages((prev) => {
          const existingIds = new Set(prev.flat().map(item => item.slug || item.postSlug));
          const newItems = result.articleItems.filter(item => {
            const id = item.slug || item.postSlug;
            return id && !existingIds.has(id);
          });
          return newItems.length > 0 ? [...prev, newItems] : prev;
        });
        setCurrentPage(result.currentPage || nextPageNumber);
        setTotalPages(result.numberOfPages || totalPages);
        // Force sentinel re-trigger after new data loads
        setSentinelKey(prev => prev + 1);
      } else {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setIsLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [currentPage, totalPages, deferredSearchTerm, hasMoreToLoad, isSearching, isLoadingMore]);

  // Auto-load when sentinel is visible
  useEffect(() => {
    if (isLoadMoreVisible && hasMoreToLoad && !isSearching && !isLoadingMore && !fetchingRef.current) {
      loadMoreArticles();
    }
  }, [isLoadMoreVisible, sentinelKey]); // Add sentinelKey to re-trigger

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    };
  }, []);

  return (
    <>
      {isArticlesPage && (
        <Meta
          title="Islamic Articles - Sheikh Assim Al Hakeem"
          description="Read authentic Islamic articles by Sheikh Assim bin Luqman al-Hakeem covering various topics of Islamic knowledge and guidance."
          url={`${server}/articles`}
          image={`${server}/img/id/default_share.jpeg`}
          type="website"
        />
      )}

      {isArticlesPage && (
        <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />
      )}

      <PageHero
        eyebrow="Writings"
        title="Articles"
        subtitle="Articles, reflections and resources from Sheikh Assim Al Hakeem."
        breadcrumbs={[{ label: "Articles" }]}
      />

      <div className="ah ah-toolbar">
        <div className="ah-wrap">
          <div className="ah-search" role="search">
            <Search size={17} aria-hidden="true" />
            <label htmlFor="article-search" className="sr-only">Search articles</label>
            <input
              id="article-search"
              type="search"
              placeholder="Search articles"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ah-input"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} className="ah-search__clear" aria-label="Clear search">
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>
          {searchTerm ? (
            <p className="ah-toolbar__note" role="status">
              <strong>{displayedArticles.length}</strong> {displayedArticles.length === 1 ? "article" : "articles"} matching &ldquo;{searchTerm}&rdquo;
            </p>
          ) : null}
        </div>
      </div>

      <section className="ah ah-page" aria-label="Articles">
        <div className="ah-wrap">
          {isSearching ? (
            <div className="ah-loading" role="status">
              <span className="ah-spinner" aria-hidden="true" />
              Searching articles...
            </div>
          ) : displayedArticles.length > 0 ? (
            <>
              <div className="ah-art-grid ah-art-grid--3">
                {displayedArticles.map((article, idx) => (
                  <article key={article.slug || article.postSlug || `article-${idx}`} className="ah-acard">
                    <Link href={`/articles/${article.slug || article.postSlug}`}>
                      <ArticleCardImage article={article} sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 380px" />
                      <div className="ah-acard__body">
                        <p className="ah-acard__date">{formatArticleDate(article.date || article.postDate)}</p>
                        <h3>{article.title || article.postTitle}</h3>
                        <p className="ah-acard__excerpt">{article.excerpt || article.postExcerpt || article.description}</p>
                        <span className="ah-link">
                          Read article
                          <ArrowRight size={17} aria-hidden="true" />
                        </span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              <div ref={loadMoreRef} key={sentinelKey} style={{ minHeight: 80 }}>
                {isLoadingMore && hasMoreToLoad && (
                  <div className="ah-loading" role="status">
                    <span className="ah-spinner" aria-hidden="true" />
                    Loading more articles...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="ah-empty">
              <Search size={40} aria-hidden="true" />
              <h2>No articles found</h2>
              <p>Try a different search term.</p>
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm('')} className="ah-btn ah-btn--primary">
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export async function getStaticProps(context) {
  try {
    const playlists = await getAllPlaylists2();
    const headerLectures = await getHeaderLectures();
    const qnaCategories = await getAllQnaCategory();
    const initialArticlesPage = await getAllArticles({ currentPage: 1, search: "", pageSize: ARTICLES_PER_PAGE });

    return {
      props: {
        playlists: playlists?.playlists || [],
        headerLectures: headerLectures || [],
        qnaCategories: qnaCategories || [],
        initialArticlesPage: initialArticlesPage || { articleItems: [], numberOfPages: 1, currentPage: 1 },
      },
    };
  } catch (error) {
    console.error('getStaticProps error:', error);
    return {
      props: {
        playlists: [],
        headerLectures: [],
        qnaCategories: [],
        initialArticlesPage: { articleItems: [], numberOfPages: 1, currentPage: 1 },
      },
    };
  }
}