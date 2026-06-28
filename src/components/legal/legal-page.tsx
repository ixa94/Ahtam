import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

type LegalPageProps = {
  title: string;
  paragraphs: string[];
};

export function LegalPage({ title, paragraphs }: LegalPageProps) {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-brand text-white">
          <div className="absolute inset-0 ornament-bg opacity-30" aria-hidden="true" />
          <div className="container-page relative max-w-3xl py-14 md:py-16">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
          </div>
        </section>

        <section className="container-page py-16">
          <article className="mx-auto max-w-3xl space-y-4 text-ink-soft leading-relaxed">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
