import Link from "next/link";
import branding from "@/config/branding.json";
import legalLinks from "@/config/legal-links.json";
import { mapLink } from "@/components/sections/location-map";

export function Footer() {
  const year = new Date().getFullYear();
  const phoneHref = `tel:${branding.phonePrimary.replace(/[^+\d]/g, "")}`;
  const hasEmail = Boolean(branding.email);
  const hasMetro = Boolean(branding.metro);
  const hasMax = Boolean(branding.maxUrl);

  return (
    <footer className="mt-24 border-t border-line bg-base text-ink-soft">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand font-display text-lg font-bold text-gold">
              А
            </span>
            <span className="font-display text-2xl font-bold text-brand">
              {branding.companyName}
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-muted">
            {branding.venueName}. Один зал до 50 гостей с гибкой рассадкой столов и индивидуальным
            сопровождением мероприятия.
          </p>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-brand">Навигация</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/#photos" className="transition-colors hover:text-brand">
                Фото зала
              </Link>
            </li>
            <li>
              <Link href="/#events" className="transition-colors hover:text-brand">
                Мероприятия
              </Link>
            </li>
            <li>
              <Link href="/#promotions" className="transition-colors hover:text-brand">
                Акции
              </Link>
            </li>
            <li>
              <Link href="/articles" className="transition-colors hover:text-brand">
                Статьи
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-brand">Контакты</h3>
          <ul className="mt-5 space-y-3 text-sm text-ink-muted">
            <li>
              <a href={phoneHref} className="transition-colors hover:text-brand">
                {branding.phonePrimary}
              </a>
            </li>
            {hasEmail && (
              <li>
                <a href={`mailto:${branding.email}`} className="transition-colors hover:text-brand">
                  {branding.email}
                </a>
              </li>
            )}
            <li>
              <a
                href={mapLink}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-brand"
              >
                {branding.address}
              </a>
            </li>
            <li>{branding.workHours}</li>
            <li>Контактное лицо: {branding.contactPerson}</li>
            {hasMetro && <li>Метро {branding.metro}</li>}
            {hasMax && (
              <li>
                <a
                  href={branding.maxUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-brand"
                >
                  Написать в MAX
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {branding.companyName}. Все права защищены.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={legalLinks.privacy} className="transition-colors hover:text-brand">
              Политика конфиденциальности
            </Link>
            <Link href={legalLinks.cookies} className="transition-colors hover:text-brand">
              Cookies
            </Link>
            <Link href={legalLinks.personalData} className="transition-colors hover:text-brand">
              Обработка данных
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
