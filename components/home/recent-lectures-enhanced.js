import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import VideoModal from '../modal/VideoModalRecent';
import { playWithSound } from '../youtube-player';
import { date as formatDate, youtubeViews, cleanVideoTitle } from '../../lib/format';

export const generateVParam = (videoID, title) => {
  const formattedTitle = encodeURIComponent((title || "").split(" ").join("=$"));
  return `${videoID}=$$=${formattedTitle}`;
};

const parseVParam = (slug) => {
  const [videoID, encodedTitle] = slug.split("=$$=");
  const videoTitle = decodeURIComponent(encodedTitle).split("=$").join(" ");
  return { videoID, videoTitle };
};

const formatLectureDate = (value) => {
  if (!value) return "";
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? value : formatDate(value);
};

export default function RecentLecturesEnhanced({ lectures }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalTitle, setModalTitle] = useState("");

  const list = Array.isArray(lectures?.videoLists) ? lectures.videoLists : lectures?.videoLists?.videos || [];
  const videos = list.slice(0, 4).map((video) => ({
    id: video.id,
    title: video.title,
    displayTitle: cleanVideoTitle(video.title),
    date: formatLectureDate(video.date),
    views: Number(lectures?.videoStats?.[video.id]) || 0,
    description: video.description,
  }));

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

  const openModal = useCallback((video) => {
    // Inside the tap, so a ready player starts it with sound (also on iOS)
    playWithSound(video.id);
    setSelectedVideo(video);
    setModalTitle(video.title);
    setIsModalOpen(true);

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("v", generateVParam(video.id, video.title));
    window.history.replaceState(null, "", `${window.location.pathname}?${urlParams.toString()}`);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedVideo(null);
    setModalTitle("");
    setIsModalOpen(false);

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("v");
    const query = urlParams.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ''}`);
  }, []);

  if (videos.length === 0) {
    return null;
  }

  return (
    <>
      <section className="ah ah-sec ah-sec--tight-top" aria-labelledby="lectures-title">
        <div className="ah-wrap">
          <div className="ah-sec-head">
            <div>
              <p className="ah-eyebrow">From the YouTube channel</p>
              <h2 id="lectures-title">Latest Lectures</h2>
            </div>
            <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg" className="ah-link">
              View all lectures
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="ah-lec-grid">
            {videos.map((video) => (
              <article key={video.id} className="ah-vcard">
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    openModal(video);
                  }}
                >
                  <div className="ah-vcard__thumb">
                    <img
                      src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                    />
                    <span className="ah-vcard__play" aria-hidden="true" />
                  </div>
                  <div className="ah-vcard__body">
                    <h3 className="ah-vcard__title">{video.displayTitle}</h3>
                    <p className="ah-vcard__meta">
                      {video.date}
                      {video.views > 0 && ` · ${youtubeViews(video.views)} views`}
                    </p>
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <VideoModal
        isOpen={isModalOpen && !!selectedVideo}
        onClose={closeModal}
        videoId={selectedVideo?.id}
        title={modalTitle}
        description={selectedVideo?.description}
        preloadVideoId={videos[0]?.id}
      />
    </>
  );
}
