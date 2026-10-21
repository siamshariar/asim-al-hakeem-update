import { useState, useEffect, useLayoutEffect, useMemo, useDeferredValue, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory, getAllQuestions, getQnaByLimit } from "../../lib/fetch";
import Meta from "../../components/meta";
import Header2 from "../../components/header1";
import PageHero from "../../components/page-hero";
import Link from "next/link";
import BottomSheet from "../../components/bottom-sheet";
import { ArrowRight, FolderOpen, X, Search, ArrowUp, BookOpen, List } from "lucide-react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const LAST_QNA_CATEGORY_KEY = "qna_last_category";
const QNA_SCROLL_STATE_KEY = "qna_scroll_state";
const SCROLL_RESTORE_FLAG_KEY = "qna_scroll_restore";
const PAGE_SIZE = 10;
const LOADING_DELAY = 800;

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
  
  // Refs
  const loadMoreRef = useRef(null);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const fetchingRef = useRef(false);
  const loadingTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const categorySearchInputRef = useRef(null);
  const mainContentRef = useRef(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const currentCategoryRef = useRef(selectedCategory);
  const loadedIdsRef = useRef(new Set());
  const initialDataLoadedRef = useRef(false);
  const previousCategoryRef = useRef(initialCategory || "all");
  const categoryRequestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const lastScrollY = useRef(0);
  const backToTopRef = useRef(null);
  const hasRestoredScrollRef = useRef(false);
  const pendingScrollRestoreRef = useRef(null);
  const initialScrollRestoreRequestedRef = useRef(false);
  const restoreRafRef = useRef(null);
  const restoreAttemptsRef = useRef(0);
  const restoreStartTimeRef = useRef(0);
  const restoreTargetRef = useRef(null);
  const restoreScrollBehaviorRef = useRef(null);
  const historyScrollRestorationRef = useRef(null);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);

  const getCurrentScrollY = useCallback(() => {
    if (typeof window === "undefined") return 0;
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }, []);

  const setPendingScrollRestore = useCallback((scrollY) => {
    const target = Number.isFinite(scrollY) ? scrollY : 0;
    pendingScrollRestoreRef.current = target;
    restoreTargetRef.current = target;
    restoreAttemptsRef.current = 0;
    restoreStartTimeRef.current = Date.now();
    initialScrollRestoreRequestedRef.current = true;
    setIsRestoringScroll(true);
  }, []);

  const runScrollRestore = useCallback(() => {
    if (typeof window === "undefined") return;
    const target = pendingScrollRestoreRef.current;
    if (!Number.isFinite(target)) return;
    if (restoreRafRef.current) return;

    if (restoreScrollBehaviorRef.current === null) {
      restoreScrollBehaviorRef.current = document.documentElement.style.scrollBehavior || "";
      document.documentElement.style.scrollBehavior = "auto";
    }

    restoreStartTimeRef.current = Date.now();

    const tick = () => {
      if (!isMountedRef.current) {
        if (restoreRafRef.current) {
          cancelAnimationFrame(restoreRafRef.current);
          restoreRafRef.current = null;
        }
        return;
      }

      const rawTarget = restoreTargetRef.current ?? pendingScrollRestoreRef.current;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const targetY = Math.min(rawTarget, maxScroll);

      window.scrollTo(0, targetY);
      document.documentElement.scrollTop = targetY;
      document.body.scrollTop = targetY;

      const currentY = getCurrentScrollY();
      const closeEnough = Math.abs(currentY - targetY) <= 2;
      const canReachTarget = maxScroll >= rawTarget - 1;
      const elapsed = Date.now() - restoreStartTimeRef.current;

      restoreAttemptsRef.current += 1;

      if ((closeEnough && canReachTarget) || elapsed > 3500 || restoreAttemptsRef.current > 90) {
        pendingScrollRestoreRef.current = null;
        restoreTargetRef.current = null;
        restoreAttemptsRef.current = 0;
        restoreRafRef.current = null;
        initialScrollRestoreRequestedRef.current = false;

        if (restoreScrollBehaviorRef.current !== null) {
          document.documentElement.style.scrollBehavior = restoreScrollBehaviorRef.current;
          restoreScrollBehaviorRef.current = null;
        }

        if (isMountedRef.current) {
          setIsRestoringScroll(false);
        }

        sessionStorage.removeItem(SCROLL_RESTORE_FLAG_KEY);
        sessionStorage.removeItem(QNA_SCROLL_STATE_KEY);
        sessionStorage.removeItem("qna_scroll_position");
        return;
      }

      restoreRafRef.current = requestAnimationFrame(tick);
    };

    restoreRafRef.current = requestAnimationFrame(tick);
  }, [getCurrentScrollY]);

  const cacheDataBeforeNavigation = useCallback(() => {
    if (typeof window === "undefined") return;

    const scrollY = getCurrentScrollY();
    const snapshot = {
      pages: loadedPages,
      currentPage,
      totalPages,
      category: selectedCategory,
      scrollY,
      timestamp: Date.now(),
    };

    const cacheData = {
      pages: loadedPages,
      currentPage,
      totalPages,
      timestamp: Date.now(),
    };

    sessionStorage.setItem("qna_cached_data", JSON.stringify(cacheData));
    sessionStorage.setItem("qna_cached_category", selectedCategory);
    sessionStorage.setItem("qna_scroll_position", scrollY.toString());
    sessionStorage.setItem(SCROLL_RESTORE_FLAG_KEY, "true");
    sessionStorage.setItem(QNA_SCROLL_STATE_KEY, JSON.stringify(snapshot));
  }, [currentPage, getCurrentScrollY, loadedPages, selectedCategory, totalPages]);

  const linkClickedRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      if (historyScrollRestorationRef.current === null) {
        historyScrollRestorationRef.current = window.history.scrollRestoration;
      }
      window.history.scrollRestoration = "manual";
    }
    if (!initialScrollRestoreRequestedRef.current) {
      initialScrollRestoreRequestedRef.current = sessionStorage.getItem(SCROLL_RESTORE_FLAG_KEY) === "true";
    }
    if (initialScrollRestoreRequestedRef.current) {
      setIsRestoringScroll(true);
    }
    return () => {
      if (historyScrollRestorationRef.current !== null && "scrollRestoration" in window.history) {
        window.history.scrollRestoration = historyScrollRestorationRef.current;
        historyScrollRestorationRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href) {
        const targetUrl = new URL(target.href);
        const currentUrl = new URL(window.location.href);
        if (targetUrl.origin === currentUrl.origin) {
          linkClickedRef.current = true;
        }
      }
    };
    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      if (typeof url !== "string") return;
      if (url.startsWith("/qna/answer")) {
        cacheDataBeforeNavigation();
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => router.events.off("routeChangeStart", handleRouteChangeStart);
  }, [router.events, cacheDataBeforeNavigation]);

  // Initialize data
  useIsomorphicLayoutEffect(() => {
    if (!initialDataLoadedRef.current && initialQnaPage) {
      const needsRestore = sessionStorage.getItem(SCROLL_RESTORE_FLAG_KEY) === "true";
      const storedSnapshotRaw = sessionStorage.getItem(QNA_SCROLL_STATE_KEY);
      const cachedData = sessionStorage.getItem("qna_cached_data");
      const cachedCategory = sessionStorage.getItem("qna_cached_category");

      if (needsRestore && storedSnapshotRaw) {
        try {
          const snapshot = JSON.parse(storedSnapshotRaw);
          if (Array.isArray(snapshot.pages)) {
            setLoadedPages(snapshot.pages);
            setCurrentPage(snapshot.currentPage || 1);
            setTotalPages(snapshot.totalPages || 1);

            const ids = new Set();
            snapshot.pages.flat().forEach(item => {
              if (item?.id) ids.add(item.id);
            });
            loadedIdsRef.current = ids;

            const restoredCategory = snapshot.category || initialCategory || "all";
            setSelectedCategory(restoredCategory);
            previousCategoryRef.current = restoredCategory;
            setIsLoadingInitial(false);
            initialDataLoadedRef.current = true;
            hasRestoredScrollRef.current = true;
            initialScrollRestoreRequestedRef.current = true;
            const restoredScrollY = Number.isFinite(snapshot.scrollY)
              ? snapshot.scrollY
              : parseInt(sessionStorage.getItem("qna_scroll_position") || "0", 10) || 0;
            setPendingScrollRestore(restoredScrollY);
            return;
          }
        } catch (e) {
          console.error("Error parsing Q&A scroll snapshot:", e);
        }
      }
      
      if (needsRestore && cachedData && cachedCategory === (initialCategory || 'all')) {
        try {
          const parsed = JSON.parse(cachedData);
          setLoadedPages(parsed.pages);
          setCurrentPage(parsed.currentPage);
          setTotalPages(parsed.totalPages);
          
          const ids = new Set();
          parsed.pages.flat().forEach(item => {
            if (item?.id) ids.add(item.id);
          });
          loadedIdsRef.current = ids;
          
          setSelectedCategory(initialCategory || "all");
          previousCategoryRef.current = initialCategory || "all";
          setIsLoadingInitial(false);
          initialDataLoadedRef.current = true;
          hasRestoredScrollRef.current = true;
          initialScrollRestoreRequestedRef.current = true;
          const restoredScrollY = parseInt(sessionStorage.getItem("qna_scroll_position") || "0", 10) || 0;
          setPendingScrollRestore(restoredScrollY);
          return;
        } catch (e) {
          console.error("Error parsing cached data:", e);
        }
      }
      
      if (needsRestore) {
        sessionStorage.removeItem(SCROLL_RESTORE_FLAG_KEY);
        initialScrollRestoreRequestedRef.current = false;
        setIsRestoringScroll(false);
      }
      
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
      if (!initialScrollRestoreRequestedRef.current) {
        setIsRestoringScroll(false);
      }
    }
  }, [initialQnaPage, initialCategory, setPendingScrollRestore]);

  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoadingInitial) return;
    if (!Number.isFinite(pendingScrollRestoreRef.current)) return;
    runScrollRestore();
  }, [isLoadingInitial, loadedPages, currentPage, totalPages, runScrollRestore]);

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

  // Back to top visibility
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkScroll = () => {
      const scrollY = window.scrollY || 
                      window.pageYOffset || 
                      document.documentElement.scrollTop || 
                      document.body.scrollTop || 
                      0;
      
      if (lastScrollY.current !== scrollY) {
        lastScrollY.current = scrollY;
        if (isMountedRef.current) {
          setShowBackToTop(scrollY > 200);
        }
      }
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    document.addEventListener("scroll", checkScroll, { passive: true });
    
    const interval = setInterval(checkScroll, 300);
    
    setTimeout(checkScroll, 100);
    setTimeout(checkScroll, 500);
    setTimeout(checkScroll, 1000);

    return () => {
      window.removeEventListener("scroll", checkScroll);
      document.removeEventListener("scroll", checkScroll);
      clearInterval(interval);
    };
  }, []);

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

  useEffect(() => {
    const cleanupCache = () => {
      const cachedTimestamp = sessionStorage.getItem("qna_cache_timestamp");
      if (cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const thirtyMinutes = 30 * 60 * 1000;
        if (Date.now() - timestamp > thirtyMinutes) {
          sessionStorage.removeItem("qna_cached_data");
          sessionStorage.removeItem("qna_cached_category");
          sessionStorage.removeItem("qna_scroll_position");
          sessionStorage.removeItem("qna_cache_timestamp");
          sessionStorage.removeItem(SCROLL_RESTORE_FLAG_KEY);
        }
      }
    };
    
    cleanupCache();
    sessionStorage.setItem("qna_cache_timestamp", Date.now().toString());
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    }, 100);
  }, []);

  const scrollToTopInstantly = useCallback(() => {
    if (typeof window === "undefined") return;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  // Load more data function
  const loadMoreData = useCallback(async () => {
    if (fetchingRef.current) return;
    if (currentPage >= totalPages) return;
    
    const categoryAtStart = currentCategoryRef.current;
    fetchingRef.current = true;
    
    if (isMountedRef.current) {
      setIsLoadingMore(true);
    }
    
    const loadStartedAt = Date.now();

    try {
      const nextPageNumber = currentPage + 1;
      
      const res = await fetch(`/api/qna?currentPage=${nextPageNumber}&cat_slug=${categoryAtStart}&pageSize=${PAGE_SIZE}`);
      const data = await res.json();
      
      if (categoryAtStart !== currentCategoryRef.current || !isMountedRef.current) {
        fetchingRef.current = false;
        setIsLoadingMore(false);
        return;
      }

      const elapsed = Date.now() - loadStartedAt;
      if (elapsed < LOADING_DELAY) {
        await new Promise((resolve) => {
          loadingTimeoutRef.current = setTimeout(resolve, LOADING_DELAY - elapsed);
        });
        loadingTimeoutRef.current = null;
      }

      if (categoryAtStart !== currentCategoryRef.current || !isMountedRef.current) {
        fetchingRef.current = false;
        setIsLoadingMore(false);
        return;
      }

      if (data?.qaItems?.length) {
        setLoadedPages((prev) => {
          const existingIds = loadedIdsRef.current;
          const newItems = data.qaItems.filter(item => item?.id && !existingIds.has(item.id));
          
          if (newItems.length > 0) {
            newItems.forEach(item => {
              if (item?.id) loadedIdsRef.current.add(item.id);
            });
            return [...prev, newItems];
          }
          return prev;
        });
        setCurrentPage(data.currentPage || nextPageNumber);
        setTotalPages(data.numberOfPages || totalPages);
      } else {
        setCurrentPage(totalPages);
      }
    } catch (error) {
      console.error("Error loading more:", error);
    } finally {
      if (categoryAtStart === currentCategoryRef.current && isMountedRef.current) {
        fetchingRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [currentPage, totalPages]);

  // Set up Intersection Observer for infinite scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    if (isLoadingInitial || isSwitchingCategory || isTransitioningCategory || isRestoringScroll) {
      return;
    }
    
    if (currentPage >= totalPages) {
      return;
    }
    
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !fetchingRef.current && currentPage < totalPages) {
            loadMoreData();
          }
        });
      },
      {
        rootMargin: '200px',
        threshold: 0.1,
      }
    );
    
    observer.observe(sentinel);
    observerRef.current = observer;
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [isLoadingInitial, isSwitchingCategory, isTransitioningCategory, isRestoringScroll, currentPage, totalPages, selectedCategory, loadMoreData]);

  // Check if content is short and needs to load more immediately
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoadingInitial || isSwitchingCategory || isTransitioningCategory || isRestoringScroll) return;
    if (currentPage >= totalPages) return;
    if (fetchingRef.current) return;
    
    const checkContentHeight = () => {
      const docHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight || 0;
      
      if (docHeight <= viewportHeight + 200) {
        loadMoreData();
      }
    };
    
    const timeout = setTimeout(checkContentHeight, 500);
    
    return () => clearTimeout(timeout);
  }, [loadedPages, isLoadingInitial, isSwitchingCategory, isTransitioningCategory, isRestoringScroll, currentPage, totalPages, loadMoreData]);

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
      const hasPendingRestore = Number.isFinite(pendingScrollRestoreRef.current);
      if (!hasRestoredScrollRef.current && !initialScrollRestoreRequestedRef.current && !isRestoringScroll && !hasPendingRestore) {
        scrollToTopInstantly();
      }
      
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
    if (slug === selectedCategory && slug === previousCategoryRef.current) {
      setShowMobileFilters(false);
      setShowCategoryDrawer(false);
      return;
    }

    const requestId = ++categoryRequestIdRef.current;

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    pendingScrollRestoreRef.current = null;
    restoreTargetRef.current = null;
    initialScrollRestoreRequestedRef.current = false;
    setIsRestoringScroll(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(SCROLL_RESTORE_FLAG_KEY);
      sessionStorage.removeItem(QNA_SCROLL_STATE_KEY);
      sessionStorage.removeItem("qna_scroll_position");
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    scrollToTopInstantly();
    hasRestoredScrollRef.current = false;
    
    currentCategoryRef.current = slug;
    setSelectedCategory(slug);
    previousCategoryRef.current = slug;
    setShowMobileFilters(false);
    setShowCategoryDrawer(false);
    setCategorySearchTerm("");
    fetchingRef.current = false;
    
    setIsTransitioningCategory(true);
    setIsLoadingInitial(true);
    setCurrentPage(1);
    setTotalPages(1);
    loadedIdsRef.current = new Set();
    setIsSwitchingCategory(true);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(LAST_QNA_CATEGORY_KEY, slug);
    }

    const url = slug === "all" ? "/qna" : `/qna/${slug}`;
    router.push(url, undefined, { shallow: true, scroll: false });

    try {
      const res = await fetch(`/api/qna?currentPage=1&cat_slug=${slug}&pageSize=${PAGE_SIZE}`);
      const data = await res.json();
      
      if (requestId === categoryRequestIdRef.current && currentCategoryRef.current === slug && isMountedRef.current) {
        if (data?.qaItems?.length) {
          setLoadedPages([data.qaItems]);
          setCurrentPage(data.currentPage || 1);
          setTotalPages(data.numberOfPages || 1);
          data.qaItems.forEach(item => {
            if (item?.id) loadedIdsRef.current.add(item.id);
          });
        } else {
          setLoadedPages([]);
          setCurrentPage(1);
          setTotalPages(1);
        }
        setIsLoadingInitial(false);
        setIsLoadingMore(false);
        fetchingRef.current = false;
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
        fetchingRef.current = false;
      }
    }
  }, [router, scrollToTopInstantly]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (restoreRafRef.current) {
        cancelAnimationFrame(restoreRafRef.current);
        restoreRafRef.current = null;
      }
      if (restoreScrollBehaviorRef.current !== null && typeof document !== "undefined") {
        document.documentElement.style.scrollBehavior = restoreScrollBehaviorRef.current;
        restoreScrollBehaviorRef.current = null;
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

  const categoryList = (variant) => (
    <div className="ah-cat-list" role="listbox" aria-label="Q&A categories">
      <button
        type="button"
        role="option"
        aria-selected={selectedCategory === "all"}
        onClick={() => handleCategoryChange("all")}
        onMouseDown={variant === "sidebar" ? (e) => e.preventDefault() : undefined}
        className={`ah-cat-item${selectedCategory === "all" ? " is-active" : ""}`}
      >
        <BookOpen size={15} aria-hidden="true" />
        <span>All Categories</span>
      </button>
      {filteredCategories.length > 0 ? (
        filteredCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="option"
            aria-selected={selectedCategory === cat.slug}
            onClick={() => handleCategoryChange(cat.slug)}
            onMouseDown={variant === "sidebar" ? (e) => e.preventDefault() : undefined}
            className={`ah-cat-item${selectedCategory === cat.slug ? " is-active" : ""}`}
          >
            <FolderOpen size={15} aria-hidden="true" />
            <span>{cat.title}</span>
          </button>
        ))
      ) : (
        <p className="ah-end-note">No categories found</p>
      )}
    </div>
  );

  const categorySearch = (inputRef) => (
    <div className="ah-search">
      <Search size={15} aria-hidden="true" />
      <input
        ref={inputRef}
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
  );

  return (
    <>
      <style jsx global>{`
        html, body {
          height: auto !important;
        }
        html {
          overflow-y: auto !important;
        }
      `}</style>

      <div style={{ visibility: isRestoringScroll ? "hidden" : "visible" }}>
        <Meta title="Q&A - Sheikh Assim Al Hakeem" description="Get answers to your Islamic questions from Sheikh Assim Al Hakeem" />
        <Header2 playlists={playlists} lectures={headerLectures} qna_categories={visibleQnaCategories} />

        <PageHero
          eyebrow="Questions & Answers"
          title={selectedCategory === "all" ? "Questions & Answers" : activeCategoryName}
          subtitle={selectedCategory === "all"
            ? "Answers from Sheikh Assim Al Hakeem to everyday questions on worship, family life, transactions and more."
            : `Answers from Sheikh Assim Al Hakeem on ${activeCategoryName}.`}
          breadcrumbs={selectedCategory === "all"
            ? [{ label: "Q&A" }]
            : [{ label: "Q&A", href: "/qna" }, { label: activeCategoryName }]}
        />

        <div className="ah ah-toolbar">
          <div className="ah-wrap">
            <div className="ah-search" role="search">
              <Search size={17} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search loaded questions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ah-input"
                aria-label="Search questions"
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")} className="ah-search__clear" aria-label="Clear search">
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCategoryDrawer(true)}
              className="ah-chip-btn ah-show-tablet"
              aria-label="Open categories list"
            >
              <List size={17} aria-hidden="true" />
              Categories
            </button>

            <span className="ah-active-cat">
              <span className="ah-hide-tablet">Category:</span>
              <span className="ah-pill">{activeCategoryName}</span>
            </span>

            {deferredSearchTerm.trim().length > 0 && (
              <p className="ah-toolbar__note" role="status" style={{ marginLeft: "auto" }}>
                <strong>{filteredQna.length}</strong> {filteredQna.length === 1 ? "result" : "results"}
              </p>
            )}
          </div>
        </div>

        <BottomSheet
          open={showCategoryDrawer}
          onClose={() => setShowCategoryDrawer(false)}
          label="Categories"
          title="All Categories"
          subtitle={`${visibleQnaCategories.length} categories`}
          closeLabel="Close categories"
          search={categorySearch(categorySearchInputRef)}
          focusRef={categorySearchInputRef}
          // Choosing a category scrolls the list back to the top
          restoreScroll={!isTransitioningCategory}
        >
          {categoryList("sheet")}
        </BottomSheet>

        <section className="ah ah-page" ref={containerRef}>
          <div className="ah-wrap ah-layout ah-layout--left">
            <aside className="ah-hide-tablet ah-sticky" aria-label="Categories">
              <div className="ah-cat-box">
                <div className="ah-cat-box__head">
                  <h2>Categories</h2>
                  <p>{visibleQnaCategories.length} categories</p>
                  {categorySearch(null)}
                </div>
                {categoryList("sidebar")}
              </div>
            </aside>

            <div style={{ minWidth: 0, position: "relative" }} ref={mainContentRef}>
              {isLoadingInitial && loadedQna.length === 0 && !isTransitioningCategory ? (
                <div className="ah-loading" role="status">
                  <span className="ah-spinner" aria-hidden="true" />
                  Loading questions...
                </div>
              ) : filteredQna.length > 0 || isTransitioningCategory ? (
                <div
                  key={selectedCategory}
                  className="ah-qlist"
                  style={{
                    opacity: isTransitioningCategory ? 0.4 : 1,
                    pointerEvents: isTransitioningCategory ? "none" : undefined,
                    transition: "opacity .3s ease",
                  }}
                >
                  {filteredQna.length > 0 && (
                    <>
                      {filteredQna.map((item) => (
                        <article key={`${selectedCategory}-${item.id}`} className="ah-qrow">
                          {item.categories?.[0] && <span className="ah-pill">{item.categories[0]}</span>}
                          <h3 style={{ marginTop: item.categories?.[0] ? 12 : 0 }}>
                            <Link
                              href={`/qna/answer/${item.id}`}
                              onPointerDown={cacheDataBeforeNavigation}
                              onClick={cacheDataBeforeNavigation}
                            >
                              {item.question}
                            </Link>
                          </h3>
                          <p>{item.content || item.answer}</p>
                          <Link
                            href={`/qna/answer/${item.id}`}
                            className="ah-link"
                            onPointerDown={cacheDataBeforeNavigation}
                            onClick={cacheDataBeforeNavigation}
                            tabIndex={-1}
                            aria-hidden="true"
                          >
                            Read full answer <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                        </article>
                      ))}

                      <div ref={sentinelRef} style={{ width: "100%", height: 16 }} />

                      <div ref={loadMoreRef} style={{ minHeight: 80 }}>
                        {isLoadingMore && hasMoreToLoad && (
                          <div className="ah-loading" role="status">
                            <span className="ah-spinner" aria-hidden="true" />
                            Loading more questions...
                          </div>
                        )}
                        {!hasMoreToLoad && loadedQna.length > 0 && !isLoadingMore && (
                          <p className="ah-end-note">All questions loaded · {totalLoadedCount.toLocaleString("en")} total</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="ah-empty">
                  <FolderOpen size={40} aria-hidden="true" />
                  <h2>No questions found</h2>
                  <p>Try a different search term or category.</p>
                  <button type="button" onClick={() => handleCategoryChange("all")} className="ah-btn ah-btn--primary">
                    <BookOpen size={16} aria-hidden="true" /> Browse all questions
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="ah">
          <button
            ref={backToTopRef}
            onClick={scrollToTop}
            type="button"
            className="ah-top-btn"
            aria-label="Back to top"
            style={{
              opacity: showBackToTop ? 1 : 0,
              visibility: showBackToTop ? "visible" : "hidden",
              transform: showBackToTop ? "translateY(0)" : "translateY(100px)",
              pointerEvents: showBackToTop ? "auto" : "none",
              transition: "opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease",
            }}
          >
            <ArrowUp size={20} aria-hidden="true" />
          </button>
        </div>

        <section className="ah ah-cta-band" aria-label="Ask a question">
          <div className="ah-wrap">
            <div>
              <h2>Have a question?</h2>
              <p>Questions are taken daily from 6 p.m. Makkah time until the quota fills.</p>
            </div>
            <div className="ah-cta-band__actions">
              <Link href="/ask-question" className="ah-btn ah-btn--white">Ask a Question</Link>
            </div>
          </div>
        </section>
      </div>
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