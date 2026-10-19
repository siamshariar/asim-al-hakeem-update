import { useEffect } from 'react';
import styles from './Video.module.css';
import { server } from '../../lib/config';
import Share from '../../components/share';
import Meta from '../meta';
import { generateVParam } from '../../pages/lectures/[pid]';

export default function VideoModal({ isOpen, onClose, videoId, title, playlistId, description }) {
    useEffect(() => {
        // Disable background scrolling when the modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto'; // Cleanup scroll behavior
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null; // Render nothing if the modal is closed

    const handleCloseModal = (e) => {
        // Prevent the modal from closing if the content is clicked
        e.stopPropagation();
        onClose(); // Close modal when close button is clicked
    };

    const videoUrl = `/lectures/${playlistId}?v=${generateVParam(videoId, title)}`;

    return (
        <>
            <Meta
                title={title || 'Video Modal'}
                description={description || 'Watch this amazing video.'}
                url={`${server}/videos?v=${videoId}`}
                type="article"
            />
            
            <section className={styles.modalWrapper}>
                {/* Removed onClick from the overlay to prevent modal close on overlay click */}
                <div className={styles.overlay}>
                    <div
                        className={styles.content}
                        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when content is clicked
                    >
                        {/* Close icon button with direct onClick */}
                        <button type="button" className={styles.close} onClick={onClose} aria-label="Close video"></button>
                        
                        <div className={styles.iframeContainer}>
                            <iframe
                                className={styles.iframe}
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
                                title={title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className={styles.details}>
                            <h2 className={styles.title}>{title}</h2>
                            <div className={styles.share}>
                                <Share
                                    urlWeb={videoUrl}
                                    urlMobile={videoUrl} // Share URL for mobile
                                    title={title}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
