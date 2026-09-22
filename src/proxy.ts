import { NextRequest, NextResponse } from "next/server";

/**
 * Hostname → tenant routing (PRD §12 "Request routing").
 *
 * One app serves three kinds of hostnames:
 *   - the platform itself (store, dashboard, admin)
 *   - <slug>.localhost                → that tenant's site in development
 *   - a verified tenant custom domain → that tenant's published site
 *
 * Which hostnames are "the platform" is configured with the PLATFORM_HOSTS env var,
 * e.g. PLATFORM_HOSTS="4xthemes.com,app.4xthemes.com". A leading "www." is ignored,
 * so listing the bare domain covers the www variant too.
 *
 * When PLATFORM_HOSTS is not set, every hostname except a *.localhost dev subdomain
 * serves the platform. That way a fresh deployment answers on its own domain instead
 * of 404ing; tenant custom domains start working as soon as PLATFORM_HOSTS is set.
 */
const PLATFORM_HOSTS = (process.env.PLATFORM_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim().toLowerCase().replace(/^www\./, ""))
  .filter(Boolean);

const PASS_THROUGH = ["/_next", "/api", "/f/", "/internal", "/favicon"];

export function isPlatformHost(rawHost: string): boolean {
  const host = rawHost.replace(/^www\./, "");
  if (!host) return true;
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "0.0.0.0") return true;
  if (host.startsWith("app.") || host.endsWith(".vercel.app")) return true;
  if (PLATFORM_HOSTS.includes(host)) return true;
  // Nothing configured → serve the platform everywhere except dev tenant subdomains.
  return PLATFORM_HOSTS.length === 0 && !host.endsWith(".localhost");
}

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = req.nextUrl;
  if (isPlatformHost(host) || PASS_THROUGH.some((p) => pathname.startsWith(p))) return NextResponse.next();
  const slug = host.endsWith(".localhost") ? host.slice(0, -".localhost".length) : host;
  if (!slug) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/s/${slug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
