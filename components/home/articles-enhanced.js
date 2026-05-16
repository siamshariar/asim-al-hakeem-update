import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, TrendingUp } from "lucide-react";

export default function ArticlesSection({ articles }) {
  const featuredArticle = articles?.[0];
  const otherArticles = articles?.slice(1, 4) || [];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  if (!articles?.length) return null;

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-br from-[#f8fafc] via-[#eff6ff] to-[#f0f9ff]">
      <div className="container max-w-[1260px] mx-auto px-4 sm:px-6">
        <motion.div
          {...fadeInUp}
          className="flex items-start justify-between gap-4 mb-10"
        >
          <div className="min-w-0 flex-1">
            <span className="text-accent font-semibold uppercase tracking-wider text-sm">Insights & Knowledge</span>
            <h2 className="section-title text-primary mt-2">Latest Articles</h2>
          </div>
          <div className="shrink-0 ml-auto">
            <Link href="/articles">
              <motion.button
                whileHover={{ x: 5 }}
                className="inline-flex items-center gap-2 text-accent font-medium hover:text-accent-secondary transition-colors text-sm"
              >
                <span>View All Articles</span>
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {featuredArticle && (
          <motion.div
            {...fadeInUp}
            className="mb-8"
          >
            <Link href={`/articles/${featuredArticle.postSlug || featuredArticle.id}`}>
              <div className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="relative h-64 lg:h-full overflow-hidden">
                    <Image
                      src={featuredArticle.imageSrc || "/img/articles/default.jpg"}
                      alt={featuredArticle.postTitle || featuredArticle.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6 lg:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {featuredArticle.postDate || featuredArticle.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        Sheikh Assim Al Hakeem
                      </span>
                    </div>
                    <h4 className="h4 text-article-title font-bold text-primary mb-4 group-hover:text-gray-500 transition-colors">
                      {featuredArticle.postTitle || featuredArticle.title}
                    </h4>
                    <p className="text-article-desc text-gray-600 mb-6 line-clamp-3">
                      {featuredArticle.postExcerpt || featuredArticle.description}
                    </p>
                    <div className="flex items-center text-accent font-medium group-hover:gap-2 transition-all">
                      <span>Read Full Article</span>
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {otherArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {otherArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <Link href={`/articles/${article.postSlug || article.id}`}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.imageSrc || "/img/articles/default.jpg"}
                      alt={article.postTitle || article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <Calendar size={12} className="mr-1" />
                      <span>{article.postDate || article.date}</span>
                    </div>
                    <h4 className="h4 text-card-title font-semibold text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                      {article.postTitle || article.title}
                    </h4>
                    <p className="text-card-description text-gray-600 line-clamp-2">
                      {article.postExcerpt || article.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </section>
  );
  
}