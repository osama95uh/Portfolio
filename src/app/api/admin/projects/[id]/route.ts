import { isAdminAuthenticated } from "@/src/lib/admin-auth";
import { getSupabaseAdmin } from "@/src/lib/supabase";

/**
 * PUT    /api/admin/projects/[id] -> update a project (id = row uuid)
 * DELETE /api/admin/projects/[id] -> delete a project
 */

export const dynamic = "force-dynamic";

type ProjectInput = {
  slug?: unknown;
  title?: unknown;
  description?: unknown;
  image_url?: unknown;
  tech?: unknown;
  features?: unknown;
  challenges?: unknown;
  improvements?: unknown;
  github_url?: unknown;
  live_url?: unknown;
  coming_soon?: unknown;
  sort_order?: unknown;
};

const asString = (v: unknown): string | null =>
  typeof v === "string" && v.trim() !== "" ? v.trim() : null;

const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured on the server." },
      { status: 503 },
    );
  }

  const { id } = await params;

  let input: ProjectInput;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = asString(input.slug)
    ?.toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) {
    return Response.json({ error: "Slug is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("projects")
    .update({
      slug,
      title: asString(input.title),
      description: asString(input.description),
      image_url: asString(input.image_url),
      tech: asStringArray(input.tech),
      features: asStringArray(input.features),
      challenges: asStringArray(input.challenges),
      improvements: asStringArray(input.improvements),
      github_url: asString(input.github_url),
      live_url: asString(input.live_url),
      coming_soon: input.coming_soon === true,
      sort_order:
        typeof input.sort_order === "number"
          ? Math.trunc(input.sort_order)
          : 0,
    })
    .eq("id", id)
    .select("id, slug")
    .single();

  if (error) {
    const duplicate = error.code === "23505" || /duplicate|unique/i.test(error.message);
    return Response.json(
      {
        error: duplicate
          ? `Slug "${slug}" already exists on another project.`
          : error.message,
      },
      { status: duplicate ? 409 : 500 },
    );
  }
  if (!data) {
    return Response.json({ error: "Project not found." }, { status: 404 });
  }
  return Response.json({ ok: true, project: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json(
      { error: "Supabase is not configured on the server." },
      { status: 503 },
    );
  }

  const { id } = await params;
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
