import { motion } from "framer-motion";

export default function PageHero({
  title,
  subtitle,
  Icon,
  children,
  imageSrc, // optional image shown on mobile above the text
  imageAlt = "",
  align = "center",
  maxWidth = "max-w-[1260px]",
}) {
  const isCenter = align === "center";

  return (
    <section className="relative overflow-hidden">
      {/** Mobile image at the very top when provided */}
      {imageSrc ? (
        <div className="md:hidden w-full">
          <img src={imageSrc} alt={imageAlt} className="w-full h-56 object-cover" />
        </div>
      ) : null}

      <div className={`relative overflow-hidden bg-gradient-to-br from-[#24334d] via-[#2b3f5e] to-[#334a6b] ${imageSrc ? "py-6 sm:py-8 md:py-10 lg:py-14" : "py-8 sm:py-10 lg:py-14"}`}>
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute -top-24 -left-10 h-56 w-56 rounded-full bg-[#10b981]/20 blur-3xl" />
          <div className="absolute -bottom-28 -right-10 h-64 w-64 rounded-full bg-[#93c5fd]/20 blur-3xl" />
        </div>

        <div className={`container ${maxWidth} mx-auto px-4 relative z-10 ${isCenter ? "text-center" : ""}`}>
          {children}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {Icon ? (
              <Icon
                size={36}
                className={`${isCenter ? "mx-auto" : ""} mb-3 sm:mb-4 text-[#34d399] sm:w-10 sm:h-10 lg:w-12 lg:h-12`}
              />
            ) : null}
            <h1 className={`page-title text-white ${subtitle ? "mb-2 sm:mb-3" : ""}`}>{title}</h1>
            {subtitle ? (
              <p className={`text-sm sm:text-base text-slate-200 max-w-2xl ${isCenter ? "mx-auto" : ""}`}>
                {subtitle}
              </p>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
