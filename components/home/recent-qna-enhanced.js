import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function RecentQnaEnhanced({ qna = [], topics = [], totalAnswers = 0, totalTopics = 0 }) {
  const items = qna.slice(0, 4);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="ah ah-sec ah-sec--alt" aria-labelledby="qna-title">
      <div className="ah-wrap">
        <div className="ah-sec-head">
          <div>
            <p className="ah-eyebrow">Questions &amp; Answers</p>
            <h2 id="qna-title">Recently Answered</h2>
          </div>
          <Link href="/qna" className="ah-link">
            {totalAnswers > 0 ? `Browse all ${totalAnswers.toLocaleString("en")} answers` : "Browse all answers"}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <div className="ah-qa-grid">
          <div className="ah-qa-cards">
            {items.map((item) => (
              <article key={item.id} className="ah-qcard">
                <Link href={`/qna/answer/${item.id}`}>
                  {item.categories?.[0] && <span className="ah-pill">{item.categories[0]}</span>}
                  <h3>{item.question}</h3>
                  <p>{item.content || item.answer}</p>
                  <span className="ah-link">
                    Read answer
                    <ArrowRight size={17} aria-hidden="true" />
                  </span>
                </Link>
              </article>
            ))}
          </div>

          <aside className="ah-qa-side" aria-label="Topics and asking a question">
            {topics.length > 0 && (
              <div className="ah-box">
                <h3>Popular Topics</h3>
                <ul className="ah-topics">
                  {topics.map((topic) => (
                    <li key={topic.slug}>
                      <Link href={`/qna/${topic.slug}`}>
                        {topic.title}
                        <span>{topic.count.toLocaleString("en")}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/qna" className="ah-link">
                  {totalTopics > 0 ? `All ${totalTopics} topics` : "All topics"}
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </div>
            )}

            <div className="ah-box ah-ask">
              <h3>Ask a Question</h3>
              <p className="ah-ask__time">
                <b>6:00 p.m.</b> Makkah time, daily
              </p>
              <p className="ah-ask__note">
                The daily quota usually fills within the first 5 to 10 minutes, so please submit
                your question as soon as we open.
              </p>
              <Link href="/ask-question" className="ah-btn ah-btn--white">
                Ask a Question
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
