import { useEffect, useRef, useState } from "react";

import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";

import ShareIcon from "@mui/icons-material/Share";
import CloseIcon from "@mui/icons-material/Close";

import {
	EmailShareButton,
	EmailIcon,
	FacebookShareButton,
	FacebookIcon,
	TwitterShareButton,
	TwitterIcon,
	LinkedinShareButton,
	LinkedinIcon,
	WhatsappShareButton,
	WhatsappIcon,
	TelegramShareButton,
	TelegramIcon,
	RedditShareButton,
	RedditIcon,
} from "react-share";

import styles from "./share.module.scss";

// The video player modal sits at z-index 10001; the share dialog must open above it.
const SHARE_MODAL_Z_INDEX = 10050;

// Accepts an absolute URL or a site path ("/lectures/...", "books/...") and
// returns an absolute URL on the domain the visitor is actually using.
const toAbsoluteUrl = (value = "") => {
	if (/^https?:\/\//i.test(value)) return value;
	const path = `/${String(value).replace(/^\/+/, "")}`;
	if (typeof window === "undefined") return path;
	return `${window.location.origin}${path}`;
};

// `url` is preferred; `urlWeb` / `urlMobile` are kept for existing callers.
export default function Share({ url, urlWeb, urlMobile, title = "" }) {
	const [shareOpen, setShareOpen] = useState(false);
	const [shareUrl, setShareUrl] = useState("");

	const resolveUrl = () => toAbsoluteUrl(url || urlWeb || urlMobile || "");

	const openDialog = () => {
		setShareUrl(resolveUrl());
		setShareOpen(true);
	};

	// Phones get the native share sheet when the browser supports it
	const handleMobileShare = async () => {
		const target = resolveUrl();
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({ title, url: target });
			} catch (error) {
				// AbortError = the visitor closed the share sheet; anything else falls back
				if (error?.name !== "AbortError") openDialog();
			}
			return;
		}
		openDialog();
	};

	return (
		<>
			<div className={styles.wrapper}>
				<button type="button" onClick={handleMobileShare} className={`${styles.btn} ${styles.btn_mobile}`}>
					<ShareIcon aria-hidden="true" />
					<span>Share</span>
				</button>

				<button type="button" onClick={openDialog} className={`${styles.btn} ${styles.btn_web}`}>
					<ShareIcon aria-hidden="true" />
					<span>Share</span>
				</button>
			</div>

			<ShareModal open={shareOpen} onClose={() => setShareOpen(false)} url={shareUrl} title={title} />
		</>
	);
}

function ShareModal({ open, onClose, url, title }) {
	const [copied, setCopied] = useState(false);
	const timeoutRef = useRef(null);

	useEffect(() => {
		if (!open) setCopied(false);
	}, [open]);

	useEffect(() => () => {
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
	}, []);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
		} catch (error) {
			// Older browsers / insecure contexts: select the field so the visitor can copy it
			const input = document.getElementById("share-url-field");
			if (input) {
				input.select();
				document.execCommand?.("copy");
			}
		}
		setCopied(true);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => setCopied(false), 2000);
	};

	const networks = [
		{ label: "Facebook", Button: FacebookShareButton, Icon: FacebookIcon, props: {} },
		{ label: "WhatsApp", Button: WhatsappShareButton, Icon: WhatsappIcon, props: { title } },
		{ label: "X (Twitter)", Button: TwitterShareButton, Icon: TwitterIcon, props: { title } },
		{ label: "Telegram", Button: TelegramShareButton, Icon: TelegramIcon, props: { title } },
		{ label: "LinkedIn", Button: LinkedinShareButton, Icon: LinkedinIcon, props: { title } },
		{ label: "Reddit", Button: RedditShareButton, Icon: RedditIcon, props: { title } },
		{ label: "Email", Button: EmailShareButton, Icon: EmailIcon, props: { subject: title } },
	];

	return (
		<Modal
			open={open}
			onClose={onClose}
			closeAfterTransition
			sx={{ zIndex: SHARE_MODAL_Z_INDEX }}
			slotProps={{ backdrop: { className: styles.backdrop } }}
			aria-labelledby="share-dialog-title"
		>
			<Fade in={open} timeout={150}>
				<div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="share-dialog-title">
					<button type="button" className={styles.close} onClick={onClose} aria-label="Close share dialog">
						<CloseIcon aria-hidden="true" />
					</button>

					<h2 id="share-dialog-title" className={styles.title}>Share</h2>
					{title && <p className={styles.subtitle}>{title}</p>}

					<div className={styles.lists}>
						{networks.map(({ label, Button, Icon, props }) => (
							<div className={styles.item} key={label}>
								<Button url={url} aria-label={`Share on ${label}`} {...props}>
									<Icon size={44} round />
								</Button>
								<span className={styles.itemLabel}>{label}</span>
							</div>
						))}
					</div>

					<div className={styles.copyRow}>
						<label htmlFor="share-url-field" className={styles.srOnly}>Link</label>
						<input
							id="share-url-field"
							className={styles.copyInput}
							type="text"
							value={url}
							readOnly
							onFocus={(e) => e.target.select()}
						/>
						<button type="button" className={styles.copyBtn} onClick={handleCopy}>
							{copied ? "Copied" : "Copy link"}
						</button>
					</div>
					<p className={styles.status} role="status" aria-live="polite">{copied ? "Link copied to clipboard" : ""}</p>
				</div>
			</Fade>
		</Modal>
	);
}
