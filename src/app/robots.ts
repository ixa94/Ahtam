import type { MetadataRoute } from "next";
import branding from "@/config/branding.json";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/"]
    },
    sitemap: `${branding.baseUrl}/sitemap.xml`,
    host: branding.baseUrl
  };
}
