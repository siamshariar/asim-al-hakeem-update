import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";
import SocialLinks from "./social-links";
import EmailText from "./email-text";

const footerLinks = {
    explore: [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Lectures", href: "/lectures/UUWsdcrre0WbCWML_PnuzoAg" },
        { name: "Books", href: "/books" },
        { name: "Articles", href: "/articles" },
    ],
    resources: [
        { name: "Ask a Question", href: "/ask-question" },
        { name: "Counselling", href: "/counselling" },
        { name: "Q&A Categories", href: "/qna" },
        { name: "Contact Us", href: "/contact" },
    ],
};

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="ah ah-footer">
            <div className="ah-wrap ah-footer__top">
                <div className="ah-footer__brand">
                    <Link href="/">
                        <Image src="/img/logo-white.png" alt="Sheikh Assim Al Hakeem" width={1466} height={720} />
                    </Link>
                    <p>
                        Sheikh Assim Al Hakeem is dedicated to spreading authentic Islamic knowledge
                        and providing guidance to Muslims worldwide.
                    </p>
                    <SocialLinks />
                </div>

                <div role="navigation" aria-label="Explore">
                    <h3>Explore</h3>
                    <ul>
                        {footerLinks.explore.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href}>{link.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div role="navigation" aria-label="Resources">
                    <h3>Resources</h3>
                    <ul>
                        {footerLinks.resources.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href}>{link.name}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="ah-footer__contact">
                    <h3>Contact</h3>
                    <ul>
                        <li>
                            <Mail size={17} aria-hidden="true" />
                            <a href="mailto:sheikhassim.bookings@gmail.com"><EmailText email="sheikhassim.bookings@gmail.com" /></a>
                        </li>
                        <li>
                            <MapPin size={17} aria-hidden="true" />
                            <span>Jeddah, Saudi Arabia</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="ah-wrap">
                <div className="ah-footer__bottom">
                    <p>© {currentYear} Sheikh Assim Al Hakeem. All rights reserved.</p>
                    <p>
                        Powered by{" "}
                        <a href="https://deeniinfotech.com" target="_blank" rel="noopener noreferrer">
                            Deeni Info Tech
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
}
