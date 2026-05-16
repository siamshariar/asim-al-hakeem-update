// /data_E/asim-al-hakeem-test/asim-al-hakeem-web/pages/books/index.js

import { server } from "../../lib/config";
import {
    getBooks,
    getAllPlaylists2,
    getHeaderLectures,
    getAllQnaCategory,
} from "../../lib/fetch";
import Meta from "../../components/meta";
import Header2 from "../../components/header1";
import PageHero from "../../components/page-hero";
import { motion } from "framer-motion";
import { BookOpen, X, User, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

// UNIFIED Book Card Component - 100% MATCH with home page
function BookCard({ book }) {
    const {
        title,
        image,
        slug,
        excerpt,
        author,
        bookName,
        imageSrc,
        bookSlug,
        bookExcerpt,
        writer,
    } = book;
    const resolvedTitle = title || bookName;
    const resolvedImage = image || imageSrc;
    const resolvedSlug = slug || bookSlug;
    const resolvedExcerpt = excerpt || bookExcerpt;
    const resolvedAuthor = author || writer;

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="card card-r pc-6 group overflow-hidden border border-gray-100 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg h-full"
        >
            <div className="card-image">
                <Link href={`/books/${resolvedSlug}`} className="image-r relative block overflow-hidden">
                    <Image
                        src={resolvedImage || "/img/books/default.jpg"}
                        alt={resolvedTitle}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized
                    />
                </Link>
            </div>

            <div className="card-content p-5 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-1.5 text-[#10b981] mb-2">
                        <BookOpen size={14} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Book</span>
                    </div>
                    <h4 className="h4 text-card-title font-semibold font-primary text-primary mb-2 group-hover:text-gray-500 transition-colors duration-200 line-clamp-2 overflow-hidden break-words whitespace-normal max-h-[7rem]">
                        <Link href={`/books/${resolvedSlug}`} className="text-current">
                            {resolvedTitle}
                        </Link>
                    </h4>
                    <div className="flex items-center gap-1.5 text-card-meta text-gray-500 mb-2">
                        <User size={12} />
                        <span className="text-card-meta text-gray-500">{resolvedAuthor}</span>
                    </div>
                    {resolvedExcerpt && (
                        <p className="text-card-description text-gray-600 line-clamp-3 mb-3">
                            {resolvedExcerpt}
                        </p>
                    )}
                </div>

                <div className="mt-auto inline-flex items-center gap-1.5 text-[#10b981] text-[1rem] sm:text-[1rem] md:text-[1rem] lg:text-[1rem] font-semibold transition-all duration-300">
                    <Link href={`/books/${resolvedSlug}`} className="inline-flex items-center gap-1.5">
                        <span className="text-[0.875rem]">View Details</span>
                        <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export default function BookList({
    books,
    playlists,
    headerLectures,
    qnaCategories,
}) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const title = book.title || book.bookName || "";
            const excerpt = book.excerpt || book.bookExcerpt || "";
            const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 excerpt.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [books, searchTerm]);

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

    return (
        <>
            <Meta
                title="Islamic Books by Sheikh Assim Al Hakeem"
                description="Explore a collection of authentic Islamic books written by Sheikh Assim bin Luqman al-Hakeem covering various topics of Islamic knowledge."
                url={`${server}/books`}
                image={`${server}/img/id/default_share.jpeg`}
                type="website"
            />

            <Header2
                playlists={playlists}
                lectures={headerLectures}
                qna_categories={qnaCategories}
            />

            <PageHero
                title="Islamic Books"
                subtitle="Authentic Islamic literature to deepen your understanding of the Deen"
                Icon={BookOpen}
            />

            {/* Search Section */}
            {/* <section className="py-6 bg-white border-b border-gray-100">
                <div className="container max-w-[1260px] mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full lg:w-96">
                            <input
                                type="text"
                                placeholder="Search books..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition-all text-[#1a1f2e]"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section> */}

            {/* Books Grid */}
            <section className="py-8 lg:py-16 bg-gray-50">
                <div className="container max-w-[1260px] mx-auto px-4">
                    {filteredBooks.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6"
                        >
                            {filteredBooks.map((book) => (
                                <motion.div key={book.id} variants={itemVariants}>
                                    <BookCard book={book} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-16"
                        >
                            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No books found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria</p>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="py-16 bg-gradient-to-r from-[#10b981] to-[#059669]">
                <div className="container max-w-[800px] mx-auto px-4 text-center text-white">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-white text-3xl font-bold mb-4">Stay Updated</h2>
                        <p className="text-white/90 mb-8 text-lg">
                            Subscribe to receive notifications about new books and publications
                        </p>
                        <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="flex-1 px-5 py-3 rounded-xl text-white bg-white/10 placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                            <button className="px-6 py-3 bg-white text-[#10b981] rounded-xl font-medium hover:bg-gray-50 transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </>
    );
}

export async function getStaticProps(context) {
    const books = await getBooks();
    const playlists = await getAllPlaylists2();
    const headerLectures = await getHeaderLectures();
    const qnaCategories = await getAllQnaCategory();

    return {
        props: {
            books,
            playlists: playlists?.playlists || [],
            headerLectures: headerLectures || null,
            qnaCategories: qnaCategories || [],
        },
    };
}