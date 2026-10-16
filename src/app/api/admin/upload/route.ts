import { NextRequest, NextResponse } from "next/server";
import { saveProjectImage } from "@/src/lib/db";

export const runtime = "nodejs";

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

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Uploads live outside `public/` on purpose: Next.js production snapshots the
// public file list at boot, so files added later would 404 until a restart.
// They are served restart-proof via GET /api/uploads/[filename] instead.

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, message: "No image file received" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only PNG, JPG, WebP, GIF or SVG images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Image must be under 5MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const filename = `${Date.now()}-${sanitizeName(file.name || "project-image")}`;
    await saveProjectImage(filename, Buffer.from(bytes), file.type);

    return NextResponse.json({ success: true, url: `/api/uploads/${filename}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Image upload failed";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
