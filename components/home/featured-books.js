import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Also used on the Books page, so both show the same card
export function BookCard({ book }) {
    const { title, image, slug, excerpt, author, translator } = book;

    return (
        <article className="ah-book">
            <Link href={`/books/${slug}`}>
                <div className="ah-book__cover">
                    <Image
                        src={image || "/img/books/default.jpg"}
                        alt={`Cover of ${title}`}
                        fill
                        sizes="(max-width: 680px) 104px, 150px"
                    />
                </div>
                <div>
                    <p className="ah-eyebrow">Book</p>
                    <h3>{title}</h3>
                    <p className="ah-book__by">
                        {author}
                        {translator && ` · translated by ${translator}`}
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

export default function FeaturedBooks({ books }) {
    const featuredBooks = books?.slice(0, 4) || [];

    if (!featuredBooks.length) return null;

    return (
        <section className="ah ah-sec ah-sec--alt" aria-labelledby="books-title">
            <div className="ah-wrap">
                <div className="ah-sec-head">
                    <div>
                        <p className="ah-eyebrow">Library</p>
                        <h2 id="books-title">Featured Books</h2>
                    </div>
                    <Link href="/books" className="ah-link">
                        View all books
                        <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                </div>

                <div className="ah-books">
                    {featuredBooks.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            </div>
        </section>
    );
}
