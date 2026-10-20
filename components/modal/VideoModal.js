import { useEffect } from 'react';
import styles from './Video.module.css';
import Share from '../../components/share';
import Meta from '../meta';
import YouTubePlayer from '../youtube-player';
import { generateVParam } from '../../pages/lectures/[pid]';
import { cleanVideoTitle } from '../../lib/format';

const UPLOADS_PLAYLIST_ID = 'UUWsdcrre0WbCWML_PnuzoAg';

// Playlist page that should open this video when the shared link is visited
const resolvePlaylistId = (playlistId) => {
    if (playlistId) return playlistId;
    if (typeof window !== 'undefined') {
        const match = window.location.pathname.match(/^\/lectures\/([^/?#]+)/);
        if (match) return match[1];
    }
    return UPLOADS_PLAYLIST_ID;
};

export default function VideoModal({ isOpen, onClose, videoId, title, playlistId, description }) {
    useEffect(() => {
        // Disable background scrolling while the player is open
        document.body.style.overflow = isOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKey = (e) => {
            if (e.key !== 'Escape') return;
            // Escape inside the share dialog closes only that dialog
            if (document.getElementById('share-dialog-title')) return;
            onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const displayTitle = cleanVideoTitle(title || '');
    const shareUrl = `/lectures/${resolvePlaylistId(playlistId)}?v=${generateVParam(videoId, title)}`;

    return (
        <>
            <Meta
                title={displayTitle || 'Lecture'}
                description={description || 'Lecture by Sheikh Assim Al Hakeem.'}
                url={shareUrl}
                type="video.other"
            />

            <section className={styles.modalWrapper} role="dialog" aria-modal="true" aria-label={displayTitle || 'Video player'}>
                <div className={styles.overlay}>
                    <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className={styles.close} onClick={onClose} aria-label="Close video" data-keep-muted></button>

                        <div className={styles.iframeContainer}>
                            <YouTubePlayer videoId={videoId} title={displayTitle} className={styles.iframe} />
                        </div>
                        <div className={styles.details}>
                            <h2 className={styles.title}>{displayTitle}</h2>
                            <div className={styles.share}>
                                <Share url={shareUrl} title={displayTitle} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
