-- =============================================
-- Банкетный зал АХТАМ — Supabase миграция
-- Выполнить в: https://supabase.com/dashboard/project/_/sql
-- =============================================

-- 1. Статьи блога
create table if not exists articles (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  excerpt     text,
  content     text,
  status      text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz default now(),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. Страницы событий (СЕО-страницы типа /events/nikah)
create table if not exists event_pages (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title       text not null,
  description text,
  h1          text,
  intro_text  text,
  status      text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  updated_at  timestamptz default now()
);

-- 3. Заявки с сайта
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  phone       text not null,
  event_date  text,
  guest_count int,
  hall_slug   text default 'akhtam-hall',
  message     text,
  source      text default 'website',
  created_at  timestamptz default now()
);

-- 4. Занятые/закрытые даты (для онлайн-календаря)
create table if not exists blocked_dates (
  id         uuid primary key default gen_random_uuid(),
  date       date not null unique,
  note       text,
  created_at timestamptz default now()
);

-- =============================================
-- Права доступа
-- =============================================

-- Анонимный пользователь может только читать published статьи, event_pages и blocked_dates
alter table articles enable row level security;
create policy "public read published articles"
  on articles for select using (status = 'published');

alter table event_pages enable row level security;
create policy "public read published event_pages"
  on event_pages for select using (status = 'published');

alter table blocked_dates enable row level security;
create policy "public read blocked_dates"
  on blocked_dates for select using (true);

-- Заявки: вставка только через service_role (сервер), читает только service_role
alter table leads enable row level security;
-- (без публичных политик — доступ только через SUPABASE_SERVICE_ROLE_KEY)

-- =============================================
-- Индексы
-- =============================================
create index if not exists articles_status_published_at
  on articles (status, published_at desc);

create index if not exists blocked_dates_date
  on blocked_dates (date);

-- =============================================
-- Пример данных для blocked_dates
-- =============================================
-- insert into blocked_dates (date, note) values
--   ('2026-07-05', 'Никах'),
--   ('2026-07-12', 'Свадьба'),
--   ('2026-07-19', 'Корпоратив');
