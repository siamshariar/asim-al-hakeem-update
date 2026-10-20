// YouTube player for lectures. Starts playing as soon as it opens.
// Browsers only allow sound after the visitor has interacted with the page, and iOS/Safari only
// when the tap reaches a player that is already running. So:
// - a lecture opened from a card starts with sound: playWithSound() swaps it into the page's
//   running player inside the tap (on iOS/Safari a muted background clip keeps one running from
//   page load, see needsBackgroundPlayer)
// - a lecture opened straight from a shared link starts muted, and the sound comes on with the
//   visitor's first tap, click or key press, on the video or anywhere else.
import { useCallback, useEffect, useRef, useState } from 'react';
import { VolumeX } from 'lucide-react';
import styles from './youtube-player.module.scss';

// Short clip from the Sheikh's channel that keeps the hidden background player running (muted)
const BACKGROUND_VIDEO_ID = 'PWgNAtIkQ8A';

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

// The page's player once it is ready (kept between lectures), the video loaded in it, and
// whether a tap just asked for sound (confirmed again once the new lecture starts loading)
const shared = { player: null, videoId: null, confirmSound: false };

// Call from the click/tap that opens a lecture, before showing the player. Swapping the lecture
// into a running player inside the tap is the one way iOS allows sound.
// Returns false when no player is ready yet; the player then starts the lecture itself.
export function playWithSound(videoId) {
    const { player } = shared;
    if (!player) return false;
    shared.videoId = videoId;
    shared.confirmSound = true;
    player.loadVideoById(videoId);
    player.unMute();
    player.playVideo();
    return true;
}

// Safari and every iOS browser refuse sound in a player that wasn't running before the tap
export function needsBackgroundPlayer() {
    const ua = navigator.userAgent;
    const iOS = /iP(hone|ad|od)/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const safari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS|Android/.test(ua);
    return iOS || safari;
}

// What the iframe is created with; later videos load into it through the API
function buildEmbed(videoId, muted = false) {
    const activation = navigator.userActivation;
    embedCount += 1;
    return { id: embedCount, videoId, startMuted: muted || !(activation && activation.hasBeenActive) };
}

export default function YouTubePlayer({ videoId, title, className, active = true, background = false }) {
    const iframeRef = useRef(null);
    const playerRef = useRef(null);
    const latest = useRef({ videoId, active });
    const checkTimer = useRef(null);
    // null until mounted: only the browser knows whether the visitor has interacted yet
    const [embed, setEmbed] = useState(null);
    const [showUnmute, setShowUnmute] = useState(false);

    useEffect(() => {
        if (embed || !(active || background)) return;
        setEmbed(active ? buildEmbed(videoId) : buildEmbed(BACKGROUND_VIDEO_ID, true));
    }, [embed, videoId, active, background]);

    // Sound can still be refused (a tap before the player was running): play muted instead of
    // staying paused, and let the next tap turn the sound on
    const playMuted = useCallback(() => {
        const player = playerRef.current;
        if (!player || !latest.current.active) return;
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
            if (!player || !latest.current.active) return;
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

    // Bring the player in line with the props: the open lecture, or when closed the muted
    // background clip (kept running for the next tap) or simply paused
    const sync = useCallback(() => {
        const player = playerRef.current;
        if (!player) return;
        const { videoId: want, active: open } = latest.current;
        if (!open) {
            clearTimeout(checkTimer.current);
            shared.confirmSound = false;
            setShowUnmute(false);
            if (background) {
                if (shared.videoId !== BACKGROUND_VIDEO_ID) {
                    shared.videoId = BACKGROUND_VIDEO_ID;
                    player.loadVideoById(BACKGROUND_VIDEO_ID);
                }
                player.mute();
                player.playVideo();
            } else {
                player.pauseVideo();
            }
            return;
        }
        if (shared.videoId !== want) {
            // Not started from a tap (playWithSound)
            shared.videoId = want;
            player.loadVideoById(want);
        }
        watchForRefusedSound();
    }, [background, watchForRefusedSound]);

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
                        const { videoId: want, active: open } = latest.current;
                        if (!open || want !== embed.videoId) sync();
                        else if (embed.startMuted) setShowUnmute(true);
                        else watchForRefusedSound();
                    },
                    onStateChange: (e) => {
                        if (cancelled) return;
                        const { PLAYING, BUFFERING, ENDED } = YT.PlayerState;
                        // Real iOS can drop a tapped lecture back to muted once it starts loading;
                        // confirm the tap's sound then (no new tap needed)
                        if (shared.confirmSound && (e.data === PLAYING || e.data === BUFFERING)) {
                            shared.confirmSound = false;
                            player.unMute();
                            player.playVideo();
                        }
                        // Keep the background clip looping, always muted
                        if (e.data === ENDED && background && !latest.current.active) {
                            player.mute();
                            player.playVideo();
                        }
                    },
                    // The browser refused to start it: play muted instead, or if even muted
                    // playback is refused (iOS Low Power Mode), the unmute button's tap starts it
                    onAutoplayBlocked: () => {
                        if (cancelled || !latest.current.active) return;
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
                shared.confirmSound = false;
            }
            playerRef.current = null;
        };
    }, [embed, background, sync, playMuted, watchForRefusedSound]);

    // Opening, closing and switching lectures
    useEffect(() => {
        latest.current = { videoId, active };
        if (playerRef.current) {
            sync();
            return;
        }
        // Not ready yet (or the API is blocked): rebuild the iframe for what should be showing
        if (!embed) return;
        if (active && embed.videoId !== videoId) setEmbed(buildEmbed(videoId));
        if (!active && embed.videoId !== BACKGROUND_VIDEO_ID) setEmbed(background ? buildEmbed(BACKGROUND_VIDEO_ID, true) : null);
    }, [videoId, active, embed, background, sync]);

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
        autoplay: '1',
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
