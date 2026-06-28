# Дизайн-система и токены для быстрой настройки

## Цель

Сделать новую версию сайта полностью настраиваемой через конфиги:

- смена цветов за 1 файл
- замена фото без правки компонентов
- изменение шрифтов/радиусов/теней через токены
- единые правила кнопок, карточек, форм и типографики

---

## Набор дизайн-токенов (рекомендуемый)

## 1) Цвета `theme.colors`

- `brand.primary`
- `brand.secondary`
- `brand.accent`
- `bg.base`
- `bg.surface`
- `text.primary`
- `text.secondary`
- `text.inverse`
- `border.default`
- `status.success`
- `status.warning`
- `status.error`

Пример:

```json
{
  "brand": {
    "primary": "#A67C52",
    "secondary": "#2E2A27",
    "accent": "#D4AF7F"
  },
  "bg": {
    "base": "#FFFFFF",
    "surface": "#F8F6F3"
  },
  "text": {
    "primary": "#1B1B1B",
    "secondary": "#5B5B5B",
    "inverse": "#FFFFFF"
  }
}
```

## 2) Типографика `theme.typography`

- `fontFamily.base`
- `fontFamily.heading`
- `fontSize.xs/sm/md/lg/xl/2xl/3xl`
- `lineHeight.tight/normal/relaxed`
- `fontWeight.regular/medium/semibold/bold`

## 3) Отступы `theme.spacing`

- шкала: `4, 8, 12, 16, 24, 32, 40, 48, 64, 80`

## 4) Радиусы и тени

- `radius.sm/md/lg/xl`
- `shadow.card`
- `shadow.dropdown`
- `shadow.modal`

## 5) Состояния интерактивных элементов

- `button.primary.default/hover/active/disabled`
- `button.secondary.*`
- `input.default/focus/error`

---

## Компоненты, которые обязательно стандартизировать

## 1) Кнопки

- Primary: "Забронировать", "Получить расчет"
- Secondary: "Подробнее", "Продегустировать"

## 2) Карточки

- Карточка зала
- Карточка меню
- Карточка акции
- Карточка отзыва

## 3) Формы

- единый стиль полей
- единая валидация
- единый компонент согласия с ПДн
- единые сообщения об ошибках/успехе

## 4) Секции

- унифицированные отступы между секциями
- единые контейнеры по ширине
- единая сетка для desktop/tablet/mobile

---

## Адаптивность (минимальные брейкпоинты)

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

Правила:

- формы не должны "склеиваться" в мобильном режиме;
- важные CTA всегда видны в первом экране;
- карточки залов и меню должны читаться без горизонтального скролла.

---

## Структура файлов темы (рекомендуемая)

- `src/config/theme.json`
- `src/config/branding.json`
- `src/styles/tokens.css` (или TS-обертка над JSON)

Пример `branding.json`:

```json
{
  "companyName": "Эмиз",
  "phonePrimary": "+7 (843) 212-65-19",
  "phoneBooking": "+7 (987) 290-60-40",
  "email": "emizbanket@mail.ru",
  "address": "г. Казань, улица Сафиуллина, 29",
  "workHours": "Ежедневно, 09:00-24:00",
  "metro": "Дубравная"
}
```

---

## Что это даст бизнесу

- быстрый ребрендинг без переделки верстки;
- масштабирование на новые направления;
- единый визуальный стандарт;
- меньше ошибок при ручных правках;
- ускорение запуска новых промо и страниц.
