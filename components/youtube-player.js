// YouTube player for lectures. Starts playing as soon as it opens.
// Browsers only allow sound after the visitor has interacted with the page, and iOS/Safari only
// when the tap reaches a player that is already loaded. So:
// - a lecture opened from a card starts with sound: playWithSound() hands the tap to the page's
//   ready player (where needed, pages with cards load one in advance, see needsPreloadedPlayer)
// - a lecture opened straight from a shared link starts muted, and the sound comes on with the
//   visitor's first tap, click or key press, on the video or anywhere else.
import { useCallback, useEffect, useRef, useState } from 'react';
import { VolumeX } from 'lucide-react';
import styles from './youtube-player.module.scss';

let apiPromise = null;
let embedCount = 0;

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

// The page's player once it is ready (kept between lectures) and the lecture loaded in it
const shared = { player: null, videoId: null };

// Call from the click/tap that opens a lecture, before showing the player. Starting it on a
// player that is already loaded passes the tap along, so even iOS plays it with sound.
// Returns false when no player is ready yet; the player then starts the lecture itself.
export function playWithSound(videoId) {
    const { player } = shared;
    if (!player) return false;
    shared.videoId = videoId;
    player.unMute();
    player.loadVideoById(videoId);
    return true;
}

// Safari and every iOS browser refuse sound in a player created after the tap
export function needsPreloadedPlayer() {
    const ua = navigator.userAgent;
    const iOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const safari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS|Android/.test(ua);
    return iOS || safari;
}

// What the iframe is created with; later lectures load into it through the API
function buildEmbed(videoId, autoplay) {
    const activation = navigator.userActivation;
    embedCount += 1;
    return { id: embedCount, videoId, autoplay, startMuted: autoplay && !(activation && activation.hasBeenActive) };
}

export default function YouTubePlayer({ videoId, title, className, active = true }) {
    const iframeRef = useRef(null);
    const playerRef = useRef(null);
    const activeRef = useRef(active);
    const checkTimer = useRef(null);
    // null until mounted: only the browser knows whether the visitor has interacted yet
    const [embed, setEmbed] = useState(null);
    const [showUnmute, setShowUnmute] = useState(false);

    useEffect(() => {
        if (!embed) setEmbed(buildEmbed(videoId, active));
    }, [embed, videoId, active]);

    // Sound can still be refused (iOS without a ready player): play muted instead of staying
    // paused, and let the next tap turn the sound on
    const playMuted = useCallback(() => {
        const player = playerRef.current;
        if (!player || !activeRef.current) return;
        player.mute();
        player.playVideo();
        setShowUnmute(true);
    }, []);

    // Backup for browsers that don't report the refusal: check once it has had time to start,
    // and again while it is still loading (slow connections)
    const watchForRefusedSound = useCallback(() => {
        clearTimeout(checkTimer.current);
        let checks = 0;
        const check = () => {
            const player = playerRef.current;
            if (!player || !activeRef.current) return;
            const state = player.getPlayerState();
            const { UNSTARTED, CUED, BUFFERING } = window.YT.PlayerState;
            if (state === UNSTARTED || state === CUED) playMuted();
            else if (state === BUFFERING && checks < 6) {
                checks += 1;
                checkTimer.current = setTimeout(check, 1500);
            } else if (player.isMuted()) setShowUnmute(true);
        };
        checkTimer.current = setTimeout(check, 2500);
    }, [playMuted]);

    useEffect(() => {
        if (!embed) return undefined;
        let cancelled = false;
        loadYouTubeApi().then((YT) => {
            if (cancelled || !iframeRef.current) return;
            const player = new YT.Player(iframeRef.current, {
                events: {
                    onReady: () => {
                        if (cancelled) return;
                        playerRef.current = player;
                        shared.player = player;
                        shared.videoId = embed.videoId;
                        if (!embed.autoplay) return; // loaded in advance, waiting for a tap
                        if (embed.startMuted) setShowUnmute(true);
                        else watchForRefusedSound();
                    },
                    // The browser refused to start it: play muted instead, or if even muted
                    // playback is refused (iOS Low Power Mode), the unmute button's tap starts it
                    onAutoplayBlocked: () => {
                        if (cancelled) return;
                        if (player.isMuted()) setShowUnmute(true);
                        else playMuted();
                    },
                },
            });
        });
        return () => {
            cancelled = true;
            clearTimeout(checkTimer.current);
            if (shared.player && shared.player === playerRef.current) {
                shared.player = null;
                shared.videoId = null;
            }
            playerRef.current = null;
        };
    }, [embed, watchForRefusedSound, playMuted]);

    // Opening, closing and switching lectures
    useEffect(() => {
        activeRef.current = active;
        const player = playerRef.current;
        if (!player) {
            // Not ready yet (or the API is blocked): rebuild the iframe for this lecture
            if (embed && active && (embed.videoId !== videoId || !embed.autoplay)) setEmbed(buildEmbed(videoId, true));
            if (embed && !active && embed.autoplay) setEmbed(buildEmbed(videoId, false));
            return;
        }
        if (!active) {
            clearTimeout(checkTimer.current);
            player.pauseVideo();
            setShowUnmute(false);
            return;
        }
        if (shared.videoId !== videoId) {
            // Not started from a tap (playWithSound)
            shared.videoId = videoId;
            player.loadVideoById(videoId);
        }
        watchForRefusedSound();
    }, [videoId, active, embed, watchForRefusedSound]);

    const unmute = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;
        player.unMute();
        player.playVideo();
        setShowUnmute(false);
    }, []);

    useEffect(() => {
        if (!showUnmute || !active) return undefined;
        // The visitor's first tap, click or key press anywhere on the page turns the sound on
        // (except closing the player). Capture phase, so the modal's stopPropagation can't hide it.
        const onFirstInteraction = (e) => {
            if (e.type === 'keydown' && e.key === 'Escape') return;
            if (e.target instanceof Element && e.target.closest('[data-keep-muted]')) return;
            unmute();
        };
        window.addEventListener('click', onFirstInteraction, true);
        window.addEventListener('keydown', onFirstInteraction, true);
        // Hide the button once sound is turned on from YouTube's own volume control
        const poll = setInterval(() => {
            const player = playerRef.current;
            if (player && !player.isMuted()) setShowUnmute(false);
        }, 1000);
        return () => {
            window.removeEventListener('click', onFirstInteraction, true);
            window.removeEventListener('keydown', onFirstInteraction, true);
            clearInterval(poll);
        };
    }, [showUnmute, active, unmute]);

    if (!embed) return null;

    const params = new URLSearchParams({
        autoplay: embed.autoplay ? '1' : '0',
        mute: embed.startMuted ? '1' : '0',
        playsinline: '1',
        rel: '0',
        enablejsapi: '1',
        origin: window.location.origin,
    });

    return (
        <>
            <iframe
                key={embed.id}
                ref={iframeRef}
                className={className}
                src={`https://www.youtube.com/embed/${embed.videoId}?${params}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
            {showUnmute && active && (
                <button type="button" className={styles.unmute} onClick={unmute}>
                    <span className={styles.pill}>
                        <VolumeX aria-hidden="true" />
                        Tap to unmute
                    </span>
                </button>
            )}
        </>
    );
}
