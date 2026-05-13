import { useState, useEffect, useLayoutEffect, useMemo, useDeferredValue, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory, getAllQuestions, getQnaByLimit } from "../../lib/fetch";
import Meta from "../../components/meta";
import Header2 from "../../components/header1";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import useOnScreen from "../../hooks/useOnScreen";
import { HelpCircle, ChevronRight, FolderOpen, MessageCircle, X, Search, Grid3X3, ArrowUp, BookOpen, Filter, List, ChevronUp } from "lucide-react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const LAST_QNA_CATEGORY_KEY = "qna_last_category";
const PAGE_SIZE = 10;
const LOADING_DELAY = 1000;

export default function QnaPage({ playlists, headerLectures, qnaCategories, initialQnaPage, initialCategory, initialTopQna }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showCategoryDrawer, setShowCategoryDrawer] = useState(false);
  const [loadedPages, setLoadedPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSwitchingCategory, setIsSwitchingCategory] = useState(false);
  const [isTransitioningCategory, setIsTransitioningCategory] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const loadMoreRef = useRef(null);
  const lastLoadTimeRef = useRef(0);
  const isInitialMountRef = useRef(true);
  const fetchingRef = useRef(false);
  const loadingTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const categorySearchInputRef = useRef(null);
  const mainContentRef = useRef(null);
  const scrollAttemptRef = useRef(0);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const isLoadMoreVisible = useOnScreen(loadMoreRef, { rootMargin: '300px', threshold: 0 });
  const currentCategoryRef = useRef(selectedCategory);
  const loadedIdsRef = useRef(new Set());
  const initialDataLoadedRef = useRef(false);
  const previousCategoryRef = useRef(initialCategory || "all");
  const loadMoreRetryRef = useRef(null);
  const categoryRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const lastScrollY = useRef(0);
  const backToTopRef = useRef(null);

  // Initialize data only once when component mounts with initial data
  useEffect(() => {
    if (!initialDataLoadedRef.current && initialQnaPage) {
      // If we have a special top-QnA list (first 3) for the "all" category,
      // render them first and exclude them from the main page items to avoid duplicates.
      if (initialTopQna && Array.isArray(initialTopQna) && initialTopQna.length > 0 && (initialCategory === 'all' || !initialCategory)) {
        const topIds = new Set(initialTopQna.map(i => i?.id).filter(Boolean));
        const remaining = (initialQnaPage?.qaItems || []).filter(i => !topIds.has(i?.id));
        const pages = [];
        pages.push(initialTopQna);
        if (remaining.length > 0) pages.push(remaining);
        setLoadedPages(pages);
        pages.flat().forEach(item => { if (item?.id) loadedIdsRef.current.add(item.id); });
        setCurrentPage(initialQnaPage?.currentPage || 1);
        setTotalPages(initialQnaPage?.numberOfPages || 1);
      } else if (initialQnaPage?.qaItems?.length) {
        setLoadedPages([initialQnaPage.qaItems]);
        initialQnaPage.qaItems.forEach(item => {
          if (item?.id) loadedIdsRef.current.add(item.id);
        });
        setCurrentPage(initialQnaPage?.currentPage || 1);
        setTotalPages(initialQnaPage?.numberOfPages || 1);
      } else {
        setLoadedPages([]);
        setCurrentPage(1);
        setTotalPages(1);
      }
      setSelectedCategory(initialCategory || "all");
      previousCategoryRef.current = initialCategory || "all";
      setIsLoadingInitial(false);
      initialDataLoadedRef.current = true;
    }
  }, [initialQnaPage, initialCategory]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    currentCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

  useEffect(() => {
    const ids = new Set();
    loadedPages.flat().forEach(item => {
      if (item?.id) ids.add(item.id);
    });
    loadedIdsRef.current = ids;
  }, [loadedPages]);

  // FIXED: Back to top visibility handler - Multiple detection methods
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkScroll = () => {
      // Try multiple ways to get scroll position
      const scrollY = window.scrollY || 
                      window.pageYOffset || 
                      document.documentElement.scrollTop || 
                      document.body.scrollTop || 
                      0;
      
      // Only update if changed
      if (lastScrollY.current !== scrollY) {
        lastScrollY.current = scrollY;
        if (isMountedRef.current) {
          setShowBackToTop(scrollY > 200);
        }
      }
    };

    // Add scroll listener to window
    window.addEventListener("scroll", checkScroll, { passive: true });
    // Also add to document for compatibility
    document.addEventListener("scroll", checkScroll, { passive: true });
    
    // Check every 300ms as fallback
    const interval = setInterval(checkScroll, 300);
    
    // Initial check
    setTimeout(checkScroll, 100);
    setTimeout(checkScroll, 500);
    setTimeout(checkScroll, 1000);

    return () => {
      window.removeEventListener("scroll", checkScroll);
      document.removeEventListener("scroll", checkScroll);
      clearInterval(interval);
    };
  }, []);

  // Force body to be scrollable
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = 'auto';
      document.body.style.overflowY = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.overflowY = 'auto';
      document.documentElement.style.height = 'auto';
    }
  }, []);

  // Focus category search input when drawer opens
  useEffect(() => {
    if (showCategoryDrawer && categorySearchInputRef.current) {
      setTimeout(() => {
        categorySearchInputRef.current?.focus();
      }, 150);
    }
    // Prevent body scroll when drawer is open
    if (showCategoryDrawer) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [showCategoryDrawer]);

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Fallback
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  const scrollToTopInstantly = useCallback(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!router.isReady) return;
    
    const category = router.query.category || (router.query.slug && router.query.slug[0]);
    let targetCategory = "all";
    
    if (typeof category === 'string' && category.trim()) {
      const normalized = category.trim();
      const isValid = normalized === "all" || qnaCategories?.some(c => c.slug === normalized);
      targetCategory = isValid ? normalized : "all";
    } else {
      const storedCategory = typeof window !== "undefined" ? window.sessionStorage.getItem(LAST_QNA_CATEGORY_KEY) : null;
      const isStoredValid = storedCategory === "all" || qnaCategories?.some(c => c.slug === storedCategory);
      targetCategory = isStoredValid ? storedCategory : "all";
    }

    if (targetCategory !== selectedCategory || isInitialMountRef.current) {
      scrollToTopInstantly();
      
      if (targetCategory !== selectedCategory) {
        setSelectedCategory(targetCategory);
        fetchingRef.current = false;
      }
      
      isInitialMountRef.current = false;
    }

    if (targetCategory && targetCategory !== "all" && !(router.query.category === targetCategory || (router.query.slug && router.query.slug[0] === targetCategory))) {
      router.replace(`/qna/${targetCategory}`, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.category, router.query.slug, qnaCategories]);

  const EXCLUDE_SLUGS = ["books", "videos", "articles", "audios"];

  const visibleQnaCategories = useMemo(() => {
    return qnaCategories?.filter(c => c.slug !== 'all' && !EXCLUDE_SLUGS.includes(c.slug)) || [];
  }, [qnaCategories]);

  const filteredCategories = useMemo(() => {
    if (!categorySearchTerm.trim()) return visibleQnaCategories;
    const search = categorySearchTerm.toLowerCase().trim();
    return visibleQnaCategories.filter(cat => 
      cat.title.toLowerCase().includes(search) || 
      cat.slug.toLowerCase().includes(search)
    );
  }, [visibleQnaCategories, categorySearchTerm]);

  const handleCategoryChange = useCallback(async (slug) => {
    // Don't reload if same category
    if (slug === selectedCategory && slug === previousCategoryRef.current) {
      setShowMobileFilters(false);
      setShowCategoryDrawer(false);
      return;
    }

    const requestId = ++categoryRequestIdRef.current;

    // Clear any pending timeouts and fetches
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (loadMoreRetryRef.current) {
      clearTimeout(loadMoreRetryRef.current);
      loadMoreRetryRef.current = null;
    }

    scrollToTopInstantly();
    
    // Update UI immediately
    currentCategoryRef.current = slug;
    setSelectedCategory(slug);
    previousCategoryRef.current = slug;
    setShowMobileFilters(false);
    setShowCategoryDrawer(false);
    setCategorySearchTerm("");
    fetchingRef.current = false;
    scrollAttemptRef.current = 0;
    
    // Keep old data visible while loading new category - show transition
    setIsTransitioningCategory(true);
    setCurrentPage(1);
    setTotalPages(1);
    loadedIdsRef.current = new Set();
    setIsSwitchingCategory(true);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(LAST_QNA_CATEGORY_KEY, slug);
    }

    // Update URL immediately (not after fetch completes)
    const url = slug === "all" ? "/qna" : `/qna/${slug}`;
    await router.replace(url, undefined, { shallow: true, scroll: false });

    try {
      const res = await fetch(`/api/qna?currentPage=1&cat_slug=${slug}&pageSize=${PAGE_SIZE}`);
      const data = await res.json();
      
      // Only update if this is still the current category and component is mounted
      if (requestId === categoryRequestIdRef.current && currentCategoryRef.current === slug && isMountedRef.current) {
        if (data?.qaItems?.length) {
          setLoadedPages([data.qaItems]);
          setCurrentPage(data.currentPage || 1);
          setTotalPages(data.numberOfPages || 1);
          // Track loaded IDs
          data.qaItems.forEach(item => {
            if (item?.id) loadedIdsRef.current.add(item.id);
          });
        } else {
          setLoadedPages([]);
          setCurrentPage(1);
          setTotalPages(1);
        }
        setIsLoadingInitial(false);
        setIsSwitchingCategory(false);
        setIsTransitioningCategory(false);
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
      if (requestId === categoryRequestIdRef.current && currentCategoryRef.current === slug && isMountedRef.current) {
        setLoadedPages([]);
        setCurrentPage(1);
        setTotalPages(1);
        setIsLoadingInitial(false);
        setIsSwitchingCategory(false);
        setIsTransitioningCategory(false);
      }
    }
  }, [router, scrollToTopInstantly]);

  // Infinite scroll effect with fixed 1s loading and guaranteed next data
  useEffect(() => {
    // Don't load if: not visible, initial loading, switching category, or all pages loaded
    if (!isLoadMoreVisible || isLoadingInitial || isSwitchingCategory || isTransitioningCategory) {
      return;
    }

    if (currentPage >= totalPages) {
      return;
    }

    if (fetchingRef.current) {
      return;
    }

    let cancelled = false;

    const loadNextPage = async () => {
      const categoryAtStart = currentCategoryRef.current;
      fetchingRef.current = true;
      
      // Show loading immediately
      if (isMountedRef.current) {
        setIsLoadingMore(true);
      }
      
      const loadStartedAt = Date.now();

      try {
        const nextPageNumber = currentPage + 1;
        
        const res = await fetch(`/api/qna?currentPage=${nextPageNumber}&cat_slug=${categoryAtStart}&pageSize=${PAGE_SIZE}`);
        const data = await res.json();
        
        // Check if category changed or component unmounted during fetch
        if (cancelled || categoryAtStart !== currentCategoryRef.current || !isMountedRef.current) {
          return;
        }

        // Ensure loading shows for at least 1 second
        const elapsed = Date.now() - loadStartedAt;
        if (elapsed < LOADING_DELAY) {
          const remaining = LOADING_DELAY - elapsed;
          await new Promise((resolve) => {
            loadingTimeoutRef.current = setTimeout(resolve, remaining);
          });
          loadingTimeoutRef.current = null;
        }

        // Check again after delay
        if (cancelled || categoryAtStart !== currentCategoryRef.current || !isMountedRef.current) {
          return;
        }

        if (data?.qaItems?.length) {
          setLoadedPages((prev) => {
            // Filter out duplicates using the ref
            const existingIds = loadedIdsRef.current;
            const newItems = data.qaItems.filter(item => item?.id && !existingIds.has(item.id));
            
            if (newItems.length > 0) {
              // Track new IDs
              newItems.forEach(item => {
                if (item?.id) loadedIdsRef.current.add(item.id);
              });
              return [...prev, newItems];
            }
            return prev;
          });
          setCurrentPage(data.currentPage || nextPageNumber);
          setTotalPages(data.numberOfPages || totalPages);
          scrollAttemptRef.current = 0;
        } else {
          // No more data - mark as complete
          setCurrentPage(totalPages);
        }
      } catch (error) {
        console.error("Error loading more:", error);
        // Retry logic for network errors
        scrollAttemptRef.current += 1;
        if (scrollAttemptRef.current <= 3) {
          // Will retry on next scroll trigger
        }
      } finally {
        // Only reset if category hasn't changed and component is still mounted
        if (categoryAtStart === currentCategoryRef.current && isMountedRef.current) {
          fetchingRef.current = false;
          setIsLoadingMore(false);
        }
      }
    };

    loadNextPage();

    return () => {
      cancelled = true;
    };
  }, [isLoadMoreVisible, isLoadingInitial, isSwitchingCategory, isTransitioningCategory, currentPage, totalPages, selectedCategory]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (loadMoreRetryRef.current) {
        clearTimeout(loadMoreRetryRef.current);
      }
    };
  }, []);

  const loadedQna = useMemo(() => loadedPages.flat(), [loadedPages]);

  const normalizedSearch = deferredSearchTerm.trim().toLowerCase();

  const filteredQna = useMemo(() => {
    if (!normalizedSearch) return loadedQna;

    return loadedQna.filter((item) => {
      const question = item.question?.toLowerCase() || "";
      const content = item.content?.toLowerCase() || "";
      const answer = item.answer?.toLowerCase() || "";
      return question.includes(normalizedSearch) || content.includes(normalizedSearch) || answer.includes(normalizedSearch);
    });
  }, [loadedQna, normalizedSearch]);

  const activeCategoryName = selectedCategory === "all" 
    ? "All Categories" 
    : qnaCategories?.find(c => c.slug === selectedCategory)?.title || "All Categories";

  const hasMoreToLoad = currentPage < totalPages;
  const totalLoadedCount = loadedQna.length;

  const listVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: "easeOut",
      },
    },
  };

  return (
    <>
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
          ring: none !important;
        }
        
        button::-moz-focus-inner {
          border: 0;
        }
        
        button {
          -webkit-tap-highlight-color: transparent;
        }

        /* Custom scrollbar for category list */
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
        
        /* Ensure html/body are scrollable */
        html, body {
          height: auto !important;
          overflow-y: auto !important;
        }
      `}</style>
      
      <Meta title="Q&A - Sheikh Assim Al Hakeem" description="Get answers to your Islamic questions from Sheikh Assim Al Hakeem" />
      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={visibleQnaCategories} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1a1f2e] to-[#2a3142] py-6 xs:py-8 sm:py-10 lg:py-14">
        <div className="max-w-[1260px] mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <HelpCircle size={28} className="xs:w-8 xs:h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#10b981] mx-auto mb-2 xs:mb-3 sm:mb-4" />
            <h1 className="page-title text-white mb-1 xs:mb-2 sm:mb-3">Questions & Answers</h1>
            <p className="text-xs xs:text-sm sm:text-base text-gray-300 max-w-2xl mx-auto px-2 xs:px-4">
              Find authentic Islamic answers from Sheikh Assim Al Hakeem
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-2.5 xs:py-3 sm:py-4 lg:py-6 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1260px] mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8">
          <div className="flex flex-col lg:flex-row gap-2.5 xs:gap-3 lg:gap-4 items-start lg:items-center">
            {/* Search Input */}
            <div className="relative w-full lg:w-80 xl:w-96">
              <input 
                type="text" 
                placeholder="Search questions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 xs:pl-9 sm:pl-12 pr-7 xs:pr-8 sm:pr-10 py-2 sm:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] text-xs xs:text-sm sm:text-base text-[#1a1f2e]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Mobile/Tablet: Category Button - Full Green BG with White Icon & Text */}
            <div className="lg:hidden flex items-center gap-2 w-full">
              <button
                onClick={() => setShowCategoryDrawer(true)}
                className="flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-2 sm:py-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-xs xs:text-sm sm:text-base font-medium transition-colors border-0 outline-none whitespace-nowrap flex-shrink-0 shadow-sm"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                title="View all categories"
                aria-label="Open categories list"
              >
                <List size={16} className="xs:w-[18px] xs:h-[18px] sm:w-5 sm:h-5 text-white" />
                <span className="hidden xs:inline text-white">Categories</span>
              </button>
              <div className="flex-1 min-w-0 bg-gray-50 rounded-lg px-3 py-2 sm:py-2.5 border border-gray-100">
                <span className="text-xs xs:text-sm text-gray-700 truncate block font-medium">
                  {activeCategoryName}
                </span>
              </div>
            </div>

            {/* Desktop: Active Category Badge */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-sm text-gray-500">Category:</span>
              <span className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] rounded-full text-sm font-medium">
                {activeCategoryName}
              </span>
            </div>

            {deferredSearchTerm.trim().length > 0 && (
              <div className="hidden lg:block text-xs lg:text-sm text-gray-500 whitespace-nowrap ml-auto">
                {filteredQna.length} {filteredQna.length === 1 ? 'result' : 'results'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Drawer - Mobile/Tablet (Bottom Sheet) */}
      <AnimatePresence>
        {showCategoryDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowCategoryDrawer(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl lg:hidden flex flex-col"
              style={{ maxHeight: "85vh" }}
            >
              <div className="flex items-center justify-center pt-3 pb-2 flex-shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="px-4 pb-3 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                      <List size={18} className="text-[#10b981]" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-[#1a1f2e]">All Categories</h3>
                      <p className="text-xs text-gray-400">{visibleQnaCategories.length} categories available</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCategoryDrawer(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close categories">
                    <X size={18} className="sm:w-5 sm:h-5 text-gray-500" />
                  </button>
                </div>
                <div className="relative">
                  <input
                    ref={categorySearchInputRef}
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearchTerm}
                    onChange={(e) => setCategorySearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                  />
                  {categorySearchTerm && (
                    <button onClick={() => setCategorySearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto category-scrollbar px-2 py-2 pb-6">
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1.5 border-0 outline-none
                    ${selectedCategory === "all" ? "bg-[#10b981] text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen size={16} className="flex-shrink-0" />
                    <span>All Categories</span>
                    {selectedCategory === "all" && <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">Active</span>}
                  </div>
                </button>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 mb-1.5 border-0 outline-none
                        ${selectedCategory === cat.slug ? "bg-[#10b981] text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200"}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FolderOpen size={14} className="flex-shrink-0" />
                        <span className="break-words leading-snug flex-1">{cat.title}</span>
                        {selectedCategory === cat.slug && <span className="flex-shrink-0 w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <FolderOpen size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">No categories found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Q&A List */}
      <section className="py-8 xs:py-8 sm:py-10 lg:py-10 bg-gray-50 min-h-[60vh]" ref={containerRef}>
        <div className="max-w-[1260px] mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8">
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block self-start sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 xl:p-5 border-b border-gray-100 bg-gradient-to-r from-[#f0fdf4] to-white">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                      <List size={18} className="text-[#10b981]" />
                    </div>
                    <div>
                      <h2 className="text-base xl:text-lg font-semibold mb-0 text-[#1a1f2e]">Categories</h2>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs xl:text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                    />
                  </div>
                </div>
                <div className="max-h-[calc(100vh-320px)] overflow-y-auto category-scrollbar p-3 xl:p-4 space-y-1">
                  <button
                    onClick={() => handleCategoryChange("all")}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full text-left px-3 xl:px-4 py-2.5 rounded-xl text-xs xl:text-sm font-medium transition-all duration-200 border-0 outline-none appearance-none flex items-center gap-2.5
                      ${selectedCategory === "all" ? "bg-[#10b981] text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm"}`}
                  >
                    <BookOpen size={15} className={`flex-shrink-0 ${selectedCategory === "all" ? "text-white" : "text-[#10b981]"}`} />
                    <span>All Categories</span>
                  </button>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryChange(cat.slug)}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`w-full text-left px-3 xl:px-4 py-2.5 rounded-xl text-xs xl:text-sm font-medium transition-all duration-200 border-0 outline-none appearance-none group
                          ${selectedCategory === cat.slug ? "bg-[#10b981] text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm"}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FolderOpen size={14} className={`flex-shrink-0 ${selectedCategory === cat.slug ? "text-white" : "text-[#10b981]"}`} />
                          <span className="leading-snug flex-1">{cat.title}</span>
                          {selectedCategory === cat.slug && <span className="flex-shrink-0 w-1.5 h-1.5 bg-white rounded-full ml-auto" />}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <FolderOpen size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No categories found</p>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="min-w-0 relative" ref={mainContentRef}>
              {isLoadingInitial && loadedQna.length === 0 && !isTransitioningCategory ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 sm:py-16">
                  <div className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-[#10b981] border-t-transparent animate-spin" />
                  <p className="text-sm sm:text-base text-gray-500">Loading questions...</p>
                </motion.div>
              ) : filteredQna.length > 0 || isTransitioningCategory ? (
                <>
                  <motion.div 
                    key={selectedCategory}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: isTransitioningCategory ? 0.4 : 1 }}
                    transition={{ duration: 0.3 }}
                    className={`space-y-2.5 xs:space-y-3 sm:space-y-4 ${isTransitioningCategory ? "pointer-events-none select-none" : ""}`}
                    style={{ opacity: isTransitioningCategory ? 0.4 : 1 }}
                  >
                    {filteredQna.length > 0 && (
                      <>
                        {filteredQna.map((item) => (
                          <motion.div key={`${selectedCategory}-${item.id}`} variants={cardVariants} className="bg-white rounded-lg xs:rounded-xl shadow-sm hover:shadow-md transition-all p-3.5 xs:p-4 sm:p-5 lg:p-6">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#10b981]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MessageCircle size={14} className="xs:w-4 xs:h-4 sm:w-[18px] sm:h-[18px] text-[#10b981]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-[#1a1f2e] mb-1 sm:mb-2 line-clamp-2">{item.question}</h3>
                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 mb-1.5 sm:mb-3">{item.content || item.answer}</p>
                                <Link href={`/qna/answer/${item.id}`} className="inline-flex items-center gap-1 text-[#10b981] text-xs sm:text-sm font-medium hover:gap-2 transition-all">
                                  Read Full Answer <ChevronRight size={10} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5" />
                                </Link>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={loadMoreRef} className="flex items-center justify-center py-8 min-h-[80px]">
                          {isLoadingMore && hasMoreToLoad && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
                              <svg className="animate-spin h-6 w-6 sm:h-7 sm:w-7 text-[#10b981]" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                              </svg>
                              <span className="text-sm sm:text-base text-gray-500 font-medium">Loading more questions...</span>
                            </motion.div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                  
                  {isTransitioningCategory && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm rounded-lg pointer-events-none"
                      style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                    >
                      <div className="flex flex-col items-center gap-3 bg-white rounded-xl p-6 shadow-lg">
                        <svg className="animate-spin h-8 w-8 text-[#10b981]" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        <span className="text-sm text-gray-700 font-medium">Switching category...</span>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="text-center py-10 xs:py-12 sm:py-16 bg-white rounded-xl shadow-sm">
                  <FolderOpen size={36} className="xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2.5 xs:mb-3 sm:mb-4" />
                  <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-600 mb-1 sm:mb-2">No questions found</h3>
                  <p className="text-xs xs:text-sm sm:text-base text-gray-500">Try adjusting your search or filter</p>
                  <button onClick={() => handleCategoryChange("all")} className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#10b981] font-medium hover:underline">
                    <BookOpen size={14} /> Browse all questions
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top Floating Button - GREEN BG WITH WHITE ICON - FIXED */}
      <button
        ref={backToTopRef}
        onClick={scrollToTop}
        type="button"
        className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 lg:bottom-10 lg:right-8 w-11 h-11 sm:w-12 sm:h-12 bg-[#10b981] hover:bg-[#059669] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 border-0 outline-none cursor-pointer active:scale-95 group"
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          opacity: showBackToTop ? 1 : 0,
          visibility: showBackToTop ? 'visible' : 'hidden',
          transform: showBackToTop ? 'translateY(0)' : 'translateY(100px)',
          pointerEvents: showBackToTop ? 'auto' : 'none',
          transition: 'opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease',
          zIndex: 9999,
        }}
        aria-label="Back to top"
        title="Scroll to top"
      >
        <ArrowUp size={20} className="sm:w-[22px] sm:h-[22px] text-white group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {/* Ask Question CTA */}
      <section className="py-8 xs:py-10 sm:py-12 bg-gradient-to-r from-[#10b981] to-[#059669]">
        <div className="max-w-[800px] mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8 text-center">
          <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1.5 xs:mb-2 sm:mb-3">Have a Question?</h2>
          <p className="text-xs xs:text-sm sm:text-base text-white/90 mb-4 xs:mb-5 sm:mb-6 max-w-md mx-auto">
            Submit your question to get guidance from Sheikh Assim Al Hakeem
          </p>
          <Link href="/ask-question">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="px-5 xs:px-6 sm:px-8 py-2 sm:py-2.5 lg:py-3 bg-white text-[#10b981] rounded-full text-xs xs:text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Ask a Question
            </motion.button>
          </Link>
        </div>
      </section>
    </>
  );
}

export async function getStaticProps({ params }) {
  try {
    const slugArray = params?.slug || [];
    const catSlug = slugArray.length > 0 ? slugArray[0] : "all";
    const playlists = await getAllPlaylists2();
    const headerLectures = await getHeaderLectures();
    const qnaCategories = await getAllQnaCategory();
    const initialQnaPage = await getAllQuestions({ currentPage: 1, cat_slug: catSlug, pageSize: PAGE_SIZE });
    // For the main "all" category, also fetch top 3 QnA to display prominently at the top
    let initialTopQna = [];
    if (catSlug === 'all') {
      initialTopQna = await getQnaByLimit(3);
    }

    return {
      props: {
        playlists: playlists?.playlists || [],
        headerLectures: headerLectures || null,
        qnaCategories: qnaCategories || [],
        initialQnaPage: initialQnaPage || { qaItems: [], numberOfPages: 1, currentPage: 1 },
        initialTopQna: initialTopQna || [],
        initialCategory: catSlug || 'all',
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error in getStaticProps:", error);
    return {
      props: {
        playlists: [],
        headerLectures: null,
        qnaCategories: [],
        initialQnaPage: { qaItems: [], numberOfPages: 1, currentPage: 1 },
      },
      revalidate: 300,
    };
  }
}

export async function getStaticPaths() {
  const qnaCategories = await getAllQnaCategory();
  const paths = qnaCategories?.filter(c => c.slug !== "all").map(cat => ({
    params: { slug: [cat.slug] },
  })) || [];

  paths.push({ params: { slug: [] } });

  return { paths, fallback: "blocking" };
}
