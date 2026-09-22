import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type {
  AdminUser, AuditEntry, BuildJob, Coupon, Domain, Lead, MediaItem, Membership, OnboardingDraft, Order, Session, SiteVersion, Tenant, Theme, User, WebhookEvent,
} from "./types";
import { COUPONS } from "./catalogue";

/**
 * File-backed JSON store — a localhost stand-in for PostgreSQL + Prisma (PRD §12).
 * Every collection here maps 1:1 to an entity in PRD §13 so swapping to Prisma later is mechanical.
 */
interface DB {
  themes: Theme[]; // admin-created themes and overrides of catalogue themes
  users: User[];
  admins: AdminUser[];
  sessions: Session[];
  memberships: Membership[];
  tenants: Tenant[];
  versions: SiteVersion[];
  orders: Order[];
  coupons: Coupon[];
  webhookEvents: WebhookEvent[];
  leads: Lead[];
  domains: Domain[];
  drafts: OnboardingDraft[];
  jobs: BuildJob[];
  audit: AuditEntry[];
  media: MediaItem[];
}

// DATA_DIR lets a deployment keep data outside the app directory, so it survives redeploys.
// e.g. DATA_DIR=/var/lib/4xcms on a VPS. Defaults to ./.data for local development.
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const MEDIA_DIR = path.join(DATA_DIR, "media");

const empty = (): DB => ({
  themes: [], users: [], admins: [], sessions: [], memberships: [], tenants: [], versions: [], orders: [], coupons: COUPONS.map((c) => ({ ...c })),
  webhookEvents: [], leads: [], domains: [], drafts: [], jobs: [], audit: [], media: [],
});

// Keep one instance across HMR reloads in dev.
const g = globalThis as unknown as { __4x_db?: DB };

function load(): DB {
  if (g.__4x_db) {
    // Backfill collections added after this process first loaded the DB (dev HMR keeps the object alive).
    for (const [k, v] of Object.entries(empty())) if (!(k in g.__4x_db)) (g.__4x_db as unknown as Record<string, unknown>)[k] = v;
    return g.__4x_db;
  }
  fs.mkdirSync(MEDIA_DIR, { recursive: true });
  let db = empty();
  if (fs.existsSync(DB_FILE)) {
    try {
      db = { ...empty(), ...JSON.parse(fs.readFileSync(DB_FILE, "utf8")) };
    } catch {
      /* corrupt file → start fresh */
    }
  }
  g.__4x_db = db;
  return db;
}

let saveTimer: NodeJS.Timeout | null = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    fs.writeFileSync(DB_FILE, JSON.stringify(g.__4x_db, null, 2));
  }, 50);
}

export const db = {
  get: load,
  save,
  id: (prefix: string) => `${prefix}_${crypto.randomBytes(6).toString("hex")}`,
  now: () => new Date().toISOString(),
  hash: (s: string) => crypto.createHash("sha256").update(s).digest("hex"),
};

export function audit(entry: Omit<AuditEntry, "id" | "createdAt">) {
  const d = load();
  d.audit.unshift({ id: db.id("aud"), createdAt: db.now(), ...entry });
  if (d.audit.length > 2000) d.audit.length = 2000;
  save();
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "site";
}

export function uniqueSlug(base: string) {
  const d = load();
  let slug = slugify(base);
  let i = 2;
  while (d.tenants.some((t) => t.slug === slug)) slug = `${slugify(base)}-${i++}`;
  return slug;
}
