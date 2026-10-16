import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, updateSiteConfig } from "@/src/lib/db";

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

export async function GET() {
  const config = await getSiteConfig();
  return NextResponse.json({ success: true, config });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = await updateSiteConfig(body);
    return NextResponse.json({ success: true, config: updated });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update configuration" }, { status: 500 });
  }
}
