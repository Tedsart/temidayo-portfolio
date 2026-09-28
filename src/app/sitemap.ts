import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getAllPublishedSlugs } from "@/lib/data/projects";
import { getAllLiveProductSlugs } from "@/lib/data/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, productSlugs] = await Promise.all([
    getAllPublishedSlugs(),
    getAllLiveProductSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const projectPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${siteConfig.url}/work/${slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const bookPages: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${siteConfig.url}/book/${slug}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...projectPages, ...bookPages];
}
