import wardrobe from "@/assets/photos/photo_2026-06-06_13-31-35.jpg";
import hallA from "@/assets/photos/photo_2026-06-06_13-31-30.jpg";
import hallB from "@/assets/photos/photo_2026-06-06_13-31-29.jpg";
import hallC from "@/assets/photos/photo_2026-06-06_13-31-27.jpg";
import hallD from "@/assets/photos/photo_2026-06-06_13-31-26.jpg";
import hallE from "@/assets/photos/photo_2026-06-06_13-31-13.jpg";

export const hallPhotos = [
  {
    id: "wardrobe",
    src: wardrobe,
    title: "Гардероб и прихожая",
    description: "Удобная зона встречи гостей перед началом мероприятия."
  },
  {
    id: "layout-1",
    src: hallA,
    title: "Вариация рассадки №1",
    description: "Рассадка под торжественный формат с центральной композицией."
  },
  {
    id: "layout-2",
    src: hallB,
    title: "Вариация рассадки №2",
    description: "Камерная подача с акцентом на президиум."
  },
  {
    id: "layout-3",
    src: hallC,
    title: "Вариация рассадки №3",
    description: "Параллельная рассадка для семейных и деловых встреч."
  },
  {
    id: "layout-4",
    src: hallD,
    title: "Вариация рассадки №4",
    description: "Зал трансформируется под формат события и количество гостей."
  },
  {
    id: "layout-5",
    src: hallE,
    title: "Вариация рассадки №5",
    description: "Свободная конфигурация столов: меняем расположение по вашему сценарию."
  }
] as const;
