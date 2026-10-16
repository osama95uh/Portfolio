import { NextResponse } from "next/server";
import { getProjectImage } from "@/src/lib/db";

export const runtime = "nodejs";

// Only plain filenames with image extensions - blocks path traversal.
function isSafeFilename(name: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*\.(png|jpe?g|webp|gif|svg)$/i.test(name);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!isSafeFilename(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Database copy first (survives hosting redeploys), local file as fallback.
  const image = await getProjectImage(filename);
  if (!image) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = new Uint8Array(image.data).buffer as ArrayBuffer;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(image.data.length),
    },
  });
}
