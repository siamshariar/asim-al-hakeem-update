import Link from "next/link";
import Image from "next/image";
import { 
    Facebook, 
    Youtube, 
    Instagram, 
    Twitter, 
    Mail, 
    Phone, 
    MapPin,
    ChevronRight,
    Send,
    Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState({
        quickLinks: false,
        resources: false,
    });

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail("");
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const toggleMobileMenu = (menu) => {
        setMobileMenuOpen(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const currentYear = new Date().getFullYear();

    const footerLinks = {
        quickLinks: [
            { name: "Home", href: "/" },
            { name: "About", href: "/about" },
            { name: "Lectures", href: "/lectures/UUWsdcrre0WbCWML_PnuzoAg" },
            { name: "Books", href: "/books" },
            { name: "Articles", href: "/articles" },
        ],
        resources: [
            { name: "Ask a Question", href: "/ask-question" },
            { name: "Counselling", href: "/counselling" },
            { name: "Contact Us", href: "/contact" },
            { name: "Q&A Categories", href: "/qna" },
        ],
        social: [
            { icon: Facebook, href: "https://www.facebook.com/SheikhAssimAlhakeemTeam/", label: "Facebook", color: "hover:bg-[#1877F2]" },
            { icon: Youtube, href: "https://www.youtube.com/user/assimalhakeem", label: "YouTube", color: "hover:bg-[#FF0000]" },
            { icon: Instagram, href: "https://www.instagram.com/assimalhakeem?igshid=1v9psnayget6c", label: "Instagram", color: "hover:bg-[#E4405F]" },
            { icon: Twitter, href: "https://x.com/Assimalhakee", label: "Twitter", color: "hover:bg-[#1DA1F2]" },
        ],
        contact: [
            // { icon: Phone, text: "+966 12 345 6789", href: "tel:+966123456789" },
            { icon: Mail, text: "sheikhassim.bookings@gmail.com", href: "mailto:sheikhassim.bookings@gmail.com" },
            { icon: MapPin, text: "Jeddah, Saudi Arabia", href: "#" },
        ]
    };

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
    };

    return (
        <footer className="bg-[#1a1f2e] text-white">
            {/* Main Footer */}
            <div className="hidden sm:block pt-10 sm:pt-12 lg:pt-16 pb-8 sm:pb-10 lg:pb-12">
                <div className="container max-w-[1260px] mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
                        {/* About Column */}
                        <motion.div {...fadeInUp} className="text-center sm:text-left">
                            <Link href="/" className="inline-block mb-4 sm:mb-5">
                                <Image 
                                    src="/img/logo-white.png" 
                                    alt="Assim Al Hakeem" 
                                    width={170}
                                    height={56}
                                    className="h-auto w-auto max-h-[42px] sm:max-h-[48px] md:max-h-[52px] mx-auto sm:mx-0"
                                />
                            </Link>
                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-4 sm:mb-5 max-w-xs mx-auto sm:mx-0">
                                Sheikh Assim Al Hakeem is dedicated to spreading authentic Islamic knowledge 
                                and providing guidance to Muslims worldwide.
                            </p>
                            <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
                                {footerLinks.social.map((social, idx) => (
                                    <motion.a
                                        key={idx}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.15, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`p-2 sm:p-2.5 bg-white/10 rounded-lg sm:rounded-xl text-gray-300 transition-all duration-300 ${social.color} hover:text-white`}
                                        aria-label={social.label}
                                    >
                                        <social.icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Quick Links - Mobile Accordion */}
                        <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                            <div className="sm:hidden">
                                <button 
                                    onClick={() => toggleMobileMenu('quickLinks')}
                                    className="w-full flex items-center justify-between py-3 border-b border-white/10"
                                >
                                    <h3 className="text-white text-base font-semibold">Quick Links</h3>
                                    <ChevronRight size={16} className={`transition-transform ${mobileMenuOpen.quickLinks ? 'rotate-90' : ''}`} />
                                </button>
                                {mobileMenuOpen.quickLinks && (
                                    <ul className="py-3 space-y-2">
                                        {footerLinks.quickLinks.map((link, idx) => (
                                            <li key={idx}>
                                                <Link href={link.href} className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-2">
                                                    <ChevronRight size={12} className="text-[#10b981]" />
                                                    <span>{link.name}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="hidden sm:block">
                                <h3 className="text-white text-lg font-semibold mb-4 relative inline-block">
                                    Quick Links
                                    <span className="absolute -bottom-1.5 left-0 w-10 h-0.5 bg-[#10b981]"></span>
                                </h3>
                                <ul className="space-y-2.5">
                                    {footerLinks.quickLinks.map((link, idx) => (
                                        <motion.li key={idx} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                                            <Link href={link.href} className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                                                <ChevronRight size={12} className="text-[#10b981] opacity-0 group-hover:opacity-100 transition-all" />
                                                <span>{link.name}</span>
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Resources - Mobile Accordion */}
                        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
                            <div className="sm:hidden">
                                <button 
                                    onClick={() => toggleMobileMenu('resources')}
                                    className="w-full flex items-center justify-between py-3 border-b border-white/10"
                                >
                                    <h3 className="text-white text-base font-semibold">Resources</h3>
                                    <ChevronRight size={16} className={`transition-transform ${mobileMenuOpen.resources ? 'rotate-90' : ''}`} />
                                </button>
                                {mobileMenuOpen.resources && (
                                    <ul className="py-3 space-y-2">
                                        {footerLinks.resources.map((link, idx) => (
                                            <li key={idx}>
                                                <Link href={link.href} className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-2">
                                                    <ChevronRight size={12} className="text-[#10b981]" />
                                                    <span>{link.name}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="hidden sm:block">
                                <h3 className="text-white text-lg font-semibold mb-4 relative inline-block">
                                    Resources
                                    <span className="absolute -bottom-1.5 left-0 w-10 h-0.5 bg-[#10b981]"></span>
                                </h3>
                                <ul className="space-y-2.5">
                                    {footerLinks.resources.map((link, idx) => (
                                        <motion.li key={idx} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                                            <Link href={link.href} className="text-gray-300 hover:text-white text-sm transition-colors flex items-center gap-2 group">
                                                <ChevronRight size={12} className="text-[#10b981] opacity-0 group-hover:opacity-100 transition-all" />
                                                <span>{link.name}</span>
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Newsletter & Contact */}
                        <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="text-center sm:text-left">
                            <h3 className="text-white text-lg font-semibold mb-3 sm:mb-4 relative inline-block">
                                Stay Connected
                                <span className="absolute -bottom-1.5 left-0 w-10 h-0.5 bg-[#10b981]"></span>
                            </h3>
                            
                            {/* Newsletter Form */}
                            {/* <form onSubmit={handleSubscribe} className="mb-5 sm:mb-6 max-w-xs mx-auto sm:mx-0">
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 focus:border-[#10b981] transition-all"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 bg-[#10b981] rounded-md sm:rounded-lg hover:bg-[#059669] transition-colors"
                                    >
                                        <Send size={14} className="sm:w-4 sm:h-4" />
                                    </button>
                                </div>
                                {subscribed && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[#10b981] text-xs mt-2"
                                    >
                                        Subscribed successfully!
                                    </motion.p>
                                )}
                            </form> */}

                            {/* Contact Info */}
                            <ul className="space-y-2 sm:space-y-2.5 max-w-xs mx-auto sm:mx-0">
                                {footerLinks.contact.map((item, idx) => (
                                    <li key={idx}>
                                        <a 
                                            href={item.href}
                                            className="text-gray-300 hover:text-white transition-colors flex items-center gap-2 sm:gap-3 justify-center sm:justify-start"
                                        >
                                            <item.icon size={14} className="sm:w-4 sm:h-4 text-[#10b981] flex-shrink-0" />
                                            <span className="text-xs sm:text-sm break-all">{item.text}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 py-4 sm:py-5">
                <div className="container max-w-[1260px] mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400">
                        <p className="text-center sm:text-left">
                            © {currentYear} Sheikh Assim Al Hakeem. All rights reserved.
                        </p>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span>Powered By - </span>
                            <a href="https://deeniinfotech.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#10b981] hover:text-[#059669] transition-colors">
                                <span>Deeni Info Tech</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}