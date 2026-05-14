import { server } from "../../lib/config";
import { getBooks, getBookDetails, getAllPlaylists2, getHeaderLectures, getAllQnaCategory } from "../../lib/fetch";
import Image from "next/image";
import Meta from "../../components/meta";
import Header2 from "../../components/header1";
import Share from "../../components/share";
import { motion } from "framer-motion";
import { BookOpen, Download, Youtube, ExternalLink, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BookDetail({ detail, playlists, headerLectures, qnaCategories }) {
  if (!detail) {
    return (
      <>
        <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />
        <div className="container max-w-[1260px] mx-auto px-4 py-16 sm:py-20 text-center">
          <BookOpen size={40} className="sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1f2e] mb-2">Book Not Found</h1>
          <Link href="/books" className="text-[#10b981] hover:underline text-sm sm:text-base">Back to Books</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Meta title={detail.title || detail.bookName} url={`${server}/books/${detail.slug || detail.bookSlug}`} image={detail.image || detail.imageSrc}
        description={detail.description || detail.excerpt || detail.bookExcerpt || "Islamic book by Sheikh Assim Al Hakeem"} type="website" />

      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />

      <section className="blog-detail-ctn mt-0 book-details-page">
        <div className="py-6 lg:py-12">
          
          <div className="container max-w-[1260px] mx-auto">
                            <div className="col s12 l12 mb-4">
                  <Link href="/books" className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-[#10b981] transition-colors text-sm sm:text-base">
                    <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" /> Back to Books
                  </Link>
                </div>
            <div className="blog-area lg:mx-0">
              <div className="row margin-bottom-0">

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="blog-detail book-detail">
                  <div className="row margin-bottom-0">
                    <div className="col s12 l5">
                      <div className="book-detail-left-wrapper">
                        <div className="book-detail-left">
                          <div className="book-detail-left-inner">
                        <Image
                          src={detail.image || detail.imageSrc || "/img/books/default.jpg"}
                          alt={detail.title || detail.bookName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col s12 l7">
                      <div className="book-detail-right">
                        <h2 className="book-title">{detail.title || detail.bookName}</h2>

                        <div className="book-writer-area">
                          <p>Writter: <i>{detail.writer || "Sheikh Assim Al Hakeem"}</i></p>
                          {detail.translator && (
                            <p>Translator: <i>{detail.translator}</i></p>
                          )}
                        </div>

                        <div className="book-action">
                          <div className="book-btn">
                            {/* {detail.bookPageLink && (
                              <a className="btn-r read-more book-link-btn" target="_blank" rel="noopener noreferrer" href={detail.bookPageLink}>
                                <ExternalLink />
                                <span>Visit Site</span>
                              </a>
                            )} */}
                            {(detail.downloadLink || detail.purchaseLink) && (
                              <a className="btn-r read-more" target="_blank" rel="noopener noreferrer" href={detail.downloadLink || detail.purchaseLink}>
                                <Download />
                                <span>Download</span>
                              </a>
                            )}
                            {detail.playlistLink && (
                              <a className="btn-r read-more" target="_blank" rel="noopener noreferrer" href={detail.playlistLink}>
                                <Youtube />
                                <span>Watch</span>
                              </a>
                            )}
                            {detail.pdf && (
                              <a className="btn-r read-more" target="_blank" rel="noopener noreferrer" href={`${server}/pdf-viewer/web/viewer.html?file=${detail.pdf}`}>
                                <Download />
                                <span>Read PDF</span>
                              </a>
                            )}
                            {!detail.bookPageLink && !detail.downloadLink && !detail.purchaseLink && !detail.playlistLink && !detail.pdf && (
                              <span className="no-link">{detail.linkNotAvailableText || "Link not available"}...</span>
                            )}
                          </div>

                          <div className="blog-share book-share">
                            <Share urlWeb={`books/${detail.slug || detail.bookSlug}`} urlMobile={detail.slug || detail.bookSlug} title={detail.title || detail.bookName} />
                          </div>
                        </div>

                        <p className="book-detail-desc">{detail.description || detail.excerpt || detail.bookDesc || detail.bookExcerpt}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .book-details-page .book-btn {
          width: 100%;
        }

        .book-details-page .book-btn a.read-more {
          color: #fff !important;
          padding: 0 !important;
          font-family: var(--app-font-secondary);
        }

        .book-details-page .book-btn a.read-more:hover,
        .book-details-page .book-btn a.read-more:focus {
          color: #fff !important;
        }

        .book-details-page .book-btn a.read-more svg {
          width: 1rem;
          height: 1rem;
          flex-shrink: 0;
        }

        .book-details-page .book-btn a.read-more span {
          font-size: 0.875rem;
          font-weight: 600;
          line-height: 1.2;
          font-family: var(--app-font-secondary);
        }

        @media only screen and (max-width: 600px) {
          .book-details-page .book-action {
            align-items: stretch;
          }

          .book-details-page .book-btn {
            display: flex;
            flex-direction: column;
            width: 100%;
            gap: 0.5rem;
          }

          .book-details-page .book-btn a.read-more {
            width: 100%;
            margin-right: 0 !important;
            min-width: 0;
            max-width: 100%;
            padding: 0.675rem 1rem !important;
            justify-content: center;
            gap: 0.25rem;
          }

          .book-details-page .book-btn a.read-more svg {
            width: 1.2rem;
            height: 1.2rem;
          }

          .book-details-page .book-btn a.read-more span {
            font-size: 0.875rem;
          }
        }

        @media only screen and (min-width: 601px) {
          .book-details-page .book-btn {
            display: flex;
            flex-wrap: wrap;
            gap: 0.35rem;
          }

          .book-details-page .book-btn a.read-more {
            min-width: 8.75rem;
            width: auto;
            padding: 0.675rem 1rem !important;
          }

          .book-details-page .book-btn a.read-more svg {
            width: 1.25rem;
            height: 1.25rem;
          }

          .book-details-page .book-btn a.read-more span {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}

export async function getStaticProps({ params }) {
  const slug = params.slug;
  const detail = await getBookDetails(slug);
  const playlists = await getAllPlaylists2();
  const headerLectures = await getHeaderLectures();
  const qnaCategories = await getAllQnaCategory();

  return {
    props: {
      detail: detail || null,
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
