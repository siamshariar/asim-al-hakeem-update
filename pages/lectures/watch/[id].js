import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Eye, ArrowRight } from 'lucide-react';
import Header2 from '../../../components/header1';
import Meta from '../../../components/meta';
import PageHero from '../../../components/page-hero';
import ShareLinks from '../../../components/share-links';
import { server, youtube } from '../../../lib/config';
import { youtubeViews, cleanVideoTitle } from '../../../lib/format';
import { getAllPlaylists2, getAllQnaCategory, getHeaderLectures } from '../../../lib/fetch'; 

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || youtube.key;

export default function LectureVideo({ playlists, headerLectures, qna_categories, videoData }) {
  const router = useRouter();
  const { id } = router.query;
  const [video, setVideo] = useState(videoData);
  const [loading, setLoading] = useState(!videoData);

  useEffect(() => {
    if (!videoData && id) {
      const fetchVideoData = async () => {
        try {
          const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: {
              part: 'snippet,statistics',
              id,
              key: API_KEY,
            },
          });

          const video = videoResponse.data.items[0];
          const channelId = video.snippet.channelId;

          const channelResponse = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
            params: {
              part: 'snippet',
              id: channelId,
              key: API_KEY,
            },
          });

          const channel = channelResponse.data.items[0];
          setVideo({
            title: video.snippet.title,
            views: video.statistics.viewCount,
            likes: video.statistics.likeCount,
            channelTitle: video.snippet.channelTitle,
            description: video.snippet.description,
            channelImage: channel.snippet.thumbnails.default.url,
          });
        } catch (error) {
          console.error('Error fetching video data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchVideoData();
    }
  }, [id, videoData]);

  if (!video) {
    return (
      <>
        <Header2 playlists={playlists} headerLectures={headerLectures} qna_categories={qna_categories} />
        <section className="ah ah-error">
          <div className="ah-wrap">
            {loading ? (
              <div className="ah-loading" role="status">
                <span className="ah-spinner" aria-hidden="true" />
                Loading lecture...
              </div>
            ) : (
              <>
                <h1>Lecture not available</h1>
                <p>This video could not be loaded. You can still watch it on YouTube or browse the other lectures.</p>
                <div className="ah-actions">
                  {id && <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer" className="ah-btn ah-btn--primary">Watch on YouTube</a>}
                  <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg" className="ah-btn ah-btn--outline">All Lectures</Link>
                </div>
              </>
            )}
          </div>
        </section>
      </>
    );
  }

  const title = cleanVideoTitle(video.title);

  return (
    <>
      <Meta
        title={title}
        description={(video.description || "Lecture by Sheikh Assim Al Hakeem").slice(0, 160)}
        url={`${server}/lectures/watch/${id}`}
        image={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        type="video.other"
      />
      <Header2 playlists={playlists} headerLectures={headerLectures} qna_categories={qna_categories} />

      <PageHero
        eyebrow="Lecture"
        title={title}
        narrow
        longTitle={title.length > 70}
        breadcrumbs={[{ label: "Lectures", href: "/lectures/UUWsdcrre0WbCWML_PnuzoAg" }, { label: title }]}
      >
        {video.views && (
          <div className="ah-meta">
            <span><Eye size={16} aria-hidden="true" />{youtubeViews(video.views)} views</span>
          </div>
        )}
      </PageHero>

      <section className="ah ah-page ah-page--narrow">
        <div className="ah-wrap">
          <div className="ah-player">
            <iframe
              src={`https://www.youtube.com/embed/${id}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>

          {video.description && (
            <div className="ah-prose ah-desc" style={{ marginTop: 32 }}>
              <p>{video.description}</p>
            </div>
          )}

          <div className="ah-footnote" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16 }}>
            <ShareLinks url={`${server}/lectures/watch/${id}`} title={title} label="Share this lecture" />
            <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg" className="ah-link">All lectures <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}



export const getStaticPaths = async () => {

  const videoIds = []; 
  return {
    paths: videoIds.map(id => ({ params: { id } })),
    fallback: 'blocking', 
  };
};

export const getStaticProps = async ({ params }) => {
  const playlists = await getAllPlaylists2();
  const headerLectures = await getHeaderLectures();
  const qna_categories = await getAllQnaCategory();

  const { id } = params;

  let videoData = null;
  if (id) {
    try {
      const videoResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: 'snippet,statistics',
          id,
          key: API_KEY,
        },
      });

      const video = videoResponse.data.items[0];
      const channelId = video.snippet.channelId;

      const channelResponse = await axios.get(`https://www.googleapis.com/youtube/v3/channels`, {
        params: {
          part: 'snippet',
          id: channelId,
          key: API_KEY,
        },
      });

      const channel = channelResponse.data.items[0];
      videoData = {
        title: video.snippet.title,
        views: video.statistics.viewCount,
        likes: video.statistics.likeCount,
        channelTitle: video.snippet.channelTitle,
        description: video.snippet.description,
        channelImage: channel.snippet.thumbnails.default.url,
      };
    } catch (error) {
      console.error('Error fetching video data:', error);
    }
  }

  return {
    props: {
      playlists: playlists.playlists,
      headerLectures,
      qna_categories,
      videoData,
    },
  };
};
