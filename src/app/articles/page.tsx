import type { Metadata } from "next";
import Link from "next/link";
import branding from "@/config/branding.json";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { getPublishedArticles } from "@/lib/content/repository";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Статьи | Кендери",
  description:
    "Полезные статьи о подготовке банкетов, никахов, корпоративов и других мероприятий в Казани.",
  alternates: {
    canonical: `${branding.baseUrl}/articles`
  }
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles(100);

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-brand text-white">
          <div className="absolute inset-0 ornament-bg opacity-30" aria-hidden="true" />
          <div className="container-page relative py-16 md:py-20">
            <span className="eyebrow">Журнал</span>
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">Статьи</h1>
            <p className="mt-4 max-w-2xl text-neutral-300">
              Раздел обновляется регулярно: новые материалы поднимаются выше, прошлые сохраняются в
              архиве.
            </p>
          </div>
        </section>

        <section className="container-page py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.slug} className="card card-hover flex flex-col p-6">
                <p className="text-xs uppercase tracking-wide text-gold">
                  {formatDate(article.publishedAt)}
                </p>
                <h2 className="mt-3 font-display text-lg font-semibold text-ink">
                  <Link href={`/articles/${article.slug}`} className="hover:text-brand">
                    {article.title}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                  {article.excerpt}
                </p>
                <Link
                  href={`/articles/${article.slug}`}
                  className="mt-5 text-sm font-semibold text-gold hover:text-brand"
                >
                  Читать далее →
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
