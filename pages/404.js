import Link from 'next/link';
import Meta from '../components/meta';
import Header2 from '../components/header1';

export default function Custom404() {
  return (
    <>
      <Meta title="Page not found" description="The page you are looking for could not be found." />
      <Header2 />
      <section className="ah ah-error">
        <div className="ah-wrap">
          <p className="ah-error__code">404</p>
          <h1>Page not found</h1>
          <p>
            The page you are looking for may have moved or no longer exists.
            Try one of these instead.
          </p>
          <div className="ah-actions">
            <Link href="/" className="ah-btn ah-btn--primary">Back to Home</Link>
            <Link href="/qna" className="ah-btn ah-btn--outline">Browse Q&amp;A</Link>
            <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg" className="ah-btn ah-btn--outline">Watch Lectures</Link>
          </div>
        </div>
      </section>
    </>
  );
}
