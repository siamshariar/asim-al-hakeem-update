import Link from "next/link";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

export default function HeroBanner({ totalAnswers = 0, totalTopics = 0 }) {
    return (
        <section className="ah ah-hero" aria-labelledby="hero-title">
            <div className="ah-wrap ah-hero__grid">
                <div className="ah-hero__copy">
                    <p className="ah-eyebrow">Official Website</p>
                    <h1 id="hero-title" className="ah-hero__title">
                        <span>Sheikh Assim</span> <span>Al Hakeem</span>
                    </h1>
                    <p className="ah-hero__ar" lang="ar" dir="rtl">الشيخ عاصم الحكيم</p>
                    <p className="ah-hero__lead">
                        Lectures, answers to everyday questions, books and articles from Sheikh Assim
                        bin Luqman Al&#8209;Hakeem, who began his da'wah in 1989.
                    </p>
                    <div className="ah-hero__actions">
                        <Link href="/lectures/UUWsdcrre0WbCWML_PnuzoAg" className="ah-btn ah-btn--primary">
                            <PlayCircle size={18} aria-hidden="true" />
                            Watch Lectures
                        </Link>
                        <Link href="/ask-question" className="ah-btn ah-btn--outline">
                            Ask a Question
                        </Link>
                    </div>
                    {totalAnswers > 0 && (
                        <div className="ah-stats">
                            <div>
                                <b>{totalAnswers.toLocaleString("en")}</b>
                                <span>Answered questions</span>
                            </div>
                            <div>
                                <b>{totalTopics.toLocaleString("en")}</b>
                                <span>Q&amp;A topics</span>
                            </div>
                            <div>
                                <b>1989</b>
                                <span>Da'wah began</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="ah-hero__figure">
                    <Image
                        src="/img/profile-banner.png"
                        alt="Portrait of Sheikh Assim Al Hakeem"
                        width={509}
                        height={490}
                        sizes="(max-width: 680px) 330px, 470px"
                        priority
                    />
                </div>
            </div>
        </section>
    );
}
