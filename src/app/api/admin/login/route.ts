import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || "siam@sec2026";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password !== DEFAULT_ADMIN_PASS) {
      return NextResponse.json(
        { success: false, message: "Invalid Security Key / Password" },
        { status: 401 }
      );
    }

    // Simple auth token using base64 + timestamp
    const token = Buffer.from(`admin:${Date.now()}:${DEFAULT_ADMIN_PASS}`).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      token,
    });

    // Set cookie
    response.cookies.set("siam_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Server error during login" },
      { status: 500 }
    );
  }
}
