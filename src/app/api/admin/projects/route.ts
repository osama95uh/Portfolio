import { NextRequest, NextResponse } from "next/server";
import { getProjects, addProject, deleteProject } from "@/src/lib/db";
import { Project } from "@/src/data/projects";

const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || "siam@sec2026";

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cookie = request.cookies.get("siam_admin_session")?.value;
  const customKey = request.headers.get("x-admin-key");

  if (customKey === DEFAULT_ADMIN_PASS) return true;

  const token = authHeader?.replace("Bearer ", "") || cookie;
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return decoded.includes(DEFAULT_ADMIN_PASS);
  } catch {
    return false;
  }
}

// Helper to create URL slug from title
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json({ success: true, projects });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      github,
      live,
      image,
      tech,
      features,
      challenges,
      improvements,
      comingSoon,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Project title and description are required" },
        { status: 400 }
      );
    }

    const id = body.id ? slugify(body.id) : slugify(title);

    const project: Project = {
      id,
      title,
      description,
      github: github?.trim() || undefined,
      live: live?.trim() || undefined,
      image: image?.trim() || "/branch-office-network.png",
      tech: Array.isArray(tech)
        ? tech
        : typeof tech === "string"
        ? tech.split(",").map((t: string) => t.trim()).filter(Boolean)
        : [],
      features: Array.isArray(features)
        ? features
        : typeof features === "string"
        ? features.split("\n").map((f: string) => f.trim()).filter(Boolean)
        : undefined,
      challenges: Array.isArray(challenges)
        ? challenges
        : typeof challenges === "string"
        ? challenges.split("\n").map((c: string) => c.trim()).filter(Boolean)
        : undefined,
      improvements: Array.isArray(improvements)
        ? improvements
        : typeof improvements === "string"
        ? improvements.split("\n").map((i: string) => i.trim()).filter(Boolean)
        : undefined,
      comingSoon: Boolean(comingSoon),
    };

    const saved = await addProject(project);

    return NextResponse.json({ success: true, project: saved });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add project";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, message: "Project ID is required" }, { status: 400 });
  }

  await deleteProject(id);
  return NextResponse.json({ success: true, message: `Project ${id} deleted` });
}
