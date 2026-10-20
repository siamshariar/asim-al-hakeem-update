import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Scroll reveal: section headings and cards rise gently into view as the visitor reaches them.
// Running text, site chrome and dialogs never move, nothing already painted on screen is hidden
// again, and nothing happens for visitors who ask their device for reduced motion.
// Styles: styles/_motion.scss
const TARGETS = [
    '.ah-sec-head', '.ah-quick__card', '.ah-vcard', '.ah-qa-cards > *', '.ah-qa-side > *',
    '.ah-about__photo', '.ah-about__copy', '.ah-book', '.ah-acard', '.ah-counsel__panel',
    '.ah-card', '.ah-cat-box', '.ah-qrow', '.ah-shelf-item', '.ah-series', '.ah-book-detail__cover',
    '.ah-timeline__item', '.ah-cta-band', '.ah-section-title', '.ah-quote',
].join(', ');
const SKIP = 'header, footer, [role="dialog"], .ah-sheet';
const STAGGER_MS = 70;
const MAX_STEPS = 5;
const SETTLE_MS = 900;

export default function ScrollReveal() {
    const router = useRouter();

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (reduce.matches || !('IntersectionObserver' in window)) return undefined;
        const root = document.documentElement;
        root.classList.add('ah-motion');
        const seen = new WeakSet();
        const timers = new Set();

        // Hand the element back to its own (hover) transitions once it has settled
        const settle = (el) => {
            el.classList.remove('ah-reveal', 'is-revealed');
            el.style.removeProperty('--ah-reveal-delay');
        };

        const observer = new IntersectionObserver((entries) => {
            entries
                .filter((entry) => entry.isIntersecting)
                .map((entry) => entry.target)
                .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
                .forEach((el, i) => {
                    observer.unobserve(el);
                    const delay = Math.min(i, MAX_STEPS) * STAGGER_MS;
                    el.style.setProperty('--ah-reveal-delay', `${delay}ms`);
                    el.classList.add('is-revealed');
                    const timer = setTimeout(() => {
                        timers.delete(timer);
                        settle(el);
                    }, delay + SETTLE_MS);
                    timers.add(timer);
                });
        }, { rootMargin: '0px 0px -40px 0px' });

        // In-site navigation: the new page's blocks may fade in even on screen (they were never
        // painted). Otherwise on-screen content is never hidden, so it can't delay the page's
        // largest paint (LCP), e.g. results that load just after the page opens.
        let pageChangeUntil = 0;
        const onPageChangeStart = () => { pageChangeUntil = Infinity; };
        const onPageChangeEnd = () => { pageChangeUntil = performance.now() + 1000; };
        router.events.on('routeChangeStart', onPageChangeStart);
        router.events.on('routeChangeComplete', onPageChangeEnd);
        router.events.on('routeChangeError', onPageChangeEnd);

        const scan = (node) => {
            const found = node.matches(TARGETS) ? [node] : [];
            node.querySelectorAll(TARGETS).forEach((el) => found.push(el));
            const candidates = found.filter((el) => (
                !seen.has(el) && !el.closest(SKIP) && !el.parentElement.closest(TARGETS)
            ));
            candidates.forEach((el) => seen.add(el));
            // Read every position before changing any class (one layout pass)
            const newPage = performance.now() < pageChangeUntil;
            const hidden = newPage ? candidates : candidates.filter((el) => el.getBoundingClientRect().top >= window.innerHeight);
            hidden.forEach((el) => {
                el.classList.add('ah-reveal');
                observer.observe(el);
            });
        };

        scan(document.body);
        const mutations = new MutationObserver((records) => {
            records.forEach((record) => record.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) scan(node);
            }));
        });
        mutations.observe(document.body, { childList: true, subtree: true });

        const stop = () => {
            router.events.off('routeChangeStart', onPageChangeStart);
            router.events.off('routeChangeComplete', onPageChangeEnd);
            router.events.off('routeChangeError', onPageChangeEnd);
            observer.disconnect();
            mutations.disconnect();
            timers.forEach(clearTimeout);
            document.querySelectorAll('.ah-reveal').forEach(settle);
            root.classList.remove('ah-motion');
        };
        // Reduced motion switched on mid-visit: show everything at once
        const onPreferenceChange = () => {
            if (reduce.matches) stop();
        };
        reduce.addEventListener?.('change', onPreferenceChange);
        return () => {
            reduce.removeEventListener?.('change', onPreferenceChange);
            stop();
        };
    }, [router.events]);

    return null;
}
