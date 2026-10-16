import type { MetadataRoute } from "next";
import { getProjects } from "@/src/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/#about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/#projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/#contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const projects = await getProjects();
    for (const p of projects) {
      if (p.comingSoon) continue;
      entries.push({
        url: `${base}/projects/${p.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }
  } catch {
    // Sitemap still served with static entries if DB read fails.
  }

  return entries;
}
