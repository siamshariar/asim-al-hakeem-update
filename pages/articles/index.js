import { useRouter } from 'next/router';
import { useState, useEffect, useMemo, useRef, useDeferredValue, useCallback } from "react";
import { server } from "../../lib/config";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory, getAllArticles } from "../../lib/fetch";
import Meta from "../../components/meta";
import Header2 from "../../components/header1";
import PageHero from "../../components/page-hero";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Search, X, FileText } from 'lucide-react';
import useOnScreen from "../../hooks/useOnScreen";

const ARTICLES_PER_PAGE = 9;

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
        title="Islamic Articles"
        subtitle="Authentic Islamic knowledge and guidance through well-researched articles"
        Icon={FileText}
        imageSrc="/img/articles/default.jpg"
        imageAlt="Islamic Articles"
      />

      {/* Search Bar */}
      <section className="py-6 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="container max-w-[1260px] mx-auto px-4">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] text-[#1a1f2e]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {searchTerm ? (
            <div className="mt-2 text-xs sm:text-sm text-gray-500">
              {displayedArticles.length} articles matching "{searchTerm}"
            </div>
          ) : null}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-8 md:py-12 lg:py-16 bg-gray-50 min-h-[60vh]">
        <div className="container max-w-[1260px] mx-auto px-4">
          {isSearching ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-[#10b981] border-t-transparent animate-spin" />
              <p className="text-gray-500">Searching articles...</p>
            </div>
          ) : displayedArticles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedArticles.map((article, idx) => (
                  <motion.article
                    key={article.slug || article.postSlug || `article-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    whileHover={{ y: -5 }}
                    className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <a href={`/articles/${article.slug || article.postSlug}`} className="block">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={article.image || article.imageSrc || "/img/articles/default.jpg"}
                          alt={article.title || article.postTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-5 flex h-full flex-col">
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-[#10b981]" />
                            {article.date || article.postDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-[#10b981]" />
                            Sheikh Assim
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1a1f2e] mb-2 line-clamp-2 group-hover:text-[#10b981] transition-colors">
                          {article.title || article.postTitle}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                          {article.excerpt || article.postExcerpt || article.description}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[#10b981] text-sm font-medium group-hover:gap-2 transition-all">
                          Read More <ArrowRight size={14} />
                        </span>
                      </div>
                    </a>
                  </motion.article>
                ))}
              </div>

              {/* Load More Sentinel */}
              <div 
                ref={loadMoreRef} 
                key={sentinelKey}
                className="flex items-center justify-center py-8 sm:py-10 min-h-[80px]"
              >
                {isLoadingMore && hasMoreToLoad && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <svg className="animate-spin h-6 w-6 sm:h-7 sm:w-7 text-[#10b981]" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    <span className="text-sm sm:text-base text-gray-500 font-medium">Loading more articles...</span>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Search size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No articles found.</p>
              <p className="text-gray-400 text-sm">Try adjusting your search terms.</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 px-4 py-2 bg-[#10b981] text-white rounded-lg text-sm hover:bg-[#059669] transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <style jsx global>{`
        button:focus,
        button:focus-visible,
        button:active:focus,
        button:focus:not(:focus-visible) {
          outline: none !important;
          box-shadow: none !important;
        }
        
        button:focus-visible {
          outline: none !important;
        }
        
        button::-moz-focus-inner {
          border: 0;
        }
        
        button {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
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