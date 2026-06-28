import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import branding from "@/config/branding.json";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/seo/json-ld";
import { getArticleBySlug, getPublishedArticles } from "@/lib/content/repository";
import { getArticleSchema } from "@/lib/seo/schema";
import { formatDate } from "@/lib/utils";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const articles = await getPublishedArticles(100);
  return articles.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) return { title: "Статья не найдена" };

  const canonical = `${branding.baseUrl}/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonical,
      type: "article",
      locale: "ru_RU"
    }
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-brand text-white">
          <div className="absolute inset-0 ornament-bg opacity-30" aria-hidden="true" />
          <div className="container-page relative max-w-3xl py-16 md:py-20">
            <Link
              href="/articles"
              className="text-sm text-neutral-300 transition-colors hover:text-gold"
            >
              ← Все статьи
            </Link>
            <p className="mt-6 text-xs uppercase tracking-wide text-gold">
              {formatDate(article.publishedAt)}
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.12] sm:text-5xl">
              {article.title}
            </h1>
          </div>
        </section>

        <section className="container-page py-16">
          <article className="mx-auto max-w-3xl">
            <p className="whitespace-pre-line text-lg leading-8 text-ink-soft">{article.content}</p>
          </article>
        </section>
      </main>
      <Footer />
      <JsonLd data={getArticleSchema(article)} />
    </>
  );
}
