import Image from "next/image";
import { hallPhotos } from "@/config/hall-photos";

export function HallPhotoGallery() {
  const [firstPhoto, ...hallLayouts] = hallPhotos;

  return (
    <section id="photos" className="container-page py-16 md:py-20">
      <div className="max-w-3xl">
        <span className="eyebrow">Фото зала</span>
        <h2 className="section-title mt-4 text-brand">Один зал и вариации расположения столов</h2>
        <p className="mt-4 text-ink-soft">
          У нас один банкетный зал до 50 гостей. Первое фото — гардероб/прихожая. На остальных
          фотографиях показаны варианты рассадки: расположение столов меняется под формат вашего
          события.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <article className="card overflow-hidden">
          <div className="relative h-[420px] w-full">
            <Image
              src={firstPhoto.src}
              alt={firstPhoto.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>
          <div className="p-5">
            <h3 className="font-display text-xl font-semibold text-ink">{firstPhoto.title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{firstPhoto.description}</p>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {hallLayouts.slice(0, 2).map((photo) => (
            <article key={photo.id} className="card overflow-hidden">
              <div className="relative h-[180px] w-full">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover transition duration-500 hover:scale-105"
                  sizes="(max-width: 1024px) 50vw, 35vw"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-ink">{photo.title}</h3>
                <p className="mt-1 text-xs text-ink-soft">{photo.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hide-scrollbar mt-7 flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {hallLayouts.map((photo) => (
          <article
            key={photo.id}
            className="card min-w-[280px] snap-start overflow-hidden md:min-w-0"
          >
            <div className="relative h-[210px] w-full">
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                className="object-cover transition duration-500 hover:scale-105"
                sizes="(max-width: 768px) 80vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-ink">{photo.title}</h3>
              <p className="mt-1 text-xs text-ink-soft">{photo.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
