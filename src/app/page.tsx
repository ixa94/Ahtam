import type { Metadata } from "next";
import Link from "next/link";
import articlesSeed from "@/config/articles.json";
import branding from "@/config/branding.json";
import eventCategories from "@/config/events.json";
import features from "@/config/features.json";
import { BookingForm } from "@/components/forms/booking-form";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { AvailabilityCalendar } from "@/components/sections/availability-calendar";
import { HallPhotoGallery } from "@/components/sections/hall-photo-gallery";
import { LocationMap, mapLink } from "@/components/sections/location-map";
import { JsonLd } from "@/components/seo/json-ld";
import { FeatureIcon } from "@/components/ui/feature-icon";
import { getPublishedArticles } from "@/lib/content/repository";
import { getLocalBusinessSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Банкетный зал при мечети АХТАМ | Казань",
  description:
    "Банкетный зал при мечети АХТАМ в Казани. Один зал до 50 гостей, гибкая рассадка столов, никахи, свадьбы и семейные мероприятия.",
  alternates: {
    canonical: branding.baseUrl
  },
  openGraph: {
    title: "Банкетный зал при мечети АХТАМ | Казань",
    description:
      "Один банкетный зал до 50 гостей, вариативное расположение столов и индивидуальная организация мероприятия.",
    url: branding.baseUrl,
    type: "website",
    locale: "ru_RU"
  }
};

const stats = [
  { value: "1", label: "банкетный зал" },
  { value: "до 50", label: "гостей максимум" },
  { value: "24", label: "парковочных места" },
  { value: "гибко", label: "меняем рассадку столов" }
];

export default async function HomePage() {
  // Цвет цифр в hero-статистике: text-white / text-gold / text-neutral-900
  const heroStatsColorClass = "text-neutral-900";
  // Цвет слова "гибко": text-white / text-gold / text-neutral-900
  const heroFlexibleWordColorClass = "text-neutral-900";
  // Цвет иконок в блоке "Бронирование": text-white / text-gold / text-neutral-900
  const bookingIconsColorClass = "text-white";

  const fetchedArticles = await getPublishedArticles(3);
  const latestArticles = fetchedArticles.length ? fetchedArticles : articlesSeed.slice(0, 3);

  return (
    <>
      <Header />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 ornament-bg opacity-30" aria-hidden="true" />
          <div
            className="pulse-soft absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="float-y absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-brand/5 blur-3xl"
            aria-hidden="true"
          />

          <div className="container-page relative grid gap-12 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="fade-up">
              <span className="eyebrow">Гастрономическое пространство</span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] text-brand sm:text-5xl lg:text-6xl">
                {branding.venueName} —
                <br />
                банкетный зал для ваших
                <span className="text-gold"> особенных событий</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
                Никахи, свадьбы и семейные мероприятия в Казани. У нас один зал до 50 гостей, а
                расположение столов меняется под формат вашего события.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="#booking" className="btn btn-gold">
                  Забронировать дату
                </Link>
                <Link href="#photos" className="btn btn-outline">
                  Смотреть фото зала
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
                {stats.map((item) => (
                  <div key={item.label}>
                    <div
                      className={`font-display text-3xl font-bold ${
                        item.value === "гибко" ? heroFlexibleWordColorClass : heroStatsColorClass
                      }`}
                    >
                      {item.value}
                    </div>
                    <div className="mt-1 text-xs leading-snug text-ink-muted">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fade-up card p-7 shadow-soft">
              <h2 className="font-display text-xl font-semibold text-brand">Быстрый расчёт</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Оставьте заявку — уточним дату, формат и предложим лучшую рассадку столов.
              </p>
              <div className="mt-6">
                <BookingForm />
              </div>
            </div>
          </div>
        </section>

        <HallPhotoGallery />

        {/* FEATURES */}
        <section className="container-page py-20">
          <div className="max-w-2xl">
            <span className="eyebrow">Почему {branding.companyName}</span>
            <h2 className="section-title mt-4 text-brand">
              Заботимся о каждой детали вашего праздника
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="card card-hover p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand">
                  <FeatureIcon name={feature.icon} className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* EVENTS */}
        <section id="events" className="container-page py-20">
          <div className="max-w-2xl">
            <span className="eyebrow">Мероприятия</span>
            <h2 className="section-title mt-4 text-brand">Проводим события любого формата</h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventCategories.map((event) => (
              <article
                key={event.slug}
                className="card card-hover flex items-center gap-4 p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-gold">
                  ✦
                </span>
                <p className="font-medium text-ink">{event.title}</p>
              </article>
            ))}
          </div>
        </section>

        <AvailabilityCalendar />

        {/* ARTICLES */}
        <section className="bg-white py-20">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-2xl">
                <span className="eyebrow">Журнал</span>
                <h2 className="section-title mt-4 text-brand">Полезные статьи о подготовке</h2>
              </div>
              <Link href="/articles" className="btn btn-dark">
                Все статьи
              </Link>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {latestArticles.map((article) => (
                <article key={article.slug} className="card card-hover flex flex-col p-6">
                  <h3 className="font-display text-lg font-semibold text-ink">
                    <Link href={`/articles/${article.slug}`} className="hover:text-brand">
                      {article.title}
                    </Link>
                  </h3>
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
          </div>
        </section>

        {/* BOOKING */}
        <section id="booking" className="relative overflow-hidden bg-brand py-20 text-white">
          <div className="absolute inset-0 ornament-bg opacity-30" aria-hidden="true" />
          <div className="container-page relative grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="eyebrow">Бронирование</span>
              <h2 className="section-title mt-4 text-white">Забронируйте ваше мероприятие</h2>
              <p className="mt-5 max-w-md text-neutral-300">
                Оставьте заявку, и мы свяжемся с вами: уточним дату, формат и предложим удобное
                расположение столов в нашем единственном зале до 50 гостей.
              </p>

              <div className="mt-8 space-y-3 text-sm">
                <a
                  href={`tel:${branding.phoneBooking.replace(/[^+\d]/g, "")}`}
                  className="flex items-center gap-3 text-neutral-200 transition-colors hover:text-gold"
                >
                  <span className={bookingIconsColorClass}>☎</span> {branding.phoneBooking}
                </a>
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-neutral-200 transition-colors hover:text-gold"
                >
                  <span className={bookingIconsColorClass}>⌖</span> {branding.address}
                </a>
                <p className="flex items-center gap-3 text-neutral-200">
                  <span className={bookingIconsColorClass}>◷</span> {branding.workHours}
                </p>
                <p className="flex items-center gap-3 text-neutral-200">
                  <span className={bookingIconsColorClass}>👤</span> {branding.contactPerson}
                </p>
                <a
                  href={branding.maxUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-neutral-200 transition-colors hover:text-gold"
                >
                  <span className={bookingIconsColorClass}>💬</span> Написать в MAX
                </a>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-7 text-ink shadow-soft">
              <BookingForm />
            </div>
          </div>
        </section>

        <LocationMap />
      </main>

      <Footer />
      <JsonLd data={getLocalBusinessSchema()} />
    </>
  );
}
