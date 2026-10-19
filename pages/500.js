import Link from 'next/link';
import Meta from '../components/meta';
import Header2 from '../components/header1';

export default function Custom500() {
  return (
    <>
      <Meta title="Something went wrong" description="An unexpected error occurred." />
      <Header2 />
      <section className="ah ah-error">
        <div className="ah-wrap">
          <p className="ah-error__code">500</p>
          <h1>Something went wrong</h1>
          <p>
            An unexpected error occurred while loading this page. Please try again in a moment,
            or continue browsing from one of the pages below.
          </p>
          <div className="ah-actions">
            <Link href="/" className="ah-btn ah-btn--primary">Back to Home</Link>
            <Link href="/qna" className="ah-btn ah-btn--outline">Browse Q&amp;A</Link>
          </div>
        </div>
      </section>
    </>
  );
}
