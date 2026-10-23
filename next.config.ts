import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // Project images can be local (/public) or remote URLs pasted from the
  // admin panel (they may live on any HTTPS host, incl. Supabase storage).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default withBundleAnalyzer(nextConfig);