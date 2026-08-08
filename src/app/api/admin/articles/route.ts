import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import articleSeed from "@/config/articles.json";
import { readJson, writeJson } from "@/lib/data/file-store";
import { slugify } from "@/lib/content/slugify";
import type { Article } from "@/types/content";
import { isAdminAuthenticated } from "@/lib/security/admin-auth";

const articleSchema = z.object({
  slug: z.string().trim().min(1).max(200).optional(),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(500),
  content: z.string().trim().min(1).max(100_000),
}).strict();

async function readArticles() {
  return readJson<Article[]>("articles.json", articleSeed as Article[]);
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const articles = await readArticles();
  return NextResponse.json({
    articles: [...articles].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  });
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = articleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "validation_error" }, { status: 400 });
  const { slug: existingSlug, title, excerpt, content } = parsed.data;

  const articles = await readArticles();

  if (existingSlug) {
    const idx = articles.findIndex((a) => a.slug === existingSlug);
    if (idx === -1) {
      return NextResponse.json({ error: "article not found" }, { status: 404 });
    }
    articles[idx] = { ...articles[idx], title, excerpt, content };
    await writeJson("articles.json", articles);
    return NextResponse.json({ ok: true, slug: existingSlug });
  }

  const base = slugify(title) || "statya";
  let slug = base;
  let n = 2;
  while (articles.some((a) => a.slug === slug)) {
    slug = `${base}-${n}`;
    n++;
  }

  articles.push({
    slug,
    title,
    excerpt,
    content,
    publishedAt: new Date().toISOString()
  });
  await writeJson("articles.json", articles);
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await request.json();
  if (typeof slug !== "string" || !slug || slug.length > 200) {
    return NextResponse.json({ error: "valid slug required" }, { status: 400 });
  }

  const articles = await readArticles();
  await writeJson("articles.json", articles.filter((a) => a.slug !== slug));
  return NextResponse.json({ ok: true });
}
