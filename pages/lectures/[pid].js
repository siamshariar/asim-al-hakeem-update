import { server, youtube, constants } from "../../lib/config";
import { getAllPlaylists2, getYoutubeVideoListByUrl, getAllQnaCategory, getBooks } from "../../lib/fetch";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Meta from "../../components/meta";
import VideoModal from "../../components/modal/VideoModal";
import { playWithSound } from "../../components/youtube-player";
import Header2 from "../../components/header1";
import PageHero from "../../components/page-hero";
import BottomSheet from "../../components/bottom-sheet";
import fetcher from "../../lib/lecturesFetcher";
import useOnScreen from "../../hooks/useOnScreen";
import useSWRInfinite from "swr/infinite";
import { Video, ChevronDown, ListVideo, LayoutGrid, X, Check, Search, BookOpen } from "lucide-react";
import { date as formatDate, youtubeViews, cleanVideoTitle, playlistIdFromLink } from "../../lib/format";
import { useRouter } from "next/router";

// The channel's uploads playlist: every lecture, newest first
const ALL_LECTURES_ID = youtube.uploadPlaylistID;
const ALL_LECTURES_HREF = `/lectures/${ALL_LECTURES_ID}`;

// Load the next page shortly before the end of the list, and also when a quick flick (or the
// End key) lands in the footer below it: on phones the footer is taller than the screen
const LOAD_MORE_AREA = { rootMargin: "5000px 0px 300px 0px" };

const getKey = (pageIndex, previousPageData, playlistId) => {
  let pageToken = "";
  if (previousPageData !== null && previousPageData.videoLists?.nextPageToken) {
    pageToken = `&pageToken=${previousPageData.videoLists.nextPageToken}`;
  }
  return `${youtube.url}/playlistItems?key=${youtube.key}&part=snippet&playlistId=${playlistId}&maxResults=${constants.DEFAULT_PAGE_LIMIT}${pageToken}`;
};

export const generateVParam = (videoID, title) => {
  const formattedTitle = encodeURIComponent((title || "").split(" ").join("=$"));
  return `${videoID}=$$=${formattedTitle}`;
};

const parseVParam = (slug) => {
  const [videoID, encodedTitle] = slug.split("=$$=");
  const videoTitle = decodeURIComponent(encodedTitle).split("=$").join(" ");
  return { videoID, videoTitle };
};

export default function LectureList({ initialVideos, initPlaylistId, playlists, qna_categories, companionBook }) {
  const router = useRouter();
  const ref = useRef();
  const dropdownRef = useRef();
  const triggerRef = useRef(null);
  const menuSearchRef = useRef(null);
  const sheetSearchRef = useRef(null);
  const isVisible = useOnScreen(ref, LOAD_MORE_AREA);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(initPlaylistId);

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    (...args) => getKey(...args, initPlaylistId),
    fetcher,
    {
      // SWR 2 names the server-rendered first page `fallbackData` (it ignores the old `initialData`).
      // That page is shown as is (it regenerates hourly): refetching it on load would push every card
      // along by one whenever the channel has uploaded since, so it is only fetched if the server had none
      fallbackData: initialVideos,
      revalidateOnMount: !initialVideos?.[0]?.videoLists?.videos?.length,
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    }
  );

  const datas = data ? [].concat(...data) : [];

  // One card per video: a later page fetched after a new upload can repeat the previous page's last video
  const seenVideos = new Set();
  const lectures = datas.flatMap((page) => (page?.videoLists?.videos || [])
    .filter((video) => !seenVideos.has(video.id) && seenVideos.add(video.id))
    .map((video) => ({ video, views: Number(page.videoLists.videoStats?.[video.id]) || 0 })));
  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === "undefined");
  const numberOfPages = data?.[0]?.videoLists ? data[0].videoLists.numberOfPages : 0;
  const isReachingEnd = size === numberOfPages;
  const isRefreshing = isValidating && data && data.length === size;
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  // "All Lectures" is pinned above the series list; search only filters the series
  const series = playlists?.playlists?.filter((p) => p.id !== ALL_LECTURES_ID) || [];
  const filteredSeries = series.filter((p) => p.title?.toLowerCase().includes(searchTerm.trim().toLowerCase()));

  const isAllLectures = selectedPlaylist === ALL_LECTURES_ID;
  const currentPlaylistTitle = isAllLectures ? "All Lectures" : playlists?.playlistsTitle?.[selectedPlaylist] || "Lecture Series";
  const pageTitle = isAllLectures ? "All Lectures" : `${currentPlaylistTitle} - Lecture Series`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    if (v) {
      const { videoID, videoTitle } = parseVParam(v);
      setModalTitle(videoTitle);
      setSelectedVideo({ id: videoID, title: videoTitle });
    }
  }, []);

  useEffect(() => {
    setSelectedPlaylist(initPlaylistId);
    setDropdownOpen(false);
    setSheetOpen(false);
    setSearchTerm("");
  }, [initPlaylistId]);

  // Only while the desktop menu is open (the bottom sheet shares the search term)
  useEffect(() => {
    if (!dropdownOpen) return undefined;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.body.addEventListener("mousedown", handleClickOutside);
    return () => document.body.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Centre the current choice in the list when the menu or sheet opens (scrolls the list, never the page)
  useEffect(() => {
    if (!dropdownOpen && !sheetOpen) return undefined;
    const frame = requestAnimationFrame(() => {
      const list = document.querySelector(sheetOpen ? ".ah-sheet .ah-cat-list" : ".ah-select__menu .ah-cat-list");
      const active = list?.querySelector(".ah-cat-item.is-active");
      if (!active) return;
      const listBox = list.getBoundingClientRect();
      const activeBox = active.getBoundingClientRect();
      list.scrollTop += activeBox.top - listBox.top - (listBox.height - activeBox.height) / 2;
    });
    return () => cancelAnimationFrame(frame);
  }, [dropdownOpen, sheetOpen]);

  // Phones and tablets get the same bottom sheet as the Q&A categories; desktop keeps the dropdown
  const togglePicker = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setSheetOpen(true);
      return;
    }
    setDropdownOpen((open) => !open);
    setSearchTerm("");
  };

  const closeDropdown = (returnFocus) => {
    setDropdownOpen(false);
    setSearchTerm("");
    if (returnFocus) triggerRef.current?.focus();
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setSearchTerm("");
  };

  const handlePlaylistChange = (playlistId) => {
    // A second choice made while the first one is still loading must still navigate
    const alreadyShowing = playlistId === initPlaylistId && playlistId === selectedPlaylist;
    setSelectedPlaylist(playlistId);
    setDropdownOpen(false);
    setSheetOpen(false);
    setSearchTerm("");
    if (!alreadyShowing) router.push(`/lectures/${playlistId}`);
  };

  // Arrow keys move between the options; Up from the first option returns to the search field
  const handleListKeyDown = (searchRef) => (e) => {
    const options = [...e.currentTarget.querySelectorAll('[role="option"]')];
    const index = options.indexOf(document.activeElement);
    let next = null;
    if (e.key === "ArrowDown") next = options[Math.min(index + 1, options.length - 1)];
    if (e.key === "ArrowUp") next = index <= 0 ? searchRef.current : options[index - 1];
    if (e.key === "Home") next = options[0];
    if (e.key === "End") next = options[options.length - 1];
    if (next) {
      e.preventDefault();
      next.focus();
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.currentTarget.closest(".ah-select__menu, .ah-sheet")?.querySelector('[role="option"]')?.focus();
    }
    if (e.key === "Enter" && searchTerm.trim() && filteredSeries.length) {
      e.preventDefault();
      handlePlaylistChange(filteredSeries[0].id);
    }
  };

  const seriesSearch = (inputRef, autoFocus) => (
    <div className="ah-search">
      <Search size={16} aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        placeholder="Search series"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleSearchKeyDown}
        className="ah-input"
        aria-label="Search lecture series"
        autoFocus={autoFocus}
      />
      {searchTerm && (
        <button type="button" onClick={() => setSearchTerm("")} className="ah-search__clear" aria-label="Clear search">
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );

  const seriesList = (searchRef) => (
    <div className="ah-cat-list" role="listbox" aria-label="Lectures" onKeyDown={handleListKeyDown(searchRef)}>
      <button
        type="button"
        role="option"
        aria-selected={isAllLectures}
        onClick={() => handlePlaylistChange(ALL_LECTURES_ID)}
        className={`ah-cat-item ah-cat-item--all${isAllLectures ? " is-active" : ""}`}
      >
        <LayoutGrid size={16} aria-hidden="true" />
        <span className="ah-cat-item__text">
          All Lectures
          <small>Every video, newest first</small>
        </span>
        {isAllLectures && <Check size={15} aria-hidden="true" />}
      </button>
      <div role="group" aria-label="Lecture series">
        <p className="ah-cat-group" aria-hidden="true">
          Lecture series <span>{series.length}</span>
        </p>
        {filteredSeries.length > 0 ? (
          filteredSeries.map((playlist) => (
            <button
              key={playlist.id}
              type="button"
              role="option"
              aria-selected={playlist.id === selectedPlaylist}
              onClick={() => handlePlaylistChange(playlist.id)}
              className={`ah-cat-item${playlist.id === selectedPlaylist ? " is-active" : ""}`}
            >
              <ListVideo size={15} aria-hidden="true" />
              <span className="ah-cat-item__text">{playlist.title}</span>
              {playlist.id === selectedPlaylist && <Check size={15} aria-hidden="true" />}
            </button>
          ))
        ) : (
          <p className="ah-end-note">No series found</p>
        )}
      </div>
    </div>
  );

  const openModal = (item) => {
    const id = item?.snippet?.resourceId?.videoId || item?.id;
    const title = item?.snippet?.title || item?.title || "Untitled";
    const description = item?.snippet?.description || item?.description || "";
    
    if (!id) return;

    // Inside the tap, so a ready player starts it with sound (also on iOS)
    playWithSound(id);

    setSelectedVideo({ id, title, description, playlistId: initPlaylistId });
    setModalTitle(title);
    
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("v", generateVParam(id, title));
    const updatedUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState(null, "", updatedUrl);
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setModalTitle("");
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("v");
    const updatedUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    window.history.replaceState(null, "", updatedUrl);
  };

  useEffect(() => {
    if (isVisible && !isReachingEnd && !isLoadingMore) {
      setSize(size + 1);
    }
  }, [isVisible, isReachingEnd, isLoadingMore, size, setSize]);

  return (
    <>
      <Meta
        title={pageTitle}
        description={`Watch ${pageTitle} by Sheikh Assim Al Hakeem. Authentic Islamic lectures and guidance.`}
        url={`${server}/lectures/${initPlaylistId}`}
        image={`${server}/img/id/default_share.jpeg`}
        type="website"
      />

      <Header2
        playlists={playlists?.playlists || []}
        activePlaylistId={initPlaylistId}
        lectures={[]}
        qna_categories={qna_categories || []}
      />

      <PageHero
        eyebrow={isAllLectures ? "Lectures" : "Lecture series"}
        title={currentPlaylistTitle}
        subtitle={isAllLectures ? (
          "Every lecture and short answer from Sheikh Assim Al Hakeem's YouTube channel, newest first. Choose a series to see only its lectures."
        ) : (
          <>Lectures in this series from Sheikh Assim Al Hakeem. Choose another series, or browse <Link href={ALL_LECTURES_HREF}>all lectures</Link>.</>
        )}
        breadcrumbs={isAllLectures
          ? [{ label: "Lectures" }]
          : [{ label: "Lectures", href: ALL_LECTURES_HREF }, { label: currentPlaylistTitle }]}
      >
        <div
          className="ah-select"
          ref={dropdownRef}
          onKeyDown={(e) => {
            if (e.key === "Escape" && dropdownOpen) closeDropdown(true);
          }}
          onBlur={(e) => {
            if (dropdownOpen && e.relatedTarget && !e.currentTarget.contains(e.relatedTarget)) closeDropdown(false);
          }}
        >
          <button
            ref={triggerRef}
            type="button"
            onClick={togglePicker}
            className="ah-select__btn"
            aria-expanded={dropdownOpen || sheetOpen}
            aria-haspopup="listbox"
          >
            <span className="ah-select__current">
              {isAllLectures ? <LayoutGrid size={18} aria-hidden="true" /> : <ListVideo size={18} aria-hidden="true" />}
              <span className="ah-select__text">
                <small>Showing</small>
                <span>{currentPlaylistTitle}</span>
              </span>
            </span>
            <ChevronDown size={18} aria-hidden="true" className="ah-select__chevron" />
          </button>

          {dropdownOpen && (
            <div className="ah-select__menu">
              {seriesSearch(menuSearchRef, true)}
              {seriesList(menuSearchRef)}
            </div>
          )}
        </div>

        {companionBook && (
          <div className="ah-meta">
            <span>
              <BookOpen size={16} aria-hidden="true" />
              <span>Companion book: <Link href={`/books/${companionBook.slug}`}>{companionBook.title}</Link></span>
            </span>
          </div>
        )}
      </PageHero>

      <BottomSheet
        open={sheetOpen}
        onClose={closeSheet}
        label="Lectures"
        title="Lectures"
        subtitle={`All lectures or one of ${series.length} series`}
        closeLabel="Close lecture list"
        search={seriesSearch(sheetSearchRef, false)}
        focusRef={sheetSearchRef}
      >
        {seriesList(sheetSearchRef)}
      </BottomSheet>

      <section className="ah ah-page" aria-label="Videos">
        <div className="ah-wrap">
          {lectures.length > 0 ? (
            <div className="ah-lec-grid ah-lec-grid--page">
              {lectures.map(({ video, views }) => (
                <article key={video.id} className="ah-vcard">
                  <a
                    href={`/lectures/${initPlaylistId}?v=${generateVParam(video.id, video.title)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      openModal(video);
                    }}
                  >
                    <div className="ah-vcard__thumb">
                      <img src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} alt="" loading="lazy" />
                      <span className="ah-vcard__play" aria-hidden="true" />
                    </div>
                    <div className="ah-vcard__body">
                      <h3 className="ah-vcard__title">{cleanVideoTitle(video.title)}</h3>
                      <p className="ah-vcard__meta">
                        {video.date ? formatDate(video.date) : ""}
                        {views > 0 && ` · ${youtubeViews(views)} views`}
                      </p>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          ) : isLoadingInitialData ? (
            <div className="ah-loading" role="status">
              <span className="ah-spinner" aria-hidden="true" />
              Loading videos...
            </div>
          ) : (
            <div className="ah-empty">
              <Video size={40} aria-hidden="true" />
              <h2>No videos found</h2>
              <p>This series has no public videos yet.</p>
            </div>
          )}

          <div ref={ref} style={{ minHeight: 40 }}>
            {isLoadingMore && !isLoadingInitialData && (
              <div className="ah-loading" role="status">
                <span className="ah-spinner" aria-hidden="true" />
                Loading more videos...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={closeModal}
        videoId={selectedVideo?.id}
        title={modalTitle}
        description={selectedVideo?.description}
        playlistId={selectedVideo?.playlistId}
      />
    </>
  );
}

export async function getStaticProps({ params }) {
  const playlistId = params.pid;
  const url = `${youtube.url}/playlistItems?key=${youtube.key}&part=snippet&playlistId=${playlistId}&maxResults=${constants.DEFAULT_PAGE_LIMIT}`;
  
  try {
    const videoLists = await getYoutubeVideoListByUrl(url);
    const playlists = await getAllPlaylists2();
    const qna_categories = await getAllQnaCategory();
    // A series that explains one of the books links back to it
    const book = (getBooks() || []).find((item) => playlistIdFromLink(item.playlistLink) === playlistId);

    return {
      props: {
        initialVideos: videoLists ? [videoLists] : [{ videoLists: { videos: [], videoStats: {}, numberOfPages: 0 } }],
        initPlaylistId: playlistId,
        playlists: playlists || { playlists: [], playlistsTitle: {} },
        qna_categories: qna_categories || [],
        companionBook: book ? { slug: book.slug, title: book.title } : null,
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Error fetching lectures:', error);
    return {
      props: {
        initialVideos: [{ videoLists: { videos: [], videoStats: {}, numberOfPages: 0 } }],
        initPlaylistId: playlistId,
        playlists: { playlists: [], playlistsTitle: {} },
        qna_categories: [],
      },
      revalidate: 3600,
    };
  }
}

export async function getStaticPaths() {
  try {
    const playlists = await getAllPlaylists2();
    const paths = playlists?.playlists?.map((playlist) => ({
      params: { pid: playlist.id },
    })) || [];

    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    return {
      paths: [],
      fallback: "blocking",
    };
  }
}