import Image from "next/image";

// 16:9 article thumbnail. Optional per-article hints from the data:
// imageFocus (object-position) and imageLetterbox (image has black bars baked
// in above and below; zoom just enough to hide them).
export default function ArticleCardImage({ article, sizes, priority = false }) {
  const src = article.imageSrc || article.image || "/img/articles/default.jpg";
  const focus = article.imageFocus || "50% 50%";

  return (
    <div className={`ah-acard__img${article.imageLetterbox ? " ah-acard__img--letterbox" : ""}`}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectPosition: focus, transformOrigin: focus }}
      />
    </div>
  );
}
