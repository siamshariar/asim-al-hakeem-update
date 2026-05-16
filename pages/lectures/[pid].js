import { server, youtube, constants } from "../../lib/config";
import { getAllPlaylists2, getYoutubeVideoListByUrl, getAllQnaCategory } from "../../lib/fetch";
import { useState, useEffect, useRef } from "react";
import Meta from "../../components/meta";
import PostCardVideo2 from "../../components/card/post-card-video2";
import Loader from "../../components/loader";
import VideoModal from "../../components/modal/VideoModal";
import Header2 from "../../components/header1";
import fetcher from "../../lib/lecturesFetcher";
import useOnScreen from "../../hooks/useOnScreen";
import useSWRInfinite from "swr/infinite";
import { motion, AnimatePresence } from "framer-motion";
import { Video, ChevronDown, List, X, Check } from "lucide-react";
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
  const pageTitle = playlists?.playlistsTitle?.[initPlaylistId] || "Video Lectures";
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
        image={`${server}/img/id/default_share.png`}
        type="website"
      />

      <Header2
        playlists={playlists?.playlists || []}
        activePlaylistId={initPlaylistId}
        lectures={[]}
        qna_categories={qna_categories || []}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#24334d] via-[#2b3f5e] to-[#334a6b] py-6 sm:py-8 lg:py-10">
        <div className="container max-w-[1260px] mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Video size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#10b981]" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{pageTitle}</h1>
            </div>
            
            {/* Playlist Selector Dropdown - Overlay menu on top of content */}
            <div className="relative inline-block" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center justify-between w-[320px] sm:w-[350px] lg:w-[400px] max-w-full px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl text-white hover:bg-white/20 transition-all group"
              >
                <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
                  <List size={16} className="sm:w-[18px] sm:h-[18px] text-[#10b981]" />
                  <span className="text-sm sm:text-base font-medium whitespace-normal break-words text-left leading-snug">
                    {currentPlaylistTitle}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={18} className="sm:w-5 sm:h-5 text-white/70 group-hover:text-white" />
                </motion.div>
              </button>

              {/* Dropdown Menu - Overlay on top of page content */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-2 w-full sm:w-[350px] lg:w-[400px] bg-white rounded-lg sm:rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search playlists..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
                          autoFocus
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Playlist List */}
                    <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto">
                      {filteredPlaylists.length > 0 ? (
                        filteredPlaylists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => handlePlaylistChange(playlist.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                              playlist.id === selectedPlaylist ? 'bg-[#10b981]/5' : ''
                            }`}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <Video size={14} className={`flex-shrink-0 ${playlist.id === selectedPlaylist ? 'text-[#10b981]' : 'text-gray-400'}`} />
                              <span className={`whitespace-normal break-words ${playlist.id === selectedPlaylist ? 'text-[#10b981] font-medium' : 'text-[#1a1f2e]'}`}>
                                {playlist.title}
                              </span>
                            </div>
                            {playlist.id === selectedPlaylist && (
                              <Check size={16} className="text-[#10b981] flex-shrink-0" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No playlists found
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Videos Grid */}
      <section className="py-8 sm:py-8 lg:py-10 bg-gray-50 min-h-[60vh]">
        <div className="container max-w-[1260px] mx-auto px-4">
          {/* Results Count */}
          {/* <div className="mb-4 sm:mb-5">
            <p className="text-sm text-gray-500">
              {datas[0]?.videoLists?.videos?.length || 0} videos in this playlist
            </p>
          </div> */}

          {datas.length > 0 && datas[0]?.videoLists?.videos?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {datas.map((data) =>
                data.videoLists.videos.map((video) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}

                  >
                    <PostCardVideo2
                    video={{
                      id: video.id,
                      title: video.title,
                      image: video.image,
                      date: video.date,
                    }}
                    views={data.videoLists.videoStats?.[video.id]}
                    onClick={() => openModal(video)}
                  />
                  </motion.div>
                ))
              )}
            </div>
          ) : isLoadingInitialData ? (
            <div className="flex justify-center py-12 sm:py-16">
              <Loader />
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <Video size={40} className="sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500">No videos found in this playlist.</p>
            </div>
          )}

          {/* Load More Trigger */}
          <div ref={ref} className="mt-6 sm:mt-8">
            {isLoadingMore && !isLoadingInitialData && (
              <div className="flex items-center justify-center py-8 min-h-[80px]">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <svg className="animate-spin h-6 w-6 sm:h-7 sm:w-7 text-[#10b981]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span className="text-sm sm:text-base text-gray-500 font-medium">Loading more videos...</span>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={closeModal}
          videoId={selectedVideo.id}
          title={modalTitle}
          description={selectedVideo.description}
          playlistId={selectedVideo.playlistId}
        />
      )}
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