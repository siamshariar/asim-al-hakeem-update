import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, ChevronRight } from 'lucide-react';

export default function RecentQnaEnhanced({ qna }) {
  if (!qna || qna.length === 0) {
    return null;
  }

  // Show up to 3 items in grid
  const displayQna = qna.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#f8fafc] via-[#f0fef9] to-[#ecfdf5] shadow-sm">
      <div className="container max-w-[1260px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-start justify-between gap-3 mb-6 sm:mb-8"
          >
            <div className="min-w-0 flex-1">
            <span className="text-[#10b981] font-semibold uppercase tracking-wider text-xs sm:text-sm">Community Q&A</span>
            <h2 className="section-title text-[#1a1f2e] mt-1 sm:mt-2">Recent Questions</h2>
          </div>
          <Link href="/qna" className="shrink-0 ml-auto">
            <motion.button
              whileHover={{ x: 5 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 text-[#10b981] font-medium hover:text-[#059669] transition-colors text-sm"
            >
              <span>View All Q&A</span>
              <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6"
        >
          {displayQna.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="card card-r group hover:shadow-xl transition-all duration-300 cursor-pointer bg-white rounded-xl sm:rounded-2xl overflow-hidden"
            >
              <Link href={`/qna/answer/${item.id}`}>
                <div className="p-4 sm:p-5 lg:p-6 flex flex-col h-full">
                  {/* Icon and category */}
                  <div className="flex items-start gap-3 mb-3 sm:mb-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#10b981]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <MessageCircle size={18} className="sm:w-[20px] sm:h-[20px] text-[#10b981]" />
                    </div>
                    {item.categories && item.categories.length > 0 && (
                      <span className="text-xs sm:text-sm bg-[#10b981]/10 text-[#10b981] px-2.5 py-1 rounded-full font-medium">
                        {item.categories[0]}
                      </span>
                    )}
                  </div>

                  {/* Question title */}
                  <div className="heading-r mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#10b981] transition-colors">
                    {item.question}
                  </div>

                  {/* Preview text */}
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4 flex-1">
                    {item.content || item.answer || 'Click to read the full answer'}
                  </p>

                  {/* Read more link */}
                  <div className="flex items-center gap-1 text-[#10b981] text-xs sm:text-sm font-medium group-hover:gap-2 transition-all">
                    <span>Read Answer</span>
                    <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
