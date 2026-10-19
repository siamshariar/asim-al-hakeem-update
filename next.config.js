module.exports = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/qna": ["./data/qna.json", "./data/qnCat.json"],
      "/qna/[[...slug]]": ["./data/qna.json", "./data/qnCat.json"],
      "/qna/answer/[id]": ["./data/qna.json", "./data/qnCat.json"],
    },
  },
  async rewrites() {
    // Browsers request /favicon.ico by default; the icon lives under /img/id
    return [{ source: "/favicon.ico", destination: "/img/id/favicon.ico" }];
  },
  async redirects() {
    // Old FAQ pages (/questions) duplicated entries that live in the Q&A archive.
    const legacyQuestions = {
      "zakat-gold-distribution": 2938874,
      "zakat-62-gram-gold": 6711353,
      "witr-prayer-obligation": 638858,
      "istikhara-dua-transliteration": 8706322,
      "makkah-umrah-mandatory": 6567897,
      "kaaba-touching-kissing": 947148,
      "fasting-reward-meal": 6119443,
      "kidney-stones-fasting-exemption": 611714,
      "breastfeeding-fasting-kafir-doctor": 1010137,
      "maghreb-prayer-break-fast": 9137528,
      "ashura-fasting-scholar-opinion": 459783,
    };

    return [
      {
        source: "/lectures",
        destination: "/lectures/UUWsdcrre0WbCWML_PnuzoAg",
        permanent: true,
      },
      // Template leftovers with placeholder books; the real list is /books
      { source: "/book", destination: "/books", permanent: true },
      { source: "/book/:id", destination: "/books", permanent: true },
      ...Object.entries(legacyQuestions).map(([slug, id]) => ({
        source: `/questions/watch/${slug}`,
        destination: `/qna/answer/${id}`,
        permanent: true,
      })),
      { source: "/questions/watch/:slug", destination: "/qna", permanent: true },
      { source: "/questions", destination: "/qna", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blog-dev1dit.vercel.app",
      },
      {
        protocol: "https",
        hostname: "muhammadsaifullah.com",
      },
      {
        protocol: "https",
        hostname: "www.muhammadsaifullah.com",
      },
      {
        protocol: "https",
        hostname: "www.assimalhakeem.net",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};
