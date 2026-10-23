import { getPublicProjects } from "@/src/lib/db-projects";

/**
 * Public projects feed. Returns the same `Project` shape the frontend
 * components already consume:
 *   { source: "database" | "static", projects: Project[] }
 *
 * The list is not cached here so the admin panel and the public site always
 * agree right after an edit.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const { projects, source } = await getPublicProjects();
  return Response.json({ source, projects });
}
