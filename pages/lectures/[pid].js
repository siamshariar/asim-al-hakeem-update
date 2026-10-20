import { server, youtube, constants } from "../../lib/config";
import { getAllPlaylists2, getYoutubeVideoListByUrl, getAllQnaCategory } from "../../lib/fetch";
import { useState, useEffect, useRef } from "react";
import Meta from "../../components/meta";
import VideoModal from "../../components/modal/VideoModal";
import { playWithSound } from "../../components/youtube-player";
import Header2 from "../../components/header1";
import PageHero from "../../components/page-hero";
import fetcher from "../../lib/lecturesFetcher";
import useOnScreen from "../../hooks/useOnScreen";
import useSWRInfinite from "swr/infinite";
import { Video, ChevronDown, List, X, Check, Search } from "lucide-react";
import { date as formatDate, youtubeViews, cleanVideoTitle } from "../../lib/format";
import { useRouter } from "next/router";

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

export default function LectureList({ initialVideos, initPlaylistId, playlists, qna_categories }) {
  const router = useRouter();
  const ref = useRef();
  const dropdownRef = useRef();
  const isVisible = useOnScreen(ref);
  const pageTitle = "Video Lectures";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(initPlaylistId);

  const { data, error, size, setSize, isValidating } = useSWRInfinite(
    (...args) => getKey(...args, initPlaylistId),
    fetcher,
    { initialData: initialVideos, revalidateOnMount: true }
  );

  const datas = data ? [].concat(...data) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === "undefined");
  const numberOfPages = data?.[0]?.videoLists ? data[0].videoLists.numberOfPages : 0;
  const isReachingEnd = size === numberOfPages;
  const isRefreshing = isValidating && data && data.length === size;
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  // Filter playlists based on search
  const filteredPlaylists = playlists?.playlists?.filter(p => 
    p.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get current playlist title
  const currentPlaylistTitle = playlists?.playlistsTitle?.[selectedPlaylist] || "Video Lectures";

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
    setSearchTerm("");
  }, [initPlaylistId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.body.addEventListener("mousedown", handleClickOutside);
    return () => document.body.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlaylistChange = (playlistId) => {
    setSelectedPlaylist(playlistId);
    setDropdownOpen(false);
    setSearchTerm("");
    router.push(`/lectures/${playlistId}`);
  };

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
        eyebrow="Lectures"
        title={currentPlaylistTitle}
        subtitle="Lectures and short answers from Sheikh Assim Al Hakeem's YouTube channel. Choose a series to browse its videos."
        breadcrumbs={[{ label: "Lectures", href: "/lectures/UUWsdcrre0WbCWML_PnuzoAg" }, { label: currentPlaylistTitle }]}
      >
        <div className="ah-select" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="ah-select__btn"
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
          >
            <span>
              <List size={18} aria-hidden="true" />
              <span>{currentPlaylistTitle}</span>
            </span>
            <ChevronDown size={18} aria-hidden="true" style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
          </button>

          {dropdownOpen && (
            <div className="ah-select__menu">
              <div className="ah-search">
                <Search size={16} aria-hidden="true" />
                <input
                  type="search"
                  placeholder="Search series"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ah-input"
                  aria-label="Search lecture series"
                  autoFocus
                />
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm("")} className="ah-search__clear" aria-label="Clear search">
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
              <div className="ah-cat-list" role="listbox" aria-label="Lecture series">
                {filteredPlaylists.length > 0 ? (
                  filteredPlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      type="button"
                      role="option"
                      aria-selected={playlist.id === selectedPlaylist}
                      onClick={() => handlePlaylistChange(playlist.id)}
                      className={`ah-cat-item${playlist.id === selectedPlaylist ? " is-active" : ""}`}
                    >
                      <Video size={15} aria-hidden="true" />
                      <span style={{ flex: 1 }}>{playlist.title}</span>
                      {playlist.id === selectedPlaylist && <Check size={15} aria-hidden="true" />}
                    </button>
                  ))
                ) : (
                  <p className="ah-end-note">No series found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </PageHero>

      <section className="ah ah-page" aria-label="Videos">
        <div className="ah-wrap">
          {datas.length > 0 && datas[0]?.videoLists?.videos?.length > 0 ? (
            <div className="ah-lec-grid ah-lec-grid--page">
              {datas.map((data) =>
                data.videoLists.videos.map((video) => {
                  const views = Number(data.videoLists.videoStats?.[video.id]) || 0;
                  return (
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
                  );
                })
              )}
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

    return {
      props: {
        initialVideos: videoLists ? [videoLists] : [{ videoLists: { videos: [], videoStats: {}, numberOfPages: 0 } }],
        initPlaylistId: playlistId,
        playlists: playlists || { playlists: [], playlistsTitle: {} },
        qna_categories: qna_categories || [],
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