import { server } from "../../lib/config";
import { getBooks, getBookDetails, getAllPlaylists2, getHeaderLectures, getAllQnaCategory } from "../../lib/fetch";
import Image from "next/image";
import Link from "next/link";
import Meta from "../../components/meta";
import Header2 from "../../components/header1";
import PageHero from "../../components/page-hero";
import ShareLinks from "../../components/share-links";
import { BookOpen, Download, PlayCircle, FileText, ArrowRight } from "lucide-react";

export default function BookDetail({ detail, otherBooks = [], playlists, headerLectures, qnaCategories }) {
  if (!detail) {
    return (
      <>
        <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />
        <section className="ah ah-error">
          <div className="ah-wrap">
            <BookOpen size={44} aria-hidden="true" style={{ margin: "0 auto", color: "var(--ah-crimson)" }} />
            <h1>Book not found</h1>
            <p>The book you are looking for may have moved or no longer exists.</p>
            <div className="ah-actions">
              <Link href="/books" className="ah-btn ah-btn--primary">Back to Books</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const title = detail.title || detail.bookName;
  const slug = detail.slug || detail.bookSlug;
  const downloadLink = detail.downloadLink || detail.purchaseLink;
  const description = detail.description || detail.excerpt || detail.bookDesc || detail.bookExcerpt;
  const hasActions = downloadLink || detail.playlistLink || detail.pdf;

  return (
    <>
      <Meta title={title} url={`${server}/books/${slug}`} image={detail.image || detail.imageSrc}
        description={description || "Islamic book by Sheikh Assim Al Hakeem"} type="website" />

      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />

      <PageHero
        eyebrow="Book"
        title={title}
        breadcrumbs={[{ label: "Books", href: "/books" }, { label: title }]}
      />

      <section className="ah ah-page">
        <div className="ah-wrap ah-book-detail">
          <div className="ah-book-detail__cover">
            <Image src={detail.image || detail.imageSrc || "/img/books/default.jpg"} alt={`Cover of ${title}`} fill sizes="(max-width: 680px) 220px, 300px" priority />
          </div>

          <div>
            <h2>About this book</h2>
            <dl className="ah-dl">
              <div>
                <dt>Author</dt>
                <dd>{detail.writer || detail.author || "Sheikh Assim Al Hakeem"}</dd>
              </div>
              {detail.translator && (
                <div>
                  <dt>Translator</dt>
                  <dd>{detail.translator}</dd>
                </div>
              )}
            </dl>

            {description && <p className="ah-prose" style={{ marginTop: 22 }}>{description}</p>}

            <div className="ah-actions">
              {downloadLink && (
                <a className="ah-btn ah-btn--primary" target="_blank" rel="noopener noreferrer" href={downloadLink}>
                  <Download size={18} aria-hidden="true" />
                  Download
                </a>
              )}
              {detail.playlistLink && (
                <a className="ah-btn ah-btn--outline" target="_blank" rel="noopener noreferrer" href={detail.playlistLink}>
                  <PlayCircle size={18} aria-hidden="true" />
                  Watch the lecture series
                </a>
              )}
              {detail.pdf && (
                <a className="ah-btn ah-btn--outline" target="_blank" rel="noopener noreferrer" href={`${server}/pdf-viewer/web/viewer.html?file=${detail.pdf}`}>
                  <FileText size={18} aria-hidden="true" />
                  Read PDF
                </a>
              )}
              {!hasActions && (
                <p className="ah-box__text">{detail.linkNotAvailableText || "A download link is not available yet."}</p>
              )}
            </div>

            <div className="ah-footnote">
              <ShareLinks url={`${server}/books/${slug}`} title={title} label="Share this book" />
            </div>
          </div>
        </div>
      </section>

      {otherBooks.length > 0 && (
        <section className="ah ah-page ah-page--alt" aria-labelledby="more-books-title">
          <div className="ah-wrap">
            <div className="ah-section-title">
              <h2 id="more-books-title">More Books</h2>
              <Link href="/books" className="ah-link">All books <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
            <div className="ah-books">
              {otherBooks.map((book) => (
                <article key={book.slug} className="ah-book">
                  <Link href={`/books/${book.slug}`}>
                    <div className="ah-book__cover">
                      <Image src={book.image} alt={`Cover of ${book.title}`} fill sizes="(max-width: 680px) 104px, 150px" />
                    </div>
                    <div>
                      <p className="ah-eyebrow">Book</p>
                      <h3>{book.title}</h3>
                      <p className="ah-book__by">{book.author}</p>
                      <span className="ah-link">View details <ArrowRight size={17} aria-hidden="true" /></span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  const detail = await getBookDetails(slug);
  const playlists = await getAllPlaylists2();
  const headerLectures = await getHeaderLectures();
  const qnaCategories = await getAllQnaCategory();

  const books = await getBooks();
  const otherBooks = (books || [])
    .filter((book) => (book.slug || book.bookSlug) !== slug)
    .slice(0, 2)
    .map((book) => ({
      slug: book.slug || book.bookSlug,
      title: book.title || book.bookName,
      image: book.image || book.imageSrc || "/img/books/default.jpg",
      author: book.author || book.writer || "",
    }));

  return {
    props: {
      detail: detail || null,
      otherBooks,
      playlists: playlists?.playlists || [],
      headerLectures: headerLectures || null,
      qnaCategories: qnaCategories || [],
    },
  };
}

export async function getStaticPaths() {
  const books = await getBooks();
  const paths = books?.map((book) => ({ params: { slug: book.slug || book.bookSlug } })) || [];
  return { paths, fallback: false };
}
