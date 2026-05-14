import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { 
  Menu, X, ChevronDown, Search, Phone, Mail, 
  Facebook, Youtube, Instagram, Twitter, MapPin,
  PlayCircle, BookOpen, HelpCircle, MessageCircle,
  Calendar, User, Home, Video, FileText, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header2({ playlists, lectures, qna_categories, activePlaylistId }) {
  const [isSticky, setIsSticky] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();
  const dropdownTimeout = useRef(null);
  const searchInputRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsSticky(currentScrollY > 50);

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleDropdownEnter = (menu) => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
    setActiveDropdown(menu);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setMobileSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Home, hasDropdown: false },
    { 
      name: "Lectures", 
      href: "/lectures/UUWsdcrre0WbCWML_PnuzoAg", 
      icon: Video, 
      hasDropdown: true,
      dropdownItems: playlists?.slice(0, 6).map(p => ({ name: p.title, href: `/lectures/${p.id}`, icon: PlayCircle })) || [],
      viewAllLink: "/lectures",
      viewAllText: "View All Lectures"
    },
    { name: "Books", href: "/books", icon: BookOpen, hasDropdown: false },
    { name: "Articles", href: "/articles", icon: FileText, hasDropdown: false },
    { 
      name: "Q&A", 
      href: "/qna", 
      icon: HelpCircle, 
      hasDropdown: true,
      dropdownItems: qna_categories?.filter(c => c.slug !== "all").slice(0, 6).map(c => ({ name: c.title, href: `/qna/${c.slug}`, icon: MessageCircle })) || [],
      viewAllLink: "/qna",
      viewAllText: "View All Q&A"
    },
    { name: "Counselling", href: "/counselling", icon: Calendar, hasDropdown: false },
    { name: "About", href: "/about", icon: User, hasDropdown: false },
    { name: "Contact", href: "/contact", icon: Mail, hasDropdown: false },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/SheikhAssimAlhakeemTeam/", color: "hover:text-[#1877F2]" },
    { icon: Youtube, href: "https://www.youtube.com/user/assimalhakeem", color: "hover:text-[#FF0000]" },
    { icon: Instagram, href: "https://www.instagram.com/assimalhakeem?igshid=1v9psnayget6c", color: "hover:text-[#E4405F]" },
    { icon: Twitter, href: "https://x.com/Assimalhakee", color: "hover:text-[#1DA1F2]" },
  ];

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 20, staggerChildren: 0.05 } },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }
  };

  return (
    <>
      {/* Top Bar */}
      <div className={`bg-[#1a1f2e] text-white py-1.5 lg:py-2 hidden lg:block transition-all duration-300 ${showHeader ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}>
        <div className="max-w-[1260px] mx-auto px-4 sm:px-5 lg:px-6 xl:px-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 lg:space-x-6 text-xs lg:text-sm">
              {/* <div className="flex items-center space-x-1.5 lg:space-x-2">
                <Phone size={12} className="lg:w-3.5 lg:h-3.5 text-[#10b981]" />
                <span className="text-gray-300">+966 12 345 6789</span>
              </div> */}
              <div className="flex items-center space-x-1.5 lg:space-x-2">
                <Mail size={12} className="lg:w-3.5 lg:h-3.5 text-[#10b981]" />
                <span className="text-gray-300">sheikhassim.bookings@gmail.com</span>
              </div>
              <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
                <MapPin size={12} className="lg:w-3.5 lg:h-3.5 text-[#10b981]" />
                <span className="text-gray-300">Jeddah, Saudi Arabia</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 lg:space-x-4">
              {socialLinks.map((social, idx) => (
                <motion.a key={idx} href={social.href} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.95 }}
                  className={`transition-colors duration-200 text-gray-300 ${social.color}`}>
                  <social.icon size={14} className="lg:w-4 lg:h-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`bg-white transition-all duration-300 ${isSticky ? "fixed top-0 left-0 right-0 shadow-xl z-[9998]" : "relative z-[9998]"} ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="max-w-[1260px] mx-auto px-3 sm:px-4 lg:px-5 xl:px-5">
          <div className="flex items-center justify-between py-2 lg:py-2.5">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative">
                <Image 
                  src="/img/logo.png" 
                  alt="Assim Al Hakeem" 
                  width={isSticky ? 130 : 150}
                  height={isSticky ? 38 : 42}
                  className="h-auto w-auto max-h-[38px] sm:max-h-[42px] lg:max-h-[46px] xl:max-h-[50px] transition-all duration-300"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation - Visible on lg and up (1024px+) */}
            <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1">
              {navLinks.map((link, idx) => (
                <div key={idx} className="relative"
                  onMouseEnter={() => link.hasDropdown && handleDropdownEnter(link.name)}
                  onMouseLeave={link.hasDropdown ? handleDropdownLeave : undefined}>
                  <Link href={link.href}
                    onClick={(e) => {
                      if (link.hasDropdown) {
                        e.preventDefault();
                        setActiveDropdown((prev) => (prev === link.name ? null : link.name));
                      }
                    }}
                    className={`flex items-center space-x-0.5 px-2 md:px-2 xl:px-3.5 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 whitespace-nowrap
                      ${router.pathname === link.href || (link.href !== "/" && router.pathname.startsWith(link.href))
                        ? "text-[#10b981] bg-[#10b981]/5" 
                        : "text-[#1a1f2e] hover:text-[#10b981] hover:bg-gray-50"}`}>
                    <link.icon size={14} className="lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 mr-0.5" />
                    <span>{link.name}</span>
                    {link.hasDropdown && (
                      <motion.div animate={{ rotate: activeDropdown === link.name ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={12} className="lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5" />
                      </motion.div>
                    )}
                  </Link>

                  <AnimatePresence>
                    {link.hasDropdown && activeDropdown === link.name && (
                      <motion.div variants={dropdownVariants} initial="hidden" animate="visible" exit="exit"
                        className="absolute top-full left-0 mt-1 w-60 lg:w-64 xl:w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[9999]">
                        <div className="py-2 max-h-[350px] overflow-y-auto scrollbar-thin">
                          {link.dropdownItems?.map((item, itemIdx) => (
                            <motion.div key={itemIdx} variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
                              <Link href={item.href}
                                className="flex items-center px-3 lg:px-4 py-2.5 text-xs lg:text-sm text-[#1a1f2e] hover:bg-[#10b981]/10 hover:text-[#10b981] transition-all duration-200 group">
                                <item.icon size={14} className="mr-2 lg:mr-3 text-gray-400 group-hover:text-[#10b981] transition-colors" />
                                <span className="flex-1 truncate">{item.name}</span>
                                <motion.span initial={{ x: -10, opacity: 0 }} whileHover={{ x: 0, opacity: 1 }} className="text-[#10b981]">→</motion.span>
                              </Link>
                            </motion.div>
                          ))}
                          {link.viewAllLink && (
                            <div className="border-t border-gray-100 mt-2 pt-2">
                              <Link href={link.viewAllLink}
                                className="flex items-center justify-between px-3 lg:px-4 py-2.5 text-xs lg:text-sm text-[#1a1f2e] hover:bg-[#10b981]/10 hover:text-[#10b981] font-medium transition-all duration-200">
                                <span>{link.viewAllText}</span>
                                <ExternalLink size={12} />
                              </Link>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              {/* <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden lg:flex p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Search size={18} className="text-[#1a1f2e]" />
              </motion.button> */}

              {/* <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Search size={18} className="text-[#1a1f2e]" />
              </motion.button> */}

              <Link href="/ask-question" className="hidden sm:block">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-1 bg-gradient-to-r from-[#10b981] to-[#059669] text-white px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full text-xs lg:text-sm font-medium shadow-lg shadow-[#10b981]/25 hover:shadow-xl hover:shadow-[#10b981]/30 transition-all duration-300 whitespace-nowrap">
                  <HelpCircle size={14} />
                  <span className="hidden sm:inline">Ask Question</span>
                  <span className="sm:hidden">Ask</span>
                </motion.button>
              </Link>

              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="menu-burger p-2 rounded-full lg:hidden transition-colors text-[#1a1f2e]">
                {mobileMenuOpen ? (
                  <X size={20} />
                ) : (
                  <Menu size={20}  />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }} className="border-t border-gray-100 bg-gray-50 overflow-hidden">
              <div className="max-w-[1260px] mx-auto px-3 sm:px-4 lg:px-5 py-3 lg:py-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2 lg:gap-3">
                  <div className="flex-1 relative">
                    {/* <Search size={16} className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400" /> */}
                    <input ref={searchInputRef} type="text" placeholder="Search lectures, books, articles..."
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 lg:pl-12 pr-4 py-2.5 lg:py-3 bg-white border border-gray-200 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all text-sm text-[#1a1f2e]" />
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="px-4 lg:px-6 py-2.5 lg:py-3 bg-[#10b981] text-white rounded-lg lg:rounded-xl text-sm font-medium hover:bg-[#059669] transition-colors whitespace-nowrap">
                    Search
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="px-3 lg:px-4 py-2.5 lg:py-3 text-gray-500 hover:text-gray-700 transition-colors text-sm">
                    Cancel
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }} className="lg:hidden border-t border-gray-100 bg-gray-50 overflow-hidden">
              <div className="px-3 sm:px-4 py-3">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    {/* <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /> */}
                    <input type="text" placeholder="Search..."
                      value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] text-sm" />
                  </div>
                  <motion.button whileTap={{ scale: 0.95 }} type="submit"
                    className="px-4 py-2.5 bg-[#10b981] text-white rounded-lg text-sm font-medium">
                    Go
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} type="button"
                    onClick={() => { setMobileSearchOpen(false); setSearchQuery(""); }}
                    className="px-3 py-2.5 text-gray-500 text-sm">
                    Cancel
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {isSticky && <div className="h-[50px] sm:h-[55px] lg:h-[60px]" />}

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/45 z-[100] lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.18, ease: "easeOut" }} className="fixed top-0 right-0 h-full w-[280px] bg-white z-[101] lg:hidden shadow-2xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <span className="text-lg font-semibold text-[#1a1f2e]">Menu</span>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100">
                    <X size={20} className="text-[#1a1f2e]" />
                  </motion.button>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                  {navLinks.map((link, idx) => (
                    <div key={idx}>
                      <Link href={link.href} onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center px-6 py-3 text-[#1a1f2e] hover:bg-[#10b981]/5 hover:text-[#10b981] transition-colors">
                        <link.icon size={18} className="mr-3" />
                        <span>{link.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <Link href="/ask-question" onClick={() => setMobileMenuOpen(false)}>
                    <motion.button whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2">
                      <HelpCircle size={18} />
                      <span>Ask a Question</span>
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
