import type { MetadataRoute } from "next";
import { getPublicProjects } from "@/src/lib/db-projects";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ??
  "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // CMS entries take priority; the lib already falls back to the static set.
  const { projects } = await getPublicProjects().catch(
    () => ({ projects: [] }),
  );

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...projects
      .filter((p) => !p.comingSoon)
      .map((p) => ({
        url: `${siteUrl}/projects/${p.id}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
  ];
}
