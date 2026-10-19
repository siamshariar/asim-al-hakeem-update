import { server } from "../lib/config";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, GraduationCap, Mic, Tv } from 'lucide-react';
import { getAllPlaylists2, getAllQnaCategory, getHeaderLectures } from "../lib/fetch";
import Meta from "../components/meta";
import Header2 from "../components/header1";
import PageHero from "../components/page-hero";
import SocialLinks from "../components/social-links";

const profile = { email: 'sheikhassim.bookings@gmail.com' };

const biographySections = [
  {
    title: "Early life",
    text: "Sheikh Assim bin Luqman al-Hakeem was born in 1962 in Al-Khobar, in the Eastern Province of Saudi Arabia. He grew up there until the age of 12 before moving with his family to Jeddah, where much of his later public work would begin.",
  },
  {
    title: "Education",
    text: "After finishing high school in 1980, he studied at King Fahd University of Petroleum and Minerals. He later completed his university studies with a major in Linguistics, and the English he learned became one of the means by which he later served the Ummah.",
  },
  {
    title: "Beginning of da'wah",
    text: "His public journey in da'wah started in 1989 when he began delivering the Friday sermon in Arabic after the local imam left. That responsibility pushed him to study, prepare, and teach with care every week.",
  },
  {
    title: "English media work",
    text: "He later used English in television and lecture programs, including work with Iqra, Saudi National TV, and Al-Majd. Through those programs and later online Q&A work, his reach expanded internationally.",
  },
  {
    title: "Daily life and service",
    text: "Alongside his da'wah, he has worked in professional management, taught classes after 'Isha, traveled for lectures, and spent long hours answering questions from people seeking advice and reconciliation.",
  },
];

export default function About({ playlists, headerLectures, qna_categories }) {
  const facts = [
    { term: "1962", detail: "Born in Al\u2011Khobar, Eastern Province", Icon: MapPin },
    { term: "1980", detail: "Finished high school, then studied at King Fahd University of Petroleum and Minerals; majored in Linguistics", Icon: GraduationCap },
    { term: "1989", detail: "Began delivering the Friday sermon in Arabic", Icon: Mic },
    { term: "Television", detail: "English programmes on Iqra, Saudi National TV and Al\u2011Majd", Icon: Tv },
  ];

  return (
    <>
      <Meta title="About Sheikh Assim Al Hakeem" description="Learn about Sheikh Assim bin Luqman al-Hakeem's life and contributions" url={`${server}/about`} />
      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qna_categories} />

      <PageHero
        eyebrow="About the Sheikh"
        title={"Sheikh Assim bin Luqman Al\u2011Hakeem"}
        titleAr="الشيخ عاصم الحكيم"
        subtitle="Islamic scholar and educator based in Jeddah, Saudi Arabia, teaching in Arabic and English."
        breadcrumbs={[{ label: "About" }]}
      />

      <section className="ah ah-page">
        <div className="ah-wrap ah-about-grid">
          <figure className="ah-about__photo">
            <div className="ah-about__img">
              <Image src="/img/about/about-img.jpg" alt="Sheikh Assim Al Hakeem seated, wearing a white shemagh" fill sizes="(max-width: 920px) 100vw, 460px" priority />
            </div>
            <figcaption>Sheikh Assim bin Luqman Al&#8209;Hakeem</figcaption>
          </figure>

          <div className="ah-about__copy">
            <p className="ah-eyebrow">At a glance</p>
            <h2>A life of teaching and da'wah</h2>
            <p>
              {biographySections[0].text}
            </p>
            <dl className="ah-facts">
              {facts.map(({ term, detail, Icon }) => (
                <div key={term}>
                  <span className="ah-facts__icon"><Icon size={20} aria-hidden="true" /></span>
                  <div>
                    <dt>{term}</dt>
                    <dd>{detail}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <div className="ah-actions">
              <a href={`mailto:${profile.email}`} className="ah-btn ah-btn--primary"><Mail size={18} aria-hidden="true" />Contact</a>
              <SocialLinks className="ah-about__social" />
            </div>
          </div>
        </div>
      </section>

      <section className="ah ah-page ah-page--alt" aria-labelledby="biography-title">
        <div className="ah-wrap" style={{ maxWidth: 960 }}>
          <div className="ah-section-title">
            <div>
              <p className="ah-eyebrow">From his 2010 interview</p>
              <h2 id="biography-title">Biography</h2>
            </div>
          </div>
          <ol className="ah-timeline">
            {biographySections.map((item) => (
              <li key={item.title} className="ah-timeline__item">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </li>
            ))}
          </ol>
          <p className="ah-quote">
            He is known for balancing family life, teaching, travel, counseling, and public media work with a strong sense of responsibility. His interview makes it clear that da'wah is not one single activity for him, but a full way of life that includes family, study, teaching, and service to people.
          </p>
          <p className="ah-footnote">
            Read the full interview: <Link href="/articles/biography-of-sheikh-assim-alhakeem" className="ah-link">Biography of Sheikh Assim Alhakeem (Interview 2010)</Link>
          </p>
        </div>
      </section>

      <section className="ah ah-cta-band" aria-label="Explore">
        <div className="ah-wrap">
          <div>
            <h2>Learn with Sheikh Assim</h2>
            <p>Watch his lectures or browse thousands of answered questions.</p>
          </div>
          <div className="ah-cta-band__actions">
            <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg" className="ah-btn ah-btn--white">Watch Lectures</Link>
            <Link href="/qna" className="ah-btn ah-btn--ghost-light">Browse Q&amp;A</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export async function getStaticProps() {
  const playlists = await getAllPlaylists2();
  const headerLectures = await getHeaderLectures();
  const qna_categories = await getAllQnaCategory();
  return { props: { playlists: playlists?.playlists || [], headerLectures: headerLectures || null, qna_categories: qna_categories || [] } };
}