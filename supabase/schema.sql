-- Кендери: базовая схема Supabase (Postgres)
-- Модель хранения: draft/published/archived + версия + архив.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type content_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

create table if not exists halls (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  capacity text not null,
  price_from integer not null default 0,
  parking integer not null default 0,
  status content_status not null default 'draft',
  version integer not null default 1,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists event_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  h1 text not null,
  intro_text text not null,
  status content_status not null default 'draft',
  version integer not null default 1,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  status content_status not null default 'draft',
  version integer not null default 1,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status content_status not null default 'draft',
  version integer not null default 1,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  role text,
  event text not null,
  status content_status not null default 'draft',
  version integer not null default 1,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  event_date text,
  guest_count integer,
  hall_slug text,
  message text,
  source text not null default 'website',
  created_at timestamptz not null default now()
);

-- Универсальный архив версий (снимки контента)
create table if not exists content_versions (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_key text not null,
  version integer not null,
  status content_status not null,
  payload jsonb not null,
  published_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_pages_status on event_pages(status);
create index if not exists idx_articles_status on articles(status);
create index if not exists idx_articles_published_at on articles(published_at desc);
create index if not exists idx_content_versions_entity on content_versions(entity_type, entity_key, version desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function archive_other_published_articles()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' then
    update articles
    set status = 'archived',
        archived_at = now(),
        updated_at = now()
    where slug = new.slug
      and id <> new.id
      and status = 'published';
  end if;
  return new;
end;
$$;

create or replace function archive_other_published_event_pages()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' then
    update event_pages
    set status = 'archived',
        archived_at = now(),
        updated_at = now()
    where slug = new.slug
      and id <> new.id
      and status = 'published';
  end if;
  return new;
end;
$$;

create or replace function write_content_version_snapshot()
returns trigger
language plpgsql
as $$
declare
  payload_data jsonb;
  entity_type_name text;
  entity_key_value text;
begin
  payload_data = to_jsonb(new);
  entity_type_name = tg_table_name;
  entity_key_value = coalesce(new.slug, new.id::text);

  insert into content_versions (
    entity_type,
    entity_key,
    version,
    status,
    payload,
    published_at,
    archived_at
  )
  values (
    entity_type_name,
    entity_key_value,
    new.version,
    new.status,
    payload_data,
    new.published_at,
    new.archived_at
  );

  return new;
end;
$$;

drop trigger if exists halls_set_updated_at on halls;
create trigger halls_set_updated_at
before update on halls
for each row execute function set_updated_at();

drop trigger if exists event_pages_set_updated_at on event_pages;
create trigger event_pages_set_updated_at
before update on event_pages
for each row execute function set_updated_at();

drop trigger if exists articles_set_updated_at on articles;
create trigger articles_set_updated_at
before update on articles
for each row execute function set_updated_at();

drop trigger if exists promotions_set_updated_at on promotions;
create trigger promotions_set_updated_at
before update on promotions
for each row execute function set_updated_at();

drop trigger if exists testimonials_set_updated_at on testimonials;
create trigger testimonials_set_updated_at
before update on testimonials
for each row execute function set_updated_at();

drop trigger if exists event_pages_archive_trigger on event_pages;
create trigger event_pages_archive_trigger
after insert or update on event_pages
for each row execute function archive_other_published_event_pages();

drop trigger if exists articles_archive_trigger on articles;
create trigger articles_archive_trigger
after insert or update on articles
for each row execute function archive_other_published_articles();

drop trigger if exists halls_versions_trigger on halls;
create trigger halls_versions_trigger
after insert or update on halls
for each row execute function write_content_version_snapshot();

drop trigger if exists event_pages_versions_trigger on event_pages;
create trigger event_pages_versions_trigger
after insert or update on event_pages
for each row execute function write_content_version_snapshot();

drop trigger if exists articles_versions_trigger on articles;
create trigger articles_versions_trigger
after insert or update on articles
for each row execute function write_content_version_snapshot();

drop trigger if exists promotions_versions_trigger on promotions;
create trigger promotions_versions_trigger
after insert or update on promotions
for each row execute function write_content_version_snapshot();

drop trigger if exists testimonials_versions_trigger on testimonials;
create trigger testimonials_versions_trigger
after insert or update on testimonials
for each row execute function write_content_version_snapshot();
