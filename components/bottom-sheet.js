import { useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

// Phone and tablet picker that slides up from the bottom (Q&A categories, lecture series).
// Closes on the backdrop, the close button, Escape, or a downward drag from the top bar.
// The page behind keeps its scroll position unless `restoreScroll` is false at close time
// (a new choice that scrolls the page to the top).
export default function BottomSheet({ open, onClose, label, title, subtitle, closeLabel, search, focusRef, restoreScroll = true, children }) {
  const sheetRef = useRef(null);
  const restoreScrollRef = useRef(restoreScroll);
  const onCloseRef = useRef(onClose);
  const dragControls = useDragControls();
  const reduceMotion = useReducedMotion();
  restoreScrollRef.current = restoreScroll;
  onCloseRef.current = onClose;

  // Lock the page behind (iOS ignores overflow: hidden on body, so the body is fixed in place)
  useIsomorphicLayoutEffect(() => {
    if (!open) return undefined;
    const { style } = document.body;
    const scrollY = window.scrollY;
    const previous = { position: style.position, top: style.top, width: style.width, overflow: style.overflow };
    Object.assign(style, { position: "fixed", top: `-${scrollY}px`, width: "100%", overflow: "hidden" });

    return () => {
      Object.assign(style, previous);
      window.scrollTo(0, restoreScrollRef.current ? scrollY : 0);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;

    // A mouse gets the search field; on touch screens that would raise the keyboard over the list
    const focusTimer = setTimeout(() => {
      const target = focusRef?.current && window.matchMedia("(pointer: fine)").matches ? focusRef.current : sheetRef.current;
      target?.focus({ preventScroll: true });
    }, 150);

    const handleKey = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      // Keep Tab inside the sheet while it is open
      if (e.key === "Tab" && sheetRef.current) {
        const items = [...sheetRef.current.querySelectorAll(FOCUSABLE)];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKey);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open, focusRef]);

  const startDrag = (e) => {
    if (e.target.closest("button, input")) return;
    dragControls.start(e);
  };

  const handleDragEnd = (e, info) => {
    if (info.offset.y > 90 || info.velocity.y > 600) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="ah">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="ah-sheet__backdrop"
          />
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={handleDragEnd}
            className="ah-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            tabIndex={-1}
          >
            <div className="ah-sheet__grab" onPointerDown={startDrag}>
              <div className="ah-sheet__handle" aria-hidden="true" />
            </div>
            <div className="ah-cat-box__head">
              <div className="ah-sheet__title" onPointerDown={startDrag}>
                <div>
                  <h2>{title}</h2>
                  {subtitle && <p>{subtitle}</p>}
                </div>
                <button type="button" onClick={onClose} className="ah-icon-btn" aria-label={closeLabel}>
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              {search}
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
