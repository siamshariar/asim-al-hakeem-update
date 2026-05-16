import Image from 'next/image';
import { date, youtubeViews } from '../../lib/format';
import { useState, useEffect } from "react";
import { generateVParam } from '../../pages/lectures/[pid]';

export default function PostCardVideo2({ video, views, playlistId, onClick }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const id = video?.id;
    const image = video?.image;
    const title = video?.title;
    const publishedAt = date(video?.date);
    const viewCount = youtubeViews(views);
    const [pathname, setPathname] = useState("");

    const getVideoUrl = () => pathname || '#';

    useEffect(() => {
      if (typeof window !== "undefined" && id && title && playlistId) {
        const generatedPathname = `/lectures/${playlistId}?v=${generateVParam(id, title)}`;
        setPathname(generatedPathname);
      }
    }, [id, title, playlistId]);
	

    const handleVideoClick = () => {
        setIsModalOpen(true);
        if (onClick) {
            onClick({ id, title, playlistId, viewCount, publishedAt });
        }
    };


    const handleClick = (event) => {
        event.preventDefault();
        handleVideoClick();
    };

    if (!video) {
      return null;
    }

    return (
        <div className="card card-r pc-video" onClick={handleClick}> 
            <div className="card-image">
                <a className="image-r"
                  href={getVideoUrl()}
                  onClick={(e) => {
                      if (!isModalOpen) {
                          e.preventDefault();
                          handleVideoClick();
                      }
                  }}
                >
                <Image
                    src={image ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : `/img/post/youtube-default.jpg`}
                    alt={title || 'YouTube Video'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{
                        objectFit: 'cover',
                        objectPosition: 'center center',
                    }}
                    loading="eager"
                    unoptimized
                />


                </a>
            </div>

            <div className="card-content">
                <a
                    href={getVideoUrl()}
                    onClick={(e) => {
                        if (!isModalOpen) {
                            e.preventDefault();
                            handleVideoClick();
                        }
                    }}
                    className="heading-r"
                >
                    {title}
                </a>
                <div className="data-line">
                    <span className="view-r">{viewCount} views</span>
                    <span className="date-r">{publishedAt}</span>
                </div>
            </div>
        </div>
    );
}
