import { server } from "../lib/config";
import Image from "next/image";
import { Facebook, Youtube, Mail, Award, BookOpen, Users, Globe, Calendar, MapPin } from 'lucide-react';
import { getAllPlaylists2, getAllQnaCategory, getHeaderLectures } from "../lib/fetch";
import Meta from "../components/meta";
import Header2 from "../components/header1";
import PageHero from "../components/page-hero";
import { motion } from "framer-motion";

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
  const profile = {
    name: 'Asim Al Hakeem',
    title: 'Islamic Scholar & Educator',
    location: 'Jeddah, Saudi Arabia',
    imageSrc: '/img/about/about-img.jpg',
    socials: {
      facebook: 'https://www.facebook.com/SheikhAssimAlhakeemTeam/',
      youtube: 'https://www.youtube.com/user/assimalhakeem',
      email: 'sheikhassim.bookings@gmail.com',
    },
  };

  return (
    <>
      <Meta title="About Sheikh Assim Al Hakeem" description="Learn about Sheikh Assim bin Luqman al-Hakeem's life and contributions" url={`${server}/about`} />
      <Header2 playlists={playlists} lectures={headerLectures} qna_categories={qna_categories} />

      <PageHero
        title="About Sheikh Assim Al Hakeem"
        subtitle="A lifetime dedicated to spreading authentic Islamic knowledge"
        Icon={Users}
      />

      {/* Profile Section */}
      <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
        <div className="container max-w-[1260px] mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="relative h-[250px] sm:h-[300px] lg:h-full">
                <Image src={profile.imageSrc} alt={profile.name} fill className="object-cover" />
              </div>
              <div className="p-5 sm:p-6 lg:p-8 xl:p-10">
                <div className="flex items-center gap-2 text-[#10b981] mb-2 sm:mb-3">
                  <Award size={18} className="sm:w-5 sm:h-5" />
                  <span className="font-semibold uppercase tracking-wider text-xs sm:text-sm">Islamic Scholar</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1f2e] mb-1 sm:mb-2">{profile.name}</h2>
                <p className="text-base sm:text-lg text-gray-600 mb-1 sm:mb-2">{profile.title}</p>
                <p className="flex items-center gap-1 sm:gap-2 text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6"><MapPin size={14} className="sm:w-4 sm:h-4" />{profile.location}</p>
                <div className="flex space-x-2 sm:space-x-3">
                  <a href={profile.socials.facebook} target="_blank" className="p-2.5 sm:p-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#1877F2]/90"><Facebook size={16} className="sm:w-[18px] sm:h-[18px]" /></a>
                  <a href={profile.socials.youtube} target="_blank" className="p-2.5 sm:p-3 bg-[#FF0000] text-white rounded-lg hover:bg-[#FF0000]/90"><Youtube size={16} className="sm:w-[18px] sm:h-[18px]" /></a>
                  <a href={`mailto:${profile.socials.email}`} className="p-2.5 sm:p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"><Mail size={16} className="sm:w-[18px] sm:h-[18px]" /></a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Biography */}
      <section className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container max-w-[900px] mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex flex-col items-center mb-6 sm:mb-8 text-center">
              <span className="text-[#10b981] font-semibold uppercase tracking-wider text-xs sm:text-sm mb-2">Interview 2010</span>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1a1f2e]">Biography</h2>
            </div>
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              {biographySections.map((item) => (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5 shadow-sm">
                  <h3 className="text-base sm:text-lg font-semibold text-[#1a1f2e] mb-2">{item.title}</h3>
                  <p className="text-sm sm:text-base leading-7 text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 sm:mt-6 rounded-2xl bg-[#f8fbfa] border border-[#d9f1eb] p-4 sm:p-5">
              <p className="text-sm sm:text-base leading-7 text-gray-700">
                He is known for balancing family life, teaching, travel, counseling, and public media work with a strong sense of responsibility. His interview makes it clear that da'wah is not one single activity for him, but a full way of life that includes family, study, teaching, and service to people.
              </p>
            </div>
          </motion.div>
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