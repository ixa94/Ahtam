import Link from "next/link";
import branding from "@/config/branding.json";
import legalLinks from "@/config/legal-links.json";

export function Footer() {
  const year = new Date().getFullYear();
  const phoneHref = `tel:${branding.phonePrimary.replace(/[^+\d]/g, "")}`;
  const hasEmail = Boolean(branding.email);
  const hasMetro = Boolean(branding.metro);
  const hasMax = Boolean(branding.maxUrl);

  return (
    <footer className="mt-24 bg-brand-dark text-neutral-300">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft font-display text-lg font-bold text-gold">
              А
            </span>
            <span className="font-display text-2xl font-bold text-white">
              {branding.companyName}
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-400">
            {branding.venueName}. Один зал до 50 гостей с гибкой рассадкой столов и индивидуальным
            сопровождением мероприятия.
          </p>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-white">Навигация</h3>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link href="/#photos" className="transition-colors hover:text-gold">
                Фото зала
              </Link>
            </li>
            <li>
              <Link href="/#events" className="transition-colors hover:text-gold">
                Мероприятия
              </Link>
            </li>
            <li>
              <Link href="/#promotions" className="transition-colors hover:text-gold">
                Акции
              </Link>
            </li>
            <li>
              <Link href="/articles" className="transition-colors hover:text-gold">
                Статьи
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-base font-semibold text-white">Контакты</h3>
          <ul className="mt-5 space-y-3 text-sm text-neutral-400">
            <li>
              <a href={phoneHref} className="transition-colors hover:text-gold">
                {branding.phonePrimary}
              </a>
            </li>
            {hasEmail && (
              <li>
                <a href={`mailto:${branding.email}`} className="transition-colors hover:text-gold">
                  {branding.email}
                </a>
              </li>
            )}
            <li>{branding.address}</li>
            <li>{branding.workHours}</li>
            <li>Контактное лицо: {branding.contactPerson}</li>
            {hasMetro && <li>Метро {branding.metro}</li>}
            {hasMax && (
              <li>
                <a
                  href={branding.maxUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-gold"
                >
                  Написать в MAX
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {branding.companyName}. Все права защищены.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={legalLinks.privacy} className="transition-colors hover:text-gold">
              Политика конфиденциальности
            </Link>
            <Link href={legalLinks.cookies} className="transition-colors hover:text-gold">
              Cookies
            </Link>
            <Link href={legalLinks.personalData} className="transition-colors hover:text-gold">
              Обработка данных
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
