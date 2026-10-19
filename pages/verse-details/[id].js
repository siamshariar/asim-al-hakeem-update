import { server } from "../../lib/config";
import {
	getAllPlaylists2,
	getHeaderLectures,
	getAllQnaCategory,
} from "../../lib/fetch";
import Meta from "../../components/meta";
import Header2 from "../../components/header1";
import PageHero from "../../components/page-hero";

import React from 'react';
import { useRouter } from 'next/router';
import { verses } from '../../data/verses';

const VerseDetails = ({ playlists, headerLectures, qnaCategories }) => {
  const router = useRouter();
  const { id } = router.query;




  const verse = verses.find((v) => v.id === parseInt(id));

  if (!verse) {
    return (
      <>
        <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />
        <section className="ah ah-error">
          <div className="ah-wrap">
            <h1>Verse not found</h1>
            <div className="ah-actions"><a href="/" className="ah-btn ah-btn--primary">Back to Home</a></div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Meta
        title={`Tafseer of ${verse.verse}`}
        description={verse.word}
        url={`${server}/verse-details/${id}`}
        image={`${server}/img/id/default_share.jpeg`}
        type="website"
      />

      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qnaCategories} />

      <PageHero
        eyebrow="Tafseer"
        title={verse.verse}
        subtitle={verse.word}
        narrow
        breadcrumbs={[{ label: "Tafseer" }, { label: verse.verse }]}
      />

      <section className="ah ah-page ah-page--narrow">
        <div className="ah-wrap">
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>Tafseer of this verse</h2>
          <div className="ah-prose">
            <p>{verse.tafseer}</p>
          </div>
        </div>
      </section>
    </>
  );
};

export async function getStaticProps() {
  try {
    const playlists = await getAllPlaylists2();
    const headerLectures = await getHeaderLectures();
    const qnaCategories = await getAllQnaCategory();

    return {
      props: {
        playlists: playlists?.playlists || [], 
        headerLectures: headerLectures || [], 
        qnaCategories: qnaCategories || [],   
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        playlists: [],         
        headerLectures: [],   
        qnaCategories: [],     
      },
    };
  }
}

export async function getStaticPaths() {
  const paths = verses.map((verse) => ({
    params: { id: verse.id.toString() },
  }));

  return {
    paths,
    fallback: false,
  };
}

export default VerseDetails;
