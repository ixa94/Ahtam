import type { MetadataRoute } from "next";
import branding from "@/config/branding.json";
import { getPublishedArticles, getPublishedEventPages } from "@/lib/content/repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = branding.baseUrl;
  const [articles, eventPages] = await Promise.all([
    getPublishedArticles(500),
    getPublishedEventPages()
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${base}/articles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8
    }
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((item) => ({
    url: `${base}/articles/${item.slug}`,
    lastModified: new Date(item.publishedAt),
    changeFrequency: "weekly",
    priority: 0.7
  }));

  const eventRoutePages: MetadataRoute.Sitemap = eventPages.map((item) => ({
    url: `${base}/events/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9
  }));

  return [...staticPages, ...eventRoutePages, ...articlePages];
}
