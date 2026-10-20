// YouTube embed that tries to start playing with sound as soon as it opens.
// Browsers only allow that after the visitor has interacted with the page (e.g. clicked a
// lecture card). For a video opened straight from a shared link it is usually blocked, and
// the video stays paused on YouTube's own play button so the visitor can start it with sound.
const EMBED_PARAMS = 'autoplay=1&mute=0&playsinline=1&rel=0';

export default function YouTubePlayer({ videoId, title, className }) {
    return (
        <iframe
            className={className}
            src={`https://www.youtube.com/embed/${videoId}?${EMBED_PARAMS}`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        ></iframe>
    );
}
