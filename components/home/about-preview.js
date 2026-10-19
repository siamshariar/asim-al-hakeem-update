import Link from "next/link";
import Image from "next/image";
import { MapPin, GraduationCap, Mic, Tv } from "lucide-react";

const facts = [
  { term: "1962", detail: "Born in Al‑Khobar, Eastern Province", Icon: MapPin },
  { term: "KFUPM", detail: "University studies; major in Linguistics", Icon: GraduationCap },
  { term: "1989", detail: "Began delivering the Friday sermon", Icon: Mic },
  { term: "Television", detail: "English programmes on Iqra, Saudi National TV and Al‑Majd", Icon: Tv },
];

export default function AboutPreview() {
  return (
    <section className="ah ah-sec" aria-labelledby="about-title">
      <div className="ah-wrap ah-about-grid">
        <figure className="ah-about__photo">
          <div className="ah-about__img">
            <Image
              src="/img/about/about-img.jpg"
              alt="Sheikh Assim Al Hakeem seated, wearing a white shemagh"
              fill
              sizes="(max-width: 920px) 100vw, 460px"
            />
          </div>
          <figcaption>Sheikh Assim bin Luqman Al&#8209;Hakeem</figcaption>
        </figure>

        <div className="ah-about__copy">
          <p className="ah-eyebrow">About the Sheikh</p>
          <h2 id="about-title">Sheikh Assim bin Luqman Al&#8209;Hakeem</h2>
          <p>
            Born in Al&#8209;Khobar in the Eastern Province of Saudi Arabia, Sheikh Assim moved with
            his family to Jeddah at the age of twelve. His public da'wah began in 1989, when he
            started delivering the Friday sermon in Arabic.
          </p>
          <p>
            Through English television programmes and, later, online Q&amp;A, his teaching reached
            Muslims around the world. Alongside his da'wah he teaches classes after 'Isha, travels
            for lectures and answers questions from people seeking advice.
          </p>
          <dl className="ah-facts">
            {facts.map(({ term, detail, Icon }) => (
              <div key={term}>
                <span className="ah-facts__icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <dt>{term}</dt>
                  <dd>{detail}</dd>
                </div>
              </div>
            ))}
          </dl>
          <Link href="/about" className="ah-btn ah-btn--outline">
            Read Full Biography
          </Link>
        </div>
      </div>
    </section>
  );
}
