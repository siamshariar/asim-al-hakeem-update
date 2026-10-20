// YouTube embed that starts playing as soon as it opens.
// Browsers only autoplay with sound after the visitor has interacted with the page, so a video
// opened straight from a shared link starts muted and offers an unmute button instead of
// sitting paused.
import { useEffect, useRef, useState } from 'react';
import { VolumeX } from 'lucide-react';
import styles from './youtube-player.module.scss';

let apiPromise = null;

// Official YouTube IFrame Player API, loaded once and shared by every player
function loadYouTubeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (!apiPromise) {
        apiPromise = new Promise((resolve) => {
            const previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof previous === 'function') previous();
                resolve(window.YT);
            };
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.onerror = () => { apiPromise = null; };
            document.head.appendChild(script);
        });
    }
    return apiPromise;
}

export default function YouTubePlayer({ videoId, title, className }) {
    const iframeRef = useRef(null);
    const playerRef = useRef(null);
    // null until mounted: only the browser knows whether the visitor has interacted yet
    const [startMuted, setStartMuted] = useState(null);
    const [showUnmute, setShowUnmute] = useState(false);

    useEffect(() => {
        const activation = navigator.userActivation;
        setStartMuted(!(activation && activation.hasBeenActive));
        setShowUnmute(false);
    }, [videoId]);

    useEffect(() => {
        if (startMuted === null) return undefined;
        let cancelled = false;
        let fallbackTimer;
        loadYouTubeApi().then((YT) => {
            if (cancelled || !iframeRef.current) return;
            const player = new YT.Player(iframeRef.current, {
                events: {
                    onReady: () => {
                        if (cancelled) return;
                        playerRef.current = player;
                        if (player.isMuted()) {
                            setShowUnmute(true);
                            return;
                        }
                        // Sound can still be refused (iOS needs a tap inside the player); play muted instead
                        fallbackTimer = setTimeout(() => {
                            const state = player.getPlayerState();
                            if (state === YT.PlayerState.UNSTARTED || state === YT.PlayerState.CUED) {
                                player.mute();
                                player.playVideo();
                                setShowUnmute(true);
                            }
                        }, 2500);
                    },
                },
            });
        });
        return () => {
            cancelled = true;
            clearTimeout(fallbackTimer);
            playerRef.current = null;
        };
    }, [startMuted, videoId]);

    // Hide the button once sound is turned on from YouTube's own volume control
    useEffect(() => {
        if (!showUnmute) return undefined;
        const poll = setInterval(() => {
            const player = playerRef.current;
            if (player && !player.isMuted()) setShowUnmute(false);
        }, 1000);
        return () => clearInterval(poll);
    }, [showUnmute]);

    const unmute = () => {
        const player = playerRef.current;
        if (!player) return;
        player.unMute();
        player.playVideo();
        setShowUnmute(false);
    };

    if (startMuted === null) return null;

    const params = new URLSearchParams({
        autoplay: '1',
        mute: startMuted ? '1' : '0',
        playsinline: '1',
        rel: '0',
        enablejsapi: '1',
        origin: window.location.origin,
    });

    return (
        <>
            <iframe
                ref={iframeRef}
                className={className}
                src={`https://www.youtube.com/embed/${videoId}?${params}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
            {showUnmute && (
                <button type="button" className={styles.unmute} onClick={unmute}>
                    <VolumeX aria-hidden="true" />
                    Tap to unmute
                </button>
            )}
        </>
    );
}
