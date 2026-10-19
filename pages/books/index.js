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
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function BookCard({ book }) {
    const title = book.title || book.bookName;
    const image = book.image || book.imageSrc;
    const slug = book.slug || book.bookSlug;
    const excerpt = book.excerpt || book.bookExcerpt;
    const author = book.author || book.writer;

    return (
        <article className="ah-book">
            <Link href={`/books/${slug}`}>
                <div className="ah-book__cover">
                    <Image src={image || "/img/books/default.jpg"} alt={`Cover of ${title}`} fill sizes="(max-width: 680px) 104px, 150px" />
                </div>
                <div>
                    <p className="ah-eyebrow">Book</p>
                    <h3>{title}</h3>
                    <p className="ah-book__by">
                        {author}
                        {book.translator && ` · translated by ${book.translator}`}
                    </p>
                    {excerpt && <p className="ah-book__excerpt">{excerpt}</p>}
                    <span className="ah-link">
                        View details
                        <ArrowRight size={17} aria-hidden="true" />
                    </span>
                </div>
            </Link>
        </article>
    );
}

export default function BookList({ books, playlists, headerLectures, qnaCategories }) {
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
                subtitle="Books written, edited or recommended by Sheikh Assim Al Hakeem, with download links and lecture series where available."
                breadcrumbs={[{ label: "Books" }]}
            />

            <section className="ah ah-page ah-page--alt" aria-label="Books">
                <div className="ah-wrap">
                    {books?.length > 0 ? (
                        <div className="ah-books">
                            {books.map((book) => (
                                <BookCard key={book.id} book={book} />
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