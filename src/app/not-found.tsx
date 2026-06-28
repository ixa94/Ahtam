import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="container-page flex min-h-[60vh] items-center justify-center py-20">
        <section className="card max-w-lg p-10 text-center">
          <p className="font-display text-6xl font-bold text-gold">404</p>
          <h1 className="mt-4 font-display text-2xl font-bold text-ink">Страница не найдена</h1>
          <p className="mt-3 text-ink-soft">
            Возможно, материал был перемещён в архив. Вернитесь на главную страницу.
          </p>
          <Link href="/" className="btn btn-dark mt-7">
            На главную
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
