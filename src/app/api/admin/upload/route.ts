import { isAdminAuthenticated } from "@/src/lib/admin-auth";
import { PROJECT_IMAGES_BUCKET, getSupabaseAdmin } from "@/src/lib/supabase";

/**
 * POST /api/admin/upload (multipart/form-data, field: "file")
 * Uploads an image to the Supabase Storage "project-images" bucket and
 * returns its public URL, ready to be used as project image.
 */

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

function sanitizeName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "") // extension removed, re-added later
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image"
  );
}

export async function POST(request: Request) {
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

  let file: File | null = null;
  try {
    const formData = await request.formData();
    const entry = formData.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return Response.json(
      { error: "Expected multipart/form-data with a 'file' field." },
      { status: 400 },
    );
  }

  if (!file) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Only PNG, JPEG, WEBP, GIF, SVG or AVIF images are allowed." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "Image is larger than 5 MB." },
      { status: 413 },
    );
  }

  // Ensure the public bucket exists (no-op when it does).
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === PROJECT_IMAGES_BUCKET)) {
    const { error: bucketError } = await supabase.storage.createBucket(
      PROJECT_IMAGES_BUCKET,
      { public: true, fileSizeLimit: MAX_BYTES },
    );
    if (bucketError && !String(bucketError.message).toLowerCase().includes("exist")) {
      return Response.json({ error: bucketError.message }, { status: 500 });
    }
  }

  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase().slice(0, 5)
    : "png";
  const path = `${Date.now()}-${sanitizeName(file.name)}.${ext}`;

  const buffer = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage
    .from(PROJECT_IMAGES_BUCKET)
    .getPublicUrl(path);

  return Response.json({ url: data.publicUrl, path }, { status: 201 });
}
