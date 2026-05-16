import { motion } from "framer-motion";
import Link from "next/link";
import { PlayCircle, HelpCircle, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function HeroBanner() {
    const [scrollY, setScrollY] = useState(0);
    
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 min-h-[85vh] md:min-h-screen">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large gradient orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 45, 0],
                        x: [0, 30, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-[35rem] h-[35rem] rounded-full bg-emerald-500/10 blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [45, 0, 45],
                        x: [0, -30, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-32 -left-20 w-[30rem] h-[30rem] rounded-full bg-sky-400/8 blur-3xl"
                />
                
                {/* Grid pattern overlay */}
                <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
            </div>

            <div className="container mx-auto px-4 sm:px-6 max-w-[1260px] relative z-10 min-h-[85vh] md:min-h-screen flex flex-col justify-center pt-6 sm:pt-8 md:pt-12 lg:pt-20 pb-12 sm:pb-14 md:pb-20 lg:pb-24">
                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
                    {/* Left Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left order-2 lg:order-1 mt-6 sm:mt-8 lg:mt-0"
                    >
                        {/* Official Website Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6 lg:mb-8"
                        >
                            <Star className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                            <span className="text-white/90 text-xs sm:text-sm font-medium tracking-wide uppercase">Official Website</span>
                        </motion.div>

                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 leading-tight">
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="block"
                            >
                                Sheikh
                            </motion.span>
                            <motion.span
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="block bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent"
                            >
                                Assim Al Hakeem
                            </motion.span>
                        </h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-sm sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8 lg:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                        >
                            Authentic Islamic knowledge from one of the most trusted scholars. 
                            Guiding millions worldwide through lectures, books, and counseling.
                        </motion.p>

                        {/* CTA Buttons - Only Two */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-4 sm:mb-8 md:mb-12 lg:mb-0"
                        >
                            <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl font-semibold text-base sm:text-lg shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
                                        <span>Watch Lectures</span>
                                    </span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        initial={false}
                                    />
                                </motion.button>
                            </Link>
                            
                            <Link href="/ask-question">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-full sm:w-auto group px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 hover:border-white/40 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:bg-white/15"
                                >
                                    <HelpCircle size={20} className="group-hover:rotate-12 transition-transform" />
                                    <span>Ask Question</span>
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Right - Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative order-1 lg:order-2"
                    >
                        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[520px]">
                            {/* Glow effect behind image */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.3, 0.5, 0.3],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-sky-400/20 rounded-3xl blur-3xl"
                            />
                            
                            {/* Image Container */}
                            <div className="relative rounded-2xl sm:rounded-3xl border-2 border-white/15 bg-white/5 p-1.5 sm:p-3 backdrop-blur-xl shadow-2xl overflow-hidden">
                                {/* Glass effect overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/20" />
                                
                                <motion.div
                                    animate={{ 
                                        y: [0, -8, 0],
                                    }}
                                    transition={{ 
                                        duration: 5, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                    }}
                                    className="relative z-10"
                                >
                                    <img
                                        src="/img/profile-banner.png"
                                        alt="Sheikh Assim Al Hakeem"
                                        className="w-full h-auto object-contain drop-shadow-2xl"
                                    />
                                </motion.div>
                            </div>

                            {/* Decorative elements */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-4 -right-4 w-16 sm:w-20 h-16 sm:h-20 border-2 border-emerald-400/20 rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute -bottom-4 -left-4 w-12 sm:w-16 h-12 sm:h-16 border-2 border-sky-400/20 rounded-full"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Unified Scroll Indicator for all screens */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-3 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-20"
                >
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-1 h-2 bg-white/70 rounded-full mt-1.5 sm:mt-2"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}