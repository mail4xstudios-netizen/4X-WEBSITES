import { NextRequest, NextResponse } from "next/server";

/**
 * Hostname → tenant routing (PRD §12 "Request routing").
 * One app serves three kinds of hostnames:
 *   - localhost / 127.0.0.1 / app.* → store + dashboard
 *   - <slug>.localhost               → that tenant's published site (Chrome/Safari resolve *.localhost)
 *   - anything else                  → treated as a custom domain and resolved by hostname
 * The page itself decides whether the tenant exists and is live; a domain not in the table shows "not found".
 */
export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const { pathname } = req.nextUrl;
  const isPlatform = host === "localhost" || host === "127.0.0.1" || host.startsWith("app.") || host.endsWith(".vercel.app") || host === "4xstudios.com" || host === "www.4xstudios.com";
  if (isPlatform || pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/f/") || pathname.startsWith("/internal")) return NextResponse.next();
  const slug = host.endsWith(".localhost") ? host.slice(0, -".localhost".length) : host;
  if (!slug) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = `/s/${slug}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
