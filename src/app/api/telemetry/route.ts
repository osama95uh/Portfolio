import { NextRequest, NextResponse } from "next/server";
import { recordVisitor } from "@/src/lib/db";

// Helper to mask IP for public/client display
function maskIp(ip: string): string {
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return "127.0.0.1 (Local Node)";
  }
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xx.xx`;
    }
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return `${parts.slice(0, 2).join(":")}:xxxx:xxxx`;
  }
  return "Protected IP";
}

// Simple browser & OS detector from user agent
function parseUserAgent(ua: string) {
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let device = "Desktop";

  if (/mobile/i.test(ua)) device = "Mobile";
  else if (/tablet|ipad/i.test(ua)) device = "Tablet";

  if (/edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

  return { browser, os, device };
}

export async function GET(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  let ip = cfConnectingIp || realIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1");

  // Normalize IPv6 localhost
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }

  const userAgent = request.headers.get("user-agent") || "Unknown";
  const { browser, os, device } = parseUserAgent(userAgent);
  const protocol = request.headers.get("x-forwarded-proto") === "https" ? "HTTPS / TLS 1.3" : "HTTP/2";

  let country = "Local Network";
  let countryCode = "BD";
  let city = "Localhost";
  let region = "Internal";
  let isp = "Loopback / LAN";
  let asn = "AS0 Private Network";
  let securityStatus: "CLEAN" | "VPN/PROXY" | "SUSPICIOUS" | "INTERNAL" = "INTERNAL";

  const isLocal = ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.16.");

  if (!isLocal) {
    try {
      // Free GeoIP resolution with fast 2s timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);

      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,isp,as,proxy,hosting`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.status === "success") {
          country = geoData.country || "Unknown Country";
          countryCode = geoData.countryCode || "UN";
          city = geoData.city || "Unknown City";
          region = geoData.regionName || "Unknown Region";
          isp = geoData.isp || "Unknown ISP";
          asn = geoData.as || "Unknown ASN";

          if (geoData.proxy || geoData.hosting) {
            securityStatus = "VPN/PROXY";
          } else {
            securityStatus = "CLEAN";
          }
        }
      }
    } catch {
      // In case GeoIP is unreachable or times out, keep clean defaults
      country = "Internet Node";
      securityStatus = "CLEAN";
    }
  }

  const maskedIp = maskIp(ip);

  // Persist visitor record to MongoDB / storage
  try {
    await recordVisitor({
      ip,
      maskedIp,
      country,
      countryCode,
      city,
      region,
      isp,
      asn,
      protocol,
      userAgent,
      browser,
      os,
      device,
      securityStatus,
    });
  } catch (err) {
    console.error("Telemetry record error:", err);
  }

  return NextResponse.json({
    success: true,
    maskedIp,
    country,
    countryCode,
    city,
    isp,
    asn,
    protocol,
    browser,
    os,
    device,
    securityStatus,
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
  });
}
