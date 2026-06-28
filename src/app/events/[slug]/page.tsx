import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import branding from "@/config/branding.json";
import halls from "@/config/halls.json";
import { BookingForm } from "@/components/forms/booking-form";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { JsonLd } from "@/components/seo/json-ld";
import { getEventPageBySlug, getPublishedEventPages } from "@/lib/content/repository";
import { getLocalBusinessSchema } from "@/lib/seo/schema";
import { formatPrice } from "@/lib/utils";

type EventPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const pages = await getPublishedEventPages();
  return pages.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getEventPageBySlug(slug);

  if (!page) {
    return { title: "Страница не найдена" };
  }

  const canonical = `${branding.baseUrl}/events/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      locale: "ru_RU",
      type: "article"
    }
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const page = await getEventPageBySlug(slug);

  if (!page) notFound();

  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-brand text-white">
          <div className="absolute inset-0 ornament-bg opacity-30" aria-hidden="true" />
          <div
            className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="container-page relative py-20 md:py-24">
            <Link href="/" className="text-sm text-neutral-300 transition-colors hover:text-gold">
              ← На главную
            </Link>
            <span className="eyebrow mt-6">{branding.companyName}</span>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300">
              {page.introText}
            </p>
            <div className="mt-9">
              <Link href="#booking" className="btn btn-gold">
                Забронировать дату
              </Link>
            </div>
          </div>
        </section>

        <section className="container-page py-20">
          <div className="max-w-2xl">
            <span className="eyebrow">Наш зал</span>
            <h2 className="section-title mt-4 text-brand">Один зал до 50 гостей</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {halls.map((hall) => (
              <article key={hall.slug} className="card card-hover overflow-hidden">
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-brand to-brand-soft">
                  <div className="absolute inset-0 ornament-bg opacity-30" aria-hidden="true" />
                  <span className="relative font-display text-xl font-semibold text-gold">
                    {branding.companyName}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-semibold text-ink">{hall.name}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{hall.capacity}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <span className="text-sm text-ink-muted">Аренда</span>
                    <span className="font-display text-lg font-semibold text-brand">
                      от {formatPrice(hall.priceFrom)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="booking" className="bg-white py-20">
          <div className="container-page max-w-3xl">
            <div className="text-center">
              <span className="eyebrow">Бронирование</span>
              <h2 className="section-title mt-4 text-brand">Оставьте заявку</h2>
            </div>
            <div className="mt-10 card p-7">
              <BookingForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <JsonLd data={getLocalBusinessSchema()} />
    </>
  );
}
