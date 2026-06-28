import type { Metadata } from "next";
import branding from "@/config/branding.json";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Согласие на обработку cookies | Кендери",
  description: "Правила использования файлов cookie на сайте Кендери.",
  alternates: {
    canonical: `${branding.baseUrl}/soglasie-na-obrabotku-cookies`
  }
};

export default function CookiesConsentPage() {
  return (
    <LegalPage
      title="Согласие на обработку cookies"
      paragraphs={[
        "Сайт использует cookie-файлы для корректной работы, аналитики и улучшения пользовательского опыта.",
        "Вы можете отключить cookies в настройках браузера, но часть функций сайта может работать некорректно.",
        "Продолжая использовать сайт, пользователь подтверждает согласие с правилами обработки cookie."
      ]}
    />
  );
}
