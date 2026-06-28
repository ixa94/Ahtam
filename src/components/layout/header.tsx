import Link from "next/link";
import branding from "@/config/branding.json";

const navItems = [
  { href: "/#photos", label: "Фото зала" },
  { href: "/#events", label: "Мероприятия" },
  { href: "/#calendar", label: "Свободные даты" },
  { href: "/articles", label: "Статьи" }
];

export function Header() {
  const phoneHref = `tel:${branding.phoneBooking.replace(/[^+\d]/g, "")}`;

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-base/85 backdrop-blur-md">
      <div className="container-page flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand font-display text-lg font-bold text-gold">
            А
          </span>
          <span className="font-display text-xl font-bold text-brand">{branding.companyName}</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={phoneHref}
            className="hidden text-sm font-semibold text-brand transition-colors hover:text-gold sm:block"
          >
            {branding.phoneBooking}
          </a>
          <Link href="/#booking" className="btn btn-dark px-5 py-2.5 text-sm">
            Забронировать
          </Link>
        </div>
      </div>
    </header>
  );
}
