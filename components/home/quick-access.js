import Link from "next/link";
import { PlayCircle, HelpCircle, BookOpen, Calendar, ArrowRight } from "lucide-react";

export default function QuickAccess({ totalAnswers = 0, totalTopics = 0 }) {
    const qnaText = totalAnswers > 0
        ? `${totalAnswers.toLocaleString("en")} answers across ${totalTopics} topics, from prayer to family life.`
        : "Answers to everyday questions, from prayer to family life.";

    const items = [
        { title: "Lectures", text: "Full lectures and short answers from the YouTube channel.", href: "/lectures/UUWsdcrre0WbCWML_PnuzoAg", action: "Watch now", Icon: PlayCircle },
        { title: "Questions & Answers", text: qnaText, href: "/qna", action: "Browse answers", Icon: HelpCircle },
        { title: "Books & Articles", text: "Books and written answers to read and study.", href: "/books", action: "Start reading", Icon: BookOpen },
        { title: "Counselling", text: "Private one-to-one sessions of 30 minutes, by appointment.", href: "/counselling", action: "Book a session", Icon: Calendar },
    ];

    return (
        <section className="ah ah-quick" aria-label="Quick access">
            <div className="ah-wrap ah-quick__grid">
                {items.map(({ title, text, href, action, Icon }) => (
                    <Link key={title} href={href} className="ah-quick__card">
                        <span className="ah-quick__icon">
                            <Icon size={22} aria-hidden="true" />
                        </span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                        <span className="ah-link">
                            {action}
                            <ArrowRight size={17} aria-hidden="true" />
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
