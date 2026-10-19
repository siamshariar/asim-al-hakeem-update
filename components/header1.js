import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { Menu, X, ChevronDown, Mail, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SocialLinks from "./social-links";

const LECTURES_HREF = "/lectures/UUWsdcrre0WbCWML_PnuzoAg";

export default function Header2({ playlists, lectures, qna_categories, activePlaylistId }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setIsHidden(currentScrollY > lastScrollY.current && currentScrollY > 160);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    const handleKey = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKey);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const close = () => setMobileMenuOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  const navLinks = [
    { name: "Home", href: "/", match: [] },
    {
      name: "Lectures",
      href: LECTURES_HREF,
      match: ["/lectures"],
      dropdownItems: playlists?.slice(0, 6).map((p) => ({ name: p.title, href: `/lectures/${p.id}` })) || [],
      viewAllText: "View all lectures",
    },
    { name: "Books", href: "/books", match: ["/books", "/book"] },
    { name: "Articles", href: "/articles", match: ["/articles"] },
    {
      name: "Q&A",
      href: "/qna",
      match: ["/qna", "/questions", "/ask-question"],
      dropdownItems: qna_categories?.filter((c) => c.slug !== "all").slice(0, 6).map((c) => ({ name: c.title, href: `/qna/${c.slug}` })) || [],
      viewAllText: "View all Q&A",
    },
    { name: "Counselling", href: "/counselling", match: ["/counselling"] },
    { name: "About", href: "/about", match: ["/about"] },
    { name: "Contact", href: "/contact", match: ["/contact"] },
  ];

  const isActive = (link) => {
    if (link.href === "/") return router.pathname === "/";
    return link.match.some((prefix) => router.pathname === prefix || router.pathname.startsWith(`${prefix}/`));
  };

  const currentPath = (router.asPath || "").split(/[?#]/)[0];

  return (
    <>
      <div className="ah ah-topbar">
        <div className="ah-wrap">
          <div className="ah-topbar__info">
            <a className="ah-topbar__item" href="mailto:sheikhassim.bookings@gmail.com">
              <Mail size={15} aria-hidden="true" />
              <span>sheikhassim.bookings@gmail.com</span>
            </a>
            <span className="ah-topbar__item">
              <MapPin size={15} aria-hidden="true" />
              <span>Jeddah, Saudi Arabia</span>
            </span>
          </div>
          <SocialLinks />
        </div>
      </div>

      <header className={`ah ah-header${isScrolled ? " is-scrolled" : ""}${isHidden && !mobileMenuOpen ? " is-hidden" : ""}`}>
        <div className="ah-wrap ah-header__row">
          <Link href="/" className="ah-logo">
            <Image src="/img/logo.png" alt="Sheikh Assim Al Hakeem — home" width={285} height={140} priority />
          </Link>

          <div className="ah-nav" role="navigation" aria-label="Main">
            <ul>
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="ah-nav__link" aria-current={isActive(link) ? "page" : undefined}>
                    {link.name}
                    {link.dropdownItems?.length > 0 && <ChevronDown size={14} aria-hidden="true" />}
                  </Link>
                  {link.dropdownItems?.length > 0 && (
                    <div className="ah-dropdown">
                      <ul>
                        {link.dropdownItems.map((item) => (
                          <li key={item.href}>
                            <Link href={item.href} aria-current={currentPath === item.href ? "page" : undefined}>{item.name}</Link>
                          </li>
                        ))}
                      </ul>
                      <div className="ah-dropdown__all">
                        <Link href={link.href}>{link.viewAllText}</Link>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <Link href="/ask-question" className="ah-btn ah-btn--primary ah-header__ask">
            Ask a Question
          </Link>

          <button
            type="button"
            className="ah-menu-btn"
            aria-expanded={mobileMenuOpen}
            aria-controls="ah-mobile-menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={18} aria-hidden="true" />
            Menu
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="ah" id="ah-mobile-menu">
            <motion.div
              className="ah-drawer__backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="ah-drawer__panel"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="ah-drawer__head">
                <Image src="/img/logo.png" alt="Sheikh Assim Al Hakeem" width={285} height={140} />
                <button type="button" className="ah-drawer__close" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} autoFocus>
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              <div className="ah-drawer__links" role="navigation" aria-label="Mobile">
                <ul>
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} aria-current={isActive(link) ? "page" : undefined} onClick={() => setMobileMenuOpen(false)}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ah-drawer__foot">
                <Link href="/ask-question" className="ah-btn ah-btn--primary" onClick={() => setMobileMenuOpen(false)}>
                  Ask a Question
                </Link>
                <SocialLinks />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
