# 4XCMS Theme Store

Localhost implementation of the **4XCMS Theme Store PRD** (v1.0, 21 Sep 2026): customers pick a profession-specific theme, pay, fill one guided form, and get a live, editable website. 20 themes across dentists, lawyers, institutes and real estate.

## Run it

```bash
npm install
npm run dev
# → http://localhost:3000
```

No external accounts are needed. Postgres, Razorpay, email and SSL are replaced by local stand-ins:

| Production (PRD §12)         | Localhost                                                             |
| ---------------------------- | --------------------------------------------------------------------- |
| PostgreSQL + Prisma          | `.data/db.json` (same entities as PRD §13, see `src/lib/store.ts`)    |
| Razorpay Orders + webhooks   | `/api/v1/checkout/pay` signs a `payment.captured` event with HMAC-SHA256 and posts it to the real webhook route |
| S3 / R2 media + CDN          | `.data/media/` served from `/api/media/:id` (sharp re-encodes to WebP, strips EXIF) |
| Auth.js (OTP / Google)       | Email + password (scrypt) with database sessions in `src/lib/auth.ts`; httpOnly cookie holds only a session id; tenant access is always resolved through membership |
| Caddy on-demand TLS          | `/internal/tls-check?domain=` answers 200/403 from the verified-domains table |
| Custom domains               | `<slug>.localhost:3000` resolves to the tenant site via `src/proxy.ts`; any other Host header is treated as a custom domain |

## Walk the customer journey

1. **Browse** `/themes` — filter by profession, style, feature, price. `/themes/enamel` for a detail page, `/demo/enamel` for the live demo with device toggle and "Try with my logo and name".
2. **Sign up** `/signup` (or `/login`) — email + password. Checkout requires a signed-in account; after login `/account` shows **My websites** with *Edit my website* / *View my website*, leads, invoices and active sessions.
3. **Buy** `/checkout/enamel` — pick a plan, enter details (try coupon `LAUNCH20`), click *Pay via UPI*. The browser only sees "confirming"; the order flips to paid when the signed webhook lands. A GST invoice number is issued (`/invoice/:orderId`).
4. **Onboard** — the multi-step form is generated from the theme manifest, autosaves, shows compliance warnings, and previews your brand live.
5. **Build** — "Build my website" queues a job; watch the stages, then land in the dashboard.
6. **Edit** `/dashboard/:tenantId` — click any text or image in the preview to jump to its field; hide sections; SEO; publish. Design, Leads, Versions, Domain, Billing, Team, Security live in the sidebar.
7. **Go live** — the published site answers at `http://<slug>.localhost:3000` and `/s/<slug>`. Submit the contact form and the lead appears in the dashboard.
8. **Super admin** `/admin` — separate admin accounts (`/admin/login`; default credentials in `.env.example`). Dashboard with funnel + "needs attention", tenants (suspend / extend / plan / log-in-as with audited reason), **users** (search, disable, reset password, end sessions), orders & refunds, domain queue, coupons, platform-wide leads, webhook log, audit log, admin account management. **Themes**: add new themes, edit every field of existing ones (name, profession, layout, accent, style, price, features, highlights, status, pages & sections, onboarding steps), open the **visual designer** to set a theme's default look and demo content, reset catalogue themes to their code definition. **Tenants → Edit website** opens any customer's editor.

## Where things live

```
src/lib/catalogue.ts      20 themes, manifests, plans, coupons, form step library (PRD §4, §5, §10)
src/lib/demo-content.ts   realistic sample content per profession
src/lib/engine.ts         slot mapper, validation, compliance rules (§11), WCAG accent, SEO/schema.org (§6)
src/lib/build.ts          background build job with progress (BLD-07)
src/lib/commerce.ts       server-side pricing, HMAC webhook verification, idempotency, invoice numbers (§4.3)
src/lib/store.ts          file-backed store mirroring the PRD data model (§13)
src/lib/themes.ts         theme registry: code catalogue + admin-created/edited themes from the DB
src/lib/design-css.ts     compiles DesignSettings (global / section / element styles) to CSS; shared by renderer + live editor
src/components/editor/    the visual editor used by owners (site) and admins (theme designer)
src/lib/auth.ts           scrypt passwords, database sessions (user 7d / admin 12h), rate limiting (§15)
src/lib/session.ts        session → user → membership → tenant guard (§15)
src/components/site/      SiteRenderer: 5 layout personalities + profession sections, disclaimer gate, lead form
src/app/api/v1/           REST surface from PRD §14
src/proxy.ts              hostname → tenant routing (§12)
```

Compliance guardrails (PRD §11) are enforced in code: lawyer sites get a mandatory disclaimer gate and never show prices; RERA-less listings and unsourced result claims stay in the draft but are filtered at publish; "best / No.1 / guaranteed" phrasing is flagged in the editor; dentist registration and advocate enrolment numbers are required to publish.

## Deploying (Hostinger VPS / any Node host)

This is a Next.js server app: it needs **Node.js 20+ running as a process**. Hostinger **shared/"Website" hosting cannot run it** (that plan serves static files and PHP only) — use a Hostinger **VPS** (KVM), as the PRD assumes, or any Node host.

```bash
git clone https://github.com/mail4xstudios-netizen/4X-WEBSITES.git
cd 4X-WEBSITES && npm ci && npm run build

# copy the standalone server and its assets
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

# run it (keep it alive with pm2 or a systemd unit)
PLATFORM_HOSTS="yourdomain.com" DATA_DIR=/var/lib/4xcms PORT=3000 node .next/standalone/server.js
```

Then put Nginx or Caddy in front of port 3000 for TLS.

**`PLATFORM_HOSTS` is the setting that matters most.** It lists the hostnames that serve the store, dashboard and admin panel. Any *other* hostname is treated as a customer's custom domain and resolved against the domains table — so if you leave your own domain out of it, every page 404s. Leave it empty and the platform answers on every hostname (fine until you sell custom domains).

## Environment

Copy `.env.example` to `.env.local` to change `ADMIN_EMAIL`, `ADMIN_PASSWORD` (seeded on first admin login) or `RAZORPAY_WEBHOOK_SECRET`.
