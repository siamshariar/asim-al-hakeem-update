import Link from "next/link";
import { Clock, DollarSign, User, Phone, Mail } from "lucide-react";
import EmailText from "../email-text";

const details = [
  { term: "Duration", value: "30 minutes", Icon: Clock },
  { term: "Session fee", value: "$100 / half hour", Icon: DollarSign },
  { term: "Session type", value: "Private one-to-one", Icon: User },
  { term: "Via", value: "Skype, FaceTime, phone", Icon: Phone },
  { term: "Booking email", value: "sheikhassim.bookings@gmail.com", Icon: Mail, wide: true },
];

export default function CounsellingCTA() {
  return (
    <section className="ah ah-counsel" aria-labelledby="counselling-title">
      <div className="ah-wrap">
        <div className="ah-counsel__panel">
          <div>
            <p className="ah-eyebrow">By Appointment</p>
            <h2 id="counselling-title">Private Counselling</h2>
            <p className="ah-counsel__text">
              Need marriage counselling or personal guidance? Book a private one-to-one session
              with Sheikh Assim Al Hakeem via Skype, FaceTime or phone call.
            </p>
            <div className="ah-counsel__row">
              <Link href="/counselling" className="ah-btn ah-btn--primary">
                Book a Session
              </Link>
              <p>
                Need financial assistance? <Link href="/counselling#donate">Learn about donations</Link>
              </p>
            </div>
          </div>

          <dl className="ah-chips">
            {details.map(({ term, value, Icon, wide }) => (
              <div key={term} className={wide ? "ah-chips__wide" : undefined}>
                <span className="ah-chips__icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <dt>{term}</dt>
                  <dd>{value.includes("@") ? <EmailText email={value} /> : value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
