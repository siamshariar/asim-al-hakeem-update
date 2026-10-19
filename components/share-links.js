import { useEffect, useRef, useState } from "react";
import { Link2, Check, Mail } from "lucide-react";

const icons = {
  facebook: "M13.5 22v-8.2h2.8l.4-3.3h-3.2V8.4c0-.9.3-1.6 1.6-1.6h1.7V3.9a23 23 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3v3.3h2.8V22z",
  x: "M17.6 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5 21H1.9l7.3-8.3L1.5 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.1 4.7H5.3z",
  whatsapp: "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.5-.3z",
};

export default function ShareLinks({ url, title = "", label = "Share" }) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  const handleCopy = () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : url;
    navigator.clipboard?.writeText(currentUrl).then(() => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="ah-share">
      {label && <span className="ah-share__label">{label}</span>}
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icons.facebook} /></svg>
      </a>
      <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icons.x} /></svg>
      </a>
      <a href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icons.whatsapp} /></svg>
      </a>
      <a href={`mailto:?subject=${shareTitle}&body=${shareUrl}`} aria-label="Share by email">
        <Mail aria-hidden="true" />
      </a>
      <button type="button" onClick={handleCopy} className={copied ? "is-done" : undefined} aria-label={copied ? "Link copied" : "Copy link"}>
        {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
      </button>
      <span className="ah-share__status" role="status" aria-live="polite">{copied ? "Link copied" : ""}</span>
    </div>
  );
}
