import { NextResponse } from "next/server";
import articleSeed from "@/config/articles.json";
import { readJson, writeJson } from "@/lib/data/file-store";
import { slugify } from "@/lib/content/slugify";
import type { Article } from "@/types/content";

function checkAuth(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  const auth = request.headers.get("x-admin-password");
  return !!(password && auth === password);
}

async function readArticles() {
  return readJson<Article[]>("articles.json", articleSeed as Article[]);
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const articles = await readArticles();
  return NextResponse.json({
    articles: [...articles].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  });
}

export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { slug: existingSlug, title, excerpt, content } = body;

  if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title, excerpt and content required" }, { status: 400 });
  }

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

export async function DELETE(request: Request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { slug } = await request.json();
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

  const articles = await readArticles();
  await writeJson("articles.json", articles.filter((a) => a.slug !== slug));
  return NextResponse.json({ ok: true });
}
