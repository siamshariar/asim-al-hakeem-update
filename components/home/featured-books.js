// /data_E/asim-al-hakeem-test/asim-al-hakeem-web/components/home/featured-books.js

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, User, ArrowRight } from "lucide-react";

// UNIFIED Home Page Book Card - 100% MATCH with books page
function HomeBookCard({ book }) {
    const { title, image, slug, excerpt, author } = book;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="card card-r pc-6 group overflow-hidden border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg h-full"
        >
            <div className="card-image">
                <Link href={`/books/${slug}`} className="image-r relative block overflow-hidden">
                    <Image
                        src={image || "/img/books/default.jpg"}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        priority={false}
                    />
                </Link>
            </div>

            <div className="card-content p-5 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-1.5 text-[#10b981] mb-2">
                        <BookOpen size={14} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Book</span>
                    </div>
                    <h4 className="h4 text-card-title font-semibold font-primary text-primary mb-2 group-hover:text-gray-500 transition-colors duration-200 line-clamp-2 overflow-hidden break-words whitespace-normal max-h-[6rem]">
                        <Link href={`/books/${slug}`} className="text-current">
                            {title}
                        </Link>
                    </h4>
                    <div className="flex items-center gap-1.5 text-card-meta text-gray-500 mb-2">
                        <User size={12} />
                        <span className="text-card-meta text-gray-500">{author}</span>
                    </div>
                    {excerpt && (
                        <p className="text-card-description text-gray-600 line-clamp-3 mb-3">
                            {excerpt}
                        </p>
                    )}
                </div>

                <div className="mt-auto inline-flex items-center gap-1.5 text-[#10b981] text-[1rem] sm:text-[1rem] md:text-[1rem] lg:text-[1rem] font-semibold transition-all duration-300">
                    <Link href={`/books/${slug}`} className="inline-flex items-center gap-1.5">
                        <span className="text-[1rem] sm:text-[1rem] md:text-[1rem] lg:text-[1rem]">View Details</span>
                        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export default function FeaturedBooks({ books }) {
    const featuredBooks = books?.slice(0, 4) || [];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (!featuredBooks.length) return null;

    return (
        <section className="py-12 lg:py-20 bg-gradient-to-br from-[#ecfdf5] via-[#f8fafc] to-white">
            <div className="container max-w-[1260px] mx-auto px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start justify-between gap-4 mb-10"
                >
                    <div className="min-w-0 flex-1">
                        <span className="text-[#10b981] font-semibold uppercase tracking-wider text-sm">Knowledge Library</span>
                        <h2 className="section-title text-[#1a1f2e] mt-2">Featured Islamic Books</h2>
                        <p className="text-gray-600 max-w-2xl mt-3">
                            Explore authentic Islamic literature to deepen your understanding of the Deen
                        </p>
                    </div>
                    <div className="shrink-0 ml-auto">
                        <Link href="/books">
                        <motion.button
                            whileHover={{ x: 5 }}
                            className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent-secondary transition-colors text-sm"
                        >
                            <span>View All Books</span>
                            <ArrowRight size={16} />
                        </motion.button>
                        </Link>
                    </div>
                </motion.div>

                {/* Books Grid - grid-cols-1 under 1024px, grid-cols-2 above 1024px */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6"
                >
                    {featuredBooks.map((book) => (
                        <motion.div key={book.id} variants={itemVariants}>
                            <HomeBookCard book={book} />
                        </motion.div>
                    ))}
                </motion.div>

            </div>
        </section>
    );
}