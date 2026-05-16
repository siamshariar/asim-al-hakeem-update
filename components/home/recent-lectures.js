import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router'; // Import useRouter to handle navigation
import Link from 'next/link'; // Import Link for navigation
import VideoModal from '../modal/VideoModalRecent';
import { date as formatDate } from '../../lib/format'; // Import the date function
import PostCardRecent from '../card/post-card-recent';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

export const generateVParam = (videoID, title) => {
  const formattedTitle = encodeURIComponent((title || "").split(" ").join("=$"));
  return `${videoID}=$$=${formattedTitle}`;
};

const parseVParam = (slug) => {
  const [videoID, encodedTitle] = slug.split("=$$=");
  const videoTitle = decodeURIComponent(encodedTitle).split("=$").join(" ");
  return { videoID, videoTitle };
};

export default function RecentLecture() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal open state
  const [selectedVideo, setSelectedVideo] = useState(null); // State to store the selected video
  const [modalTitle, setModalTitle] = useState(""); // State to store the modal title
  const [catOpen, setCatOpen] = useState(false); // State for the category dropdown
  const [size, setSize] = useState(1); // State to manage pagination or data size
  
  const router = useRouter(); // Initialize router
  const catRef = useRef(null); // Reference to the category dropdown element
  
  useEffect(() => {
    fetchLatestVideos();
  }, []);

  const fetchLatestVideos = async () => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&type=video&maxResults=4`
      );
      const data = await response.json();
      if (data?.items?.length > 0) {
        const videoData = data.items.map((item) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          image: item.snippet.thumbnails.high.url,
          date: formatDate(item.snippet.publishedAt), // Format the date using the imported function
          views: 0, // Views will be fetched later
          description: item.snippet.description, // Adding description to the video data
        }));
        fetchVideoViews(videoData);
      } else {
        console.error('No videos found');
      }
    } catch (error) {
      console.error('Error fetching the latest videos:', error);
    } finally {
      setLoading(false); // Loading complete
    }
  };

  const fetchVideoViews = async (videos) => {
    const videoIds = videos.map((video) => video.id).join(',');
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=statistics`
      );
      const data = await response.json();

      const updatedVideos = videos.map((video, index) => ({
        ...video,
        views: data.items[index]?.statistics.viewCount || 0,
      }));

      setLectures(updatedVideos);
    } catch (error) {
      console.error('Error fetching video views:', error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("v");

    if (v) {
      const { videoID, videoTitle } = parseVParam(v);
      setModalTitle(videoTitle);
      openModal({ id: videoID, title: videoTitle });
    }
  }, []);

  // Function to handle when a video is clicked, open the modal with selected video data
  const openModal = ({ id, title, description }) => {
    setSelectedVideo({ id, title, description });
      setModalTitle(title); // Update the modal title with fetched title
    setIsModalOpen(true); // Open the modal

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("v", generateVParam(id, title));
    const basePath = window.location.pathname.startsWith("/lectures")
      ? window.location.pathname
      : `/lectures${window.location.pathname}`;
    const updatedUrl = `${basePath}?${urlParams.toString()}`;
    window.history.replaceState(null, "", updatedUrl);
  };

  const closeModal = () => {
    setSelectedVideo(null);
    setModalTitle("");
    setIsModalOpen(false);

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("v"); // Remove video ID from URL when closing the modal
    const basePath = window.location.pathname.replace("/lectures", "");
    const updatedUrl = `${basePath}${
      urlParams.toString() ? `?${urlParams.toString()}` : ""
    }`;
    window.history.replaceState(null, "", updatedUrl); // Update URL without video ID
    setIsModalOpen(false); // Close the modal
  };

  // Category dropdown and page size handling (simplified)
  const getCategorizedVideos = async (id, pageTitle) => {
    setCatOpen(false);
    setSize(1);
  };

  useEffect(() => {
    const handler = (e) => {
      // Close the category dropdown when clicking outside
      if (catRef.current != null && !catRef.current.contains(e.target)) {
        setCatOpen(false);
      }
    };

    document.body.addEventListener('mousedown', handler);

    // Cleanup event listener when the component is unmounted
    return () => document.body.removeEventListener('mousedown', handler);
  }, []);

  return (
    <section className="services">
      <div className="bg-services bg-cover bg-no-repeat max-w-[1466px] mx-4 xl:mx-auto rounded-[20px] xl:pt-[70px] px-6 xl:px-0 relative h-[368px] flex items-center xl:items-start z-10">
        <div className="container mx-auto">
          <div className="services__top flex items-start justify-between xl:flex-row xl:mb-[60px] gap-3">
            <h2 className="h2 flex-1 xl:mb-0 xl:text-left">
              Recent Lectures
            </h2>
            <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg" className="shrink-0 ml-auto">
              <button  className="inline-flex items-center text-white xl:text-right underline">
                View All
              </button>
           </Link>
          </div>
        </div>
      </div>

      <div className="container max-w-[1260px] mx-auto mt-8  xl:-mt-[144px] relative z-10 mb-12 lg:mb-14">
        <div className="grid grid-cols-1 mx-4 lg:mx-0 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {lectures.map((lecture) => (
            <PostCardRecent
              key={lecture.id}
              item={lecture}
              statistics={{ [lecture.id]: lecture.views }}
              videoId={lecture.id}
              playlistId="recent"
              onClick={openModal}
            />
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        videoId={selectedVideo?.id}
        title={modalTitle}
        id={selectedVideo?.id}
        description={selectedVideo?.description}
      />
    </section>
  );
}