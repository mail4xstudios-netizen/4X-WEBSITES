import type { NextConfig } from "next";

// Web headers per PRD §15. CSP is report-friendly here (dev needs inline/eval for HMR); tighten with nonces in production.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  // Self-hosting (Hostinger VPS, Docker): emits .next/standalone with a bundled server.js
  // so the server runs without a full node_modules tree. Harmless on Vercel.
  output: "standalone",
  serverExternalPackages: ["sharp"],
  turbopack: { root: process.cwd() },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
