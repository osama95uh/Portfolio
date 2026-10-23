import { getSupabaseAdmin } from "./supabase";
import { projects as staticProjects, type Project } from "@/src/data/projects";

/**
 * Bridge between the Supabase `projects` table and the frontend.
 *
 * Everything the frontend renders comes through `Project` (the existing type
 * in src/data/projects.ts), so the visible site never changes - only the
 * source of the data does. When Supabase is not configured (or a query
 * fails), the built-in static data is served exactly as before.
 */

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string | null;
  tech: string[] | null;
  features: string[] | null;
  challenges: string[] | null;
  improvements: string[] | null;
  github_url: string | null;
  live_url: string | null;
  coming_soon: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export function mapRowToProject(row: ProjectRow): Project {
  return {
    id: row.slug,
    title: row.title,
    image: row.image_url ?? "",
    description: row.description ?? "",
    tech: row.tech ?? [],
    features: row.features && row.features.length > 0 ? row.features : undefined,
    challenges:
      row.challenges && row.challenges.length > 0 ? row.challenges : undefined,
    improvements:
      row.improvements && row.improvements.length > 0
        ? row.improvements
        : undefined,
    github: row.github_url ?? undefined,
    live: row.live_url ?? undefined,
    comingSoon: row.coming_soon ?? false,
  };
}

const SELECT_COLUMNS =
  "id, slug, title, description, image_url, tech, features, challenges, improvements, github_url, live_url, coming_soon, sort_order, created_at, updated_at";

export async function getProjectsFromDb(): Promise<ProjectRow[] | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("projects")
    .select(SELECT_COLUMNS)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (error || !data) return null;
  return data as ProjectRow[];
}

export type PublicProjectsResult = {
  projects: Project[];
  /** "database" = CMS-managed, "static" = built-in fallback (Supabase off). */
  source: "database" | "static";
};

/**
 * Public read used by the homepage. When Supabase is configured the table is
 * the single source of truth (even if empty - the section is designed to
 * handle an empty list), otherwise static data is returned unchanged.
 */
export async function getPublicProjects(): Promise<PublicProjectsResult> {
  const rows = await getProjectsFromDb();
  if (rows) return { projects: rows.map(mapRowToProject), source: "database" };
  return { projects: staticProjects, source: "static" };
}

export async function getProjectBySlugFromDb(
  slug: string,
): Promise<Project | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("projects")
    .select(SELECT_COLUMNS)
    .eq("slug", slug)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return mapRowToProject(data[0] as ProjectRow);
}

/** Server-side lookup for /projects/[id]: DB first, static fallback. */
export async function getProjectById(id: string): Promise<Project | undefined> {
  const fromDb = await getProjectBySlugFromDb(id);
  if (fromDb) return fromDb;
  return staticProjects.find((p) => p.id === id);
}
