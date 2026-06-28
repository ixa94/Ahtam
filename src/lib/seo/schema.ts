import branding from "@/config/branding.json";
import type { Article } from "@/types/content";

export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: branding.venueName ?? branding.companyName,
    image: `${branding.baseUrl}/icon.svg`,
    url: branding.baseUrl,
    telephone: branding.phonePrimary,
    address: {
      "@type": "PostalAddress",
      streetAddress: branding.address,
      addressLocality: branding.city,
      addressCountry: "RU"
    },
    openingHours: "Mo-Su 09:00-24:00",
    servesCuisine: ["Татарская", "Восточная", "Халяль"]
  };
}

export function getFaqSchema(faq: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}

export function getArticleSchema(article: Article) {
  const articleUrl = `${branding.baseUrl}/articles/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: articleUrl,
    author: {
      "@type": "Organization",
      name: branding.companyName
    },
    publisher: {
      "@type": "Organization",
      name: branding.companyName
    }
  };
}
