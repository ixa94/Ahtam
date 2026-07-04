import branding from "@/config/branding.json";

const mapQuery = encodeURIComponent(branding.address);
const mapEmbedSrc = `https://yandex.ru/map-widget/v1/?text=${mapQuery}&z=16`;
export const mapLink = `https://yandex.ru/maps/?text=${mapQuery}`;

export function LocationMap() {
  return (
    <section id="location" className="container-page py-16 md:py-20">
      <div className="max-w-2xl">
        <span className="eyebrow">Как нас найти</span>
        <h2 className="section-title mt-4 text-brand">Расположение</h2>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <div className="card flex flex-col justify-between gap-6 p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Адрес</p>
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="mt-2 block font-display text-lg font-semibold text-brand transition-colors hover:text-gold"
            >
              {branding.address}
            </a>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Режим работы
            </p>
            <p className="mt-2 text-ink-soft">{branding.workHours}</p>
          </div>

          <a href={mapLink} target="_blank" rel="noreferrer" className="btn btn-dark w-fit">
            Проложить маршрут
          </a>
        </div>

        <div className="card overflow-hidden">
          <iframe
            src={mapEmbedSrc}
            className="h-[320px] w-full lg:h-[420px]"
            style={{ border: 0 }}
            loading="lazy"
            title="Расположение на карте"
          />
        </div>
      </div>
    </section>
  );
}
