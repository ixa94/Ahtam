# Кендери — SEO сайт на Next.js + Supabase

Проект новой версии сайта банкетного зала **Кендери** с приоритетом на SEO, управляемый контент и архив версий.

## Что реализовано

- Next.js (App Router) + TypeScript + Tailwind.
- SEO-слой:
  - metadata + OpenGraph на страницах;
  - `sitemap.xml` и `robots.txt`;
  - JSON-LD (`LocalBusiness`, `Article`).
- Динамические страницы:
  - `/events/[slug]` — SEO-страницы мероприятий;
  - `/articles` и `/articles/[slug]` — блок статей.
- Форма заявок:
  - валидация (`zod`, `react-hook-form`);
  - API endpoint `/api/leads`;
  - сохранение в Supabase `leads`.
- Конфиг-слой для быстрой замены контента и брендинга:
  - `src/config/theme.json`, `branding.json`, `halls.json`, `event-pages.json` и др.
- Supabase схема с жизненным циклом контента:
  - `draft / published / archived`;
  - `version`;
  - архив снимков в `content_versions`.

## Запуск локально

1. Установить зависимости:

```bash
npm install
```

2. Создать `.env.local` по примеру `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. Запустить dev-сервер:

```bash
npm run dev
```

4. Production сборка:

```bash
npm run build
npm run start
```

## Supabase: схема и сиды

- Схема БД: `supabase/schema.sql`
- Стартовые данные: `supabase/seed.sql`

Порядок применения:

1. Выполнить `schema.sql`.
2. Выполнить `seed.sql`.

## Как обновляется контент

- Новая версия записи публикуется со статусом `published`.
- Предыдущая активная версия уходит в `archived`.
- История изменений сохраняется в `content_versions`.
- На витрине сайта показываются только `published` записи.

## Полезные пути

- Главная: `/`
- Статьи: `/articles`
- Пример события: `/events/banketnyj-zal-v-kazani-dlya-korporativov`
