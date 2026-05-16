import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Eye, Calendar, ArrowRight } from 'lucide-react';
import VideoModal from '../modal/VideoModalRecent';
import { date as formatDate, youtubeViews } from '../../lib/format';

export const generateVParam = (videoID, title) => {
  const formattedTitle = encodeURIComponent((title || "").split(" ").join("=$"));
  return `${videoID}=$$=${formattedTitle}`;
};

const parseVParam = (slug) => {
  const [videoID, encodedTitle] = slug.split("=$$=");
  const videoTitle = decodeURIComponent(encodedTitle).split("=$").join(" ");
  return { videoID, videoTitle };
};

export default function RecentLecturesEnhanced({ lectures }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  useEffect(() => {
    if (lectures?.videoLists && Array.isArray(lectures.videoLists)) {
      const videoData = lectures.videoLists.slice(0, 4).map(video => ({
        id: video.id,
        title: video.title,
        image: video.image,
        date: formatLectureDate(video.date),
        views: lectures.videoStats?.[video.id] || 0,
        description: video.description,
      }));
      setVideos(videoData);
      setLoading(false);
    } else if (lectures?.videoLists?.videos) {
      const videoData = lectures.videoLists.videos.slice(0, 4).map(video => ({
        id: video.id,
        title: video.title,
        image: video.image,
        date: formatLectureDate(video.date),
        views: lectures.videoStats?.[video.id] || 0,
        description: video.description,
      }));
      setVideos(videoData);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [lectures]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");
    if (v) {
      const { videoID, videoTitle } = parseVParam(v);
      setModalTitle(videoTitle);
      setSelectedVideo({ id: videoID, title: videoTitle });
      setIsModalOpen(true);
    }
  }, []);

  // Instant open - no delay
  const openModal = useCallback((video) => {
    setSelectedVideo(video);
    setModalTitle(video.title);
    setIsModalOpen(true);
    
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("v", generateVParam(video.id, video.title));
    const updatedUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState(null, "", updatedUrl);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedVideo(null);
    setModalTitle("");
    setIsModalOpen(false);
    
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("v");
    const updatedUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    window.history.replaceState(null, "", updatedUrl);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const formatLectureDate = (value) => {
    if (!value) return "";
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? value : formatDate(value);
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f0f9ff]">
        <div className="container max-w-[1260px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
            <div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-40 sm:h-44 lg:h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-3 sm:p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <>
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f0f9ff] shadow-sm">
        <div className="container max-w-[1260px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-start justify-between gap-3 mb-6 sm:mb-8"
          >
            <div className="min-w-0 flex-1">
              <span className="text-[#10b981] font-semibold uppercase tracking-wider text-xs sm:text-sm">Latest Content</span>
              <h2 className="section-title text-[#1a1f2e] mt-1 sm:mt-2">Recent Lectures</h2>
            </div>
            <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg" className="shrink-0 ml-auto">
              <motion.button
                whileHover={{ x: 5 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[#10b981] font-medium hover:text-[#059669] transition-colors text-sm"
              >
                <span>View All Lectures</span>
                <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
          >
            {videos.map((video) => (
              <motion.div
                key={video.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="card card-r pc-video group hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => openModal(video)}
              >
                <div className="card-image">
                  <div className="image-r">
                    <img
                      src={video.id ? `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg` : `/img/post/youtube-default.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>
                <div className="card-content">
                  <a className="heading-r">
                    {video.title}
                  </a>
                  <div className="data-line">
                    <span>{youtubeViews(video.views)} views</span>
                    <span>{video.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modal rendered conditionally - opens instantly */}
      {isModalOpen && selectedVideo && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={closeModal}
          videoId={selectedVideo.id}
          title={modalTitle}
          description={selectedVideo.description}
        />
      )}
    </>
  );
}