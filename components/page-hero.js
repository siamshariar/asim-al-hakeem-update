import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Inner-page header: breadcrumb, eyebrow, title, optional subtitle/meta.
// `breadcrumbs` is a list of { label, href }; the last item is the current page.
export default function PageHero({
  eyebrow,
  title,
  subtitle,
  breadcrumbs = [],
  children,
  narrow = false,
  longTitle = false,
  titleAr,
}) {
  return (
    <section className={`ah ah-page-hero${narrow ? " ah-page-hero--narrow" : ""}`}>
      <div className="ah-wrap">
        {breadcrumbs.length > 0 && (
          <div aria-label="Breadcrumb" className="ah-breadcrumb" role="navigation">
            <Link href="/">Home</Link>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <span key={`${crumb.label}-${idx}`} className="ah-breadcrumb__item">
                  <ChevronRight size={14} aria-hidden="true" />
                  {isLast || !crumb.href ? (
                    <span aria-current={isLast ? "page" : undefined}>{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} onClick={crumb.onClick}>{crumb.label}</Link>
                  )}
                </span>
              );
            })}
          </div>
        )}
        {eyebrow && <p className="ah-eyebrow">{eyebrow}</p>}
        <h1 className={`ah-page-hero__title${longTitle ? " ah-page-hero__title--long" : ""}`}>{title}</h1>
        {titleAr && <p className="ah-page-hero__ar" lang="ar" dir="rtl">{titleAr}</p>}
        {subtitle && <p className="ah-page-hero__subtitle">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
