import articleSeed from "@/config/articles.json";
import eventPageSeed from "@/config/event-pages.json";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Article, EventPage, LeadPayload } from "@/types/content";

type SupabaseArticleRow = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: string;
  status: "draft" | "published" | "archived";
};

type SupabaseEventPageRow = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro_text: string;
  status: "draft" | "published" | "archived";
};

function mapEventPage(row: SupabaseEventPageRow): EventPage {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    h1: row.h1,
    introText: row.intro_text
  };
}

function mapArticle(row: SupabaseArticleRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    publishedAt: row.published_at,
    status: row.status
  };
}

export async function getPublishedEventPages(): Promise<EventPage[]> {
  const client = getSupabaseServerClient();
  if (!client) {
    return eventPageSeed as EventPage[];
  }

  const { data, error } = await client
    .from("event_pages")
    .select("slug,title,description,h1,intro_text,status")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (error || !data?.length) {
    return eventPageSeed as EventPage[];
  }

  return data.map(mapEventPage);
}

export async function getEventPageBySlug(slug: string): Promise<EventPage | null> {
  const client = getSupabaseServerClient();
  if (!client) {
    const local = (eventPageSeed as EventPage[]).find((item) => item.slug === slug);
    return local ?? null;
  }

  const { data, error } = await client
    .from("event_pages")
    .select("slug,title,description,h1,intro_text,status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    const local = (eventPageSeed as EventPage[]).find((item) => item.slug === slug);
    return local ?? null;
  }

  return mapEventPage(data);
}

export async function getPublishedArticles(limit = 6): Promise<Article[]> {
  const client = getSupabaseServerClient();
  if (!client) {
    return [...(articleSeed as Article[])].sort((a, b) =>
      a.publishedAt < b.publishedAt ? 1 : -1
    );
  }

  const { data, error } = await client
    .from("articles")
    .select("slug,title,excerpt,content,published_at,status")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data?.length) {
    return [...(articleSeed as Article[])].sort((a, b) =>
      a.publishedAt < b.publishedAt ? 1 : -1
    );
  }

  return data.map(mapArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const client = getSupabaseServerClient();
  if (!client) {
    const local = (articleSeed as Article[]).find((item) => item.slug === slug);
    return local ?? null;
  }

  const { data, error } = await client
    .from("articles")
    .select("slug,title,excerpt,content,published_at,status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    const local = (articleSeed as Article[]).find((item) => item.slug === slug);
    return local ?? null;
  }

  return mapArticle(data);
}

export async function createLead(payload: LeadPayload): Promise<void> {
  const client = getSupabaseServerClient();
  if (!client) return;

  await client.from("leads").insert({
    name: payload.name ?? null,
    phone: payload.phone,
    event_date: payload.eventDate ?? null,
    guest_count: payload.guestCount ?? null,
    hall_slug: payload.hallSlug ?? null,
    message: payload.message ?? null,
    source: payload.source ?? "website"
  });
}
