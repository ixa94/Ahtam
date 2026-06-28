import type { Metadata } from "next";
import branding from "@/config/branding.json";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Политика конфиденциальности | Кендери",
  description: "Политика обработки персональных данных сайта Кендери.",
  alternates: {
    canonical: `${branding.baseUrl}/policy-privacy`
  }
};

export default function PolicyPrivacyPage() {
  return (
    <LegalPage
      title="Политика конфиденциальности"
      paragraphs={[
        "Настоящая политика определяет порядок обработки персональных данных пользователей сайта Кендери.",
        "Мы обрабатываем данные, которые вы добровольно указываете в формах обратной связи и бронирования.",
        "Данные используются только для связи, подготовки предложения и исполнения обязательств перед клиентом.",
        "Пользователь может отозвать согласие на обработку персональных данных по электронной почте info@kenderi.ru."
      ]}
    />
  );
}
