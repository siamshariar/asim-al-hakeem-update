import { useRouter } from 'next/router';
import { ArrowRight, Calendar, User, Clock, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getAllPlaylists2, getHeaderLectures, getAllQnaCategory } from "../../lib/fetch";
import Meta from "../../components/meta";
import Header2 from "../../components/header1";
import PageHero from "../../components/page-hero";
import ShareLinks from "../../components/share-links";
import ArticleCardImage from "../../components/article-card-image";
import { server } from "../../lib/config";
import { date as formatDate } from "../../lib/format";
import articles from '../../data/airticles-data';

const ARABIC_CHAR_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
const LATIN_CHAR_RE = /[A-Za-z]/;
const BLOCK_TAGS_TO_CHECK = ["p", "li", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption"];

const stripHtmlTags = (value = "") => value.replace(/<[^>]*>/g, "");

const decodeHtmlEntities = (value = "") =>
  value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const isArabicOnlyText = (value = "") => {
  const normalized = decodeHtmlEntities(stripHtmlTags(value)).replace(/\s+/g, " ").trim();
  if (!normalized) return false;

  const withoutArabic = normalized.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g, "");
  return !LATIN_CHAR_RE.test(withoutArabic) && !/[0-9]/.test(withoutArabic);
};

const wrapArabicRuns = (value = "") => {
  if (!ARABIC_CHAR_RE.test(value)) return value;
  return value.replace(
    /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF][\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u064B-\u065F\u0670\u06D6-\u06ED\s.,;:!?()'"\-–—]*)/g,
    '<span dir="rtl" class="inline-block text-right">$1</span>'
  );
};

const addClassName = (existingAttrs = "", className = "") => {
  const classMatch = existingAttrs.match(/class=("[^"]*"|'[^']*')/i);
  if (!classMatch) return `${existingAttrs} class="${className}"`;

  const current = classMatch[1].slice(1, -1);
  const merged = `${current} ${className}`.trim();
  return existingAttrs.replace(/class=("[^"]*"|'[^']*')/i, `class="${merged}"`);
};

const ensureDirAttr = (existingAttrs = "", dir = "rtl") => {
  if (/\bdir=/i.test(existingAttrs)) return existingAttrs;
  return `${existingAttrs} dir="${dir}"`;
};

const formatArticleDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatDate(value);
};

const readingMinutes = (html = "") => {
  const words = decodeHtmlEntities(stripHtmlTags(html)).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const enhanceArabicHtml = (html = "") => {
  let output = html;

  BLOCK_TAGS_TO_CHECK.forEach((tag) => {
    const tagPattern = new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)<\\/${tag}>`, "gi");

    output = output.replace(tagPattern, (match, attrs = "", innerHtml = "") => {
      if (isArabicOnlyText(innerHtml)) {
        const nextAttrs = addClassName(ensureDirAttr(attrs, "rtl"), "text-right");
        return `<${tag}${nextAttrs}>${innerHtml}</${tag}>`;
      }

      return `<${tag}${attrs}>${wrapArabicRuns(innerHtml)}</${tag}>`;
    });
  });

  return output;
};

export default function ArticleDetail({ article, related = [], playlists, headerLectures, qnaCategories }) {
  const router = useRouter();

  if (!article) {
    return (
      <>
        <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />
        <section className="ah ah-error">
          <div className="ah-wrap">
            <FileText size={44} aria-hidden="true" style={{ margin: "0 auto", color: "var(--ah-crimson)" }} />
            <h1>Article not found</h1>
            <p>The article you are looking for may have moved or no longer exists.</p>
            <div className="ah-actions">
              <Link href="/articles" className="ah-btn ah-btn--primary">Back to Articles</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const { slug } = router.query;
  const title = article.title || article.postTitle;
  const shareUrl = `${server}/articles/${slug || article.postSlug || article.slug}`;
  const bodyHtml = article.contentHtml || article.content || "";
  const localizedBodyHtml = enhanceArabicHtml(bodyHtml);
  const hasRichBody = typeof bodyHtml === "string" && /<iframe|<video|<p|<h[1-6]|<ul|<ol|<blockquote/i.test(bodyHtml);
  const minutes = readingMinutes(hasRichBody ? bodyHtml : article.description || "");
  const image = article.imageSrc || article.image;

  return (
    <>
      <Meta title={title} description={article.description || article.postExcerpt} url={shareUrl} image={article.image || article.imageSrc} type="article" />

      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />

      <PageHero
        title={title}
        narrow
        breadcrumbs={[{ label: "Articles", href: "/articles" }, { label: title }]}
      >
        <div className="ah-meta">
          <span><Calendar size={16} aria-hidden="true" />{formatArticleDate(article.date || article.postDate)}</span>
          <span><User size={16} aria-hidden="true" />{article.author || "Sheikh Assim Al Hakeem"}</span>
          <span><Clock size={16} aria-hidden="true" />{minutes} min read</span>
        </div>
      </PageHero>

      <article className="ah ah-page ah-page--narrow">
        <div className="ah-wrap">
          {image && (
            <div className="ah-figure">
              <Image src={image} alt="" fill sizes="(max-width: 960px) 100vw, 904px" priority />
            </div>
          )}

          <div className="ah-prose">
            {hasRichBody ? (
              <div dangerouslySetInnerHTML={{ __html: localizedBodyHtml }} />
            ) : (
              <p>{article.description || article.excerpt || article.postExcerpt}</p>
            )}
          </div>

          <div className="ah-footnote">
            <ShareLinks url={shareUrl} title={title} label="Share this article" />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="ah ah-page ah-page--alt" aria-labelledby="related-title">
          <div className="ah-wrap">
            <div className="ah-section-title">
              <h2 id="related-title">More Articles</h2>
              <Link href="/articles" className="ah-link">All articles <ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
            <div className="ah-art-grid ah-art-grid--3">
              {related.map((item) => (
                <article key={item.slug} className="ah-acard">
                  <Link href={`/articles/${item.slug}`}>
                    <ArticleCardImage article={item} sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 380px" />
                    <div className="ah-acard__body">
                      <p className="ah-acard__date">{formatArticleDate(item.date)}</p>
                      <h3>{item.title}</h3>
                      <span className="ah-link">Read article <ArrowRight size={17} aria-hidden="true" /></span>
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
  const { slug } = params;
  const article = articles.find(article => article.slug === slug || article.postSlug === slug);
  const playlists = await getAllPlaylists2();
  const headerLectures = await getHeaderLectures();
  const qnaCategories = await getAllQnaCategory();

  const related = articles
    .filter((item) => item !== article && item.published !== false)
    .slice(0, 3)
    .map((item) => ({
      slug: item.postSlug || item.slug,
      title: item.postTitle || item.title,
      image: item.imageSrc || item.image || "/img/articles/default.jpg",
      date: item.postDate || item.date || "",
      imageLetterbox: !!item.imageLetterbox,
      imageFocus: item.imageFocus || null,
    }));

  return {
    props: {
      article: article || null,
      related,
      playlists: playlists?.playlists || [],
      headerLectures: headerLectures || null,
      qnaCategories: qnaCategories || [],
    },
  };
}

export async function getStaticPaths() {
  const paths = articles.map(article => ({ params: { slug: article.slug || article.postSlug } }));
  return { paths, fallback: false };
}
