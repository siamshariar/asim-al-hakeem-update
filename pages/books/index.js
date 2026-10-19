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
import { BookOpen, Download, PlayCircle, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// "https://www.youtube.com/watch?v=...&list=PL..." -> "PL..."
const playlistIdFromLink = (link = "") => {
    const match = String(link).match(/[?&]list=([^&#]+)/);
    return match ? match[1] : "";
};

const hostFromLink = (link = "") => {
    try {
        return new URL(link).hostname.replace(/^www\./, "");
    } catch (e) {
        return "";
    }
};

function BookShowcase({ book }) {
    const title = book.title || book.bookName;
    const slug = book.slug || book.bookSlug;
    const author = book.writer || book.author;
    const description = book.description || book.excerpt || book.bookDesc;
    const downloadLink = book.downloadLink || book.purchaseLink;
    const downloadHost = hostFromLink(downloadLink);

    return (
        <article className="ah-shelf-item" aria-labelledby={`book-${slug}`}>
            <Link href={`/books/${slug}`} className="ah-shelf-item__cover-wrap" tabIndex={-1} aria-hidden="true">
                <span className="ah-shelf-item__cover">
                    <Image
                        src={book.image || book.imageSrc || "/img/books/default.jpg"}
                        alt=""
                        fill
                        sizes="(max-width: 680px) 180px, 220px"
                    />
                </span>
            </Link>

            <div>
                <p className="ah-eyebrow">Book</p>
                <h2 id={`book-${slug}`}>
                    <Link href={`/books/${slug}`}>{title}</Link>
                </h2>

                <dl className="ah-dl">
                    <div>
                        <dt>Author</dt>
                        <dd>{author}</dd>
                    </div>
                    {book.translator && (
                        <div>
                            <dt>Translator</dt>
                            <dd>{book.translator}</dd>
                        </div>
                    )}
                </dl>

                {description && <p className="ah-shelf-item__desc">{description}</p>}

                {book.series && (
                    <Link href={`/lectures/${book.series.id}`} className="ah-series">
                        <span className="ah-series__icon"><PlayCircle size={20} aria-hidden="true" /></span>
                        <span>
                            <span className="ah-series__label">Lecture series</span>
                            <span className="ah-series__title">{book.series.title}</span>
                        </span>
                        <ArrowRight size={18} aria-hidden="true" className="ah-series__arrow" />
                    </Link>
                )}

                <div className="ah-actions">
                    {downloadLink && (
                        <a className="ah-btn ah-btn--primary" href={downloadLink} target="_blank" rel="noopener noreferrer">
                            <Download size={18} aria-hidden="true" />
                            Download
                        </a>
                    )}
                    {book.pdf && (
                        <a className="ah-btn ah-btn--outline" href={`${server}/pdf-viewer/web/viewer.html?file=${book.pdf}`} target="_blank" rel="noopener noreferrer">
                            <FileText size={18} aria-hidden="true" />
                            Read PDF
                        </a>
                    )}
                    <Link href={`/books/${slug}`} className="ah-btn ah-btn--outline">
                        View details
                    </Link>
                </div>
                {downloadHost && <p className="ah-shelf-item__note">Download opens on {downloadHost}</p>}
            </div>
        </article>
    );
}

export default function BookList({ books = [], playlists, headerLectures, qnaCategories }) {
    const withSeries = books.filter((book) => book.series).length;
    const withDownload = books.filter((book) => book.downloadLink || book.purchaseLink).length;

    return (
        <>
            <Meta
                title="Islamic Books by Sheikh Assim Al Hakeem"
                description="Explore a collection of authentic Islamic books written by Sheikh Assim bin Luqman al-Hakeem covering various topics of Islamic knowledge."
                url={`${server}/books`}
                image={`${server}/img/id/default_share.jpeg`}
                type="website"
            />

            <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />

            <PageHero
                eyebrow="Library"
                title="Books"
                subtitle="Books written, edited or recommended by Sheikh Assim Al Hakeem. Download a book and study it alongside its lecture series."
                breadcrumbs={[{ label: "Books" }]}
            >
                {books.length > 0 && (
                    <div className="ah-meta">
                        <span><BookOpen size={16} aria-hidden="true" />{books.length} {books.length === 1 ? "book" : "books"}</span>
                        {withDownload > 0 && <span><Download size={16} aria-hidden="true" />{withDownload === books.length ? "All available to download" : `${withDownload} available to download`}</span>}
                        {withSeries > 0 && <span><PlayCircle size={16} aria-hidden="true" />{withSeries === books.length ? "Each with a lecture series" : `${withSeries} with a lecture series`}</span>}
                    </div>
                )}
            </PageHero>

            <section className="ah ah-page ah-page--alt" aria-label="Books">
                <div className="ah-wrap">
                    {books.length > 0 ? (
                        <div className="ah-shelf">
                            {books.map((book) => (
                                <BookShowcase key={book.id} book={book} />
                            ))}
                        </div>
                    ) : (
                        <div className="ah-empty">
                            <BookOpen size={40} aria-hidden="true" />
                            <h2>No books available yet</h2>
                            <p>Please check back soon.</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="ah ah-cta-band" aria-label="Keep learning">
                <div className="ah-wrap">
                    <div>
                        <h2>Keep learning</h2>
                        <p>Watch the Sheikh's lectures or search thousands of answered questions.</p>
                    </div>
                    <div className="ah-cta-band__actions">
                        <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg" className="ah-btn ah-btn--white">Watch Lectures</Link>
                        <Link href="/qna" className="ah-btn ah-btn--ghost-light">Browse Q&amp;A</Link>
                    </div>
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
    const playlistsTitle = playlists?.playlistsTitle || {};

    // Link each book to its lecture series on this site when the playlist is known
    const booksWithSeries = (books || []).map((book) => {
        const id = playlistIdFromLink(book.playlistLink);
        return { ...book, series: id && playlistsTitle[id] ? { id, title: playlistsTitle[id] } : null };
    });

    return {
        props: {
            books: booksWithSeries,
            playlists: playlists?.playlists || [],
            headerLectures: headerLectures || null,
            qnaCategories: qnaCategories || [],
        },
    };
}
