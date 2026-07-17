import type { Metadata } from "next";
import branding from "@/config/branding.json";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных | Кендери",
  description: "Согласие пользователя на обработку персональных данных на сайте Кендери.",
  alternates: {
    canonical: `${branding.baseUrl}/soglasie-na-obrabotku-personalnyh-dannyh`
  }
};

export default function PersonalDataConsentPage() {
  return (
    <LegalPage
      title="Согласие на обработку персональных данных"
      paragraphs={[
        "Оставляя заявку на сайте, пользователь подтверждает согласие на обработку персональных данных.",
        "Мы используем данные только для связи по заявке, подготовки предложения и организации мероприятия.",
        "Пользователь может запросить изменение, удаление или прекращение обработки данных по телефону +7-927-405-31-01."
      ]}
    />
  );
}
