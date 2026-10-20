import Link from "next/link";
import ArticleCardImage from "../article-card-image";
import { ArrowRight } from "lucide-react";
import { date as formatDate } from "../../lib/format";

const formatArticleDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatDate(value);
};

export default function ArticlesSection({ articles }) {
  const items = articles?.slice(0, 4) || [];

  if (!items.length) return null;

  return (
    <section className="ah ah-sec" aria-labelledby="articles-title">
      <div className="ah-wrap">
        <div className="ah-sec-head">
          <div>
            <p className="ah-eyebrow">Writings</p>
            <h2 id="articles-title">Selected Articles</h2>
          </div>
          <Link href="/articles" className="ah-link">
            View all articles
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="ah-art-grid">
          {items.map((article) => (
            <article key={article.id} className="ah-acard">
              <Link href={`/articles/${article.postSlug || article.id}`}>
                <ArticleCardImage article={article} sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 300px" />
                <div className="ah-acard__body">
                  <p className="ah-acard__date">{formatArticleDate(article.postDate || article.date)}</p>
                  <h3>{article.postTitle || article.title}</h3>
                  <p className="ah-acard__excerpt">{article.postExcerpt || article.description}</p>
                  <span className="ah-link">
                    Read article
                    <ArrowRight size={17} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
