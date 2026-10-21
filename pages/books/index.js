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
import { BookCard } from "../../components/home/featured-books";
import { BookOpen } from "lucide-react";

export default function BookList({ books = [], playlists, headerLectures, qnaCategories }) {
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

            <section className="ah ah-page" aria-label="Books">
                <div className="ah-wrap">
                    {books.length > 0 ? (
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
            books: books || [],
            playlists: playlists?.playlists || [],
            headerLectures: headerLectures || null,
            qnaCategories: qnaCategories || [],
        },
    };
}
