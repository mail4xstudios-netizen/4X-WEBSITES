import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { audit, db } from "./store";
import type { AdminUser, Session, User } from "./types";

/**
 * Authentication for the store, dashboard and admin panel (PRD §15).
 * - Passwords: scrypt (N=2^15) with per-user salt. (Production plan: Argon2id; scrypt is the built-in equivalent
 *   so there is no native dependency on localhost.)
 * - Sessions: stored in the database; the cookie carries only an opaque session id. Idle timeout 7 days for
 *   owners, 12 hours for admins. "Log out all devices" deletes every session for the subject.
 * - Rate limiting: per IP+email on login/signup; lockout returns a generic error.
 */

export const USER_COOKIE = "4x_sid";
export const ADMIN_COOKIE = "4x_asid";
const USER_TTL = 7 * 24 * 3600e3;
const ADMIN_TTL = 12 * 3600e3;

// ---------- passwords ----------
export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex");
  return `scrypt$${salt}$${hash}`;
}
export function verifyPassword(pw: string, stored?: string) {
  if (!stored) return false;
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const calc = crypto.scryptSync(pw, salt, 64, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const ref = Buffer.from(hash, "hex");
  return calc.length === ref.length && crypto.timingSafeEqual(calc, ref);
}
export function passwordProblems(pw: string) {
  if (pw.length < 8) return "Password must be at least 8 characters";
  if (!/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return "Use letters and at least one number";
  return null;
}

// ---------- rate limiting ----------
const attempts = new Map<string, { n: number; until: number }>();
export function rateLimited(key: string) {
  const a = attempts.get(key);
  return !!a && a.n >= 5 && a.until > Date.now();
}
export function recordFailure(key: string) {
  const a = attempts.get(key) ?? { n: 0, until: 0 };
  a.n++;
  a.until = Date.now() + 15 * 60e3;
  attempts.set(key, a);
}
export function clearFailures(key: string) {
  attempts.delete(key);
}

// ---------- request info ----------
export async function requestInfo() {
  const h = await headers();
  return { ip: h.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1", userAgent: (h.get("user-agent") ?? "").slice(0, 160) };
}

// ---------- sessions ----------
async function createSession(kind: Session["kind"], subjectId: string) {
  const d = db.get();
  const { ip, userAgent } = await requestInfo();
  const ttl = kind === "admin" ? ADMIN_TTL : USER_TTL;
  const s: Session = { id: crypto.randomBytes(24).toString("base64url"), kind, subjectId, createdAt: db.now(), lastSeenAt: db.now(), expiresAt: new Date(Date.now() + ttl).toISOString(), ip, userAgent };
  d.sessions.push(s);
  db.save();
  const jar = await cookies();
  jar.set(kind === "admin" ? ADMIN_COOKIE : USER_COOKIE, s.id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: ttl / 1000 });
  return s;
}

async function readSession(kind: Session["kind"]): Promise<Session | null> {
  const jar = await cookies();
  const sid = jar.get(kind === "admin" ? ADMIN_COOKIE : USER_COOKIE)?.value;
  if (!sid) return null;
  const d = db.get();
  const s = d.sessions.find((x) => x.id === sid && x.kind === kind);
  if (!s) return null;
  if (new Date(s.expiresAt).getTime() < Date.now()) {
    d.sessions = d.sessions.filter((x) => x.id !== sid);
    db.save();
    return null;
  }
  // Sliding idle timeout: touch at most once a minute to avoid constant writes.
  if (Date.now() - new Date(s.lastSeenAt).getTime() > 60e3) {
    s.lastSeenAt = db.now();
    s.expiresAt = new Date(Date.now() + (kind === "admin" ? ADMIN_TTL : USER_TTL)).toISOString();
    db.save();
  }
  return s;
}

export async function destroySession(kind: Session["kind"]) {
  const jar = await cookies();
  const name = kind === "admin" ? ADMIN_COOKIE : USER_COOKIE;
  const sid = jar.get(name)?.value;
  if (sid) {
    const d = db.get();
    d.sessions = d.sessions.filter((x) => x.id !== sid);
    db.save();
  }
  jar.delete(name);
}

export function destroyAllSessions(kind: Session["kind"], subjectId: string) {
  const d = db.get();
  d.sessions = d.sessions.filter((x) => !(x.kind === kind && x.subjectId === subjectId));
  db.save();
}

// ---------- users ----------
export async function currentUser(): Promise<User | null> {
  const s = await readSession("user");
  if (!s) return null;
  const u = db.get().users.find((x) => x.id === s.subjectId);
  return u && !u.disabled ? u : null;
}

export async function currentUserSession() {
  return readSession("user");
}

export function userSessions(userId: string) {
  return db.get().sessions.filter((s) => s.kind === "user" && s.subjectId === userId);
}

export async function loginUser(email: string, password: string): Promise<{ user?: User; error?: string }> {
  const { ip } = await requestInfo();
  const key = `u:${ip}:${email.toLowerCase()}`;
  if (rateLimited(key)) return { error: "Too many attempts. Try again in 15 minutes." };
  const user = db.get().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.disabled || !verifyPassword(password, user.passwordHash)) {
    recordFailure(key);
    audit({ actorId: email, action: "auth.login_failed", ip });
    return { error: "Incorrect email or password" };
  }
  clearFailures(key);
  user.lastLoginAt = db.now();
  await createSession("user", user.id);
  audit({ actorId: user.id, action: "auth.login", ip });
  return { user };
}

export async function signupUser(input: { name: string; email: string; phone?: string; password: string }): Promise<{ user?: User; error?: string }> {
  const d = db.get();
  const { ip } = await requestInfo();
  const pwErr = passwordProblems(input.password);
  if (pwErr) return { error: pwErr };
  const existing = d.users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (existing?.passwordHash) return { error: "An account with this email already exists. Sign in instead." };
  // An invited editor (no password yet) claims their account by signing up with the same email.
  const user: User = existing ?? { id: db.id("usr"), name: input.name, email: input.email, phone: input.phone, createdAt: db.now() };
  user.name = input.name || user.name;
  user.phone = input.phone || user.phone;
  user.passwordHash = hashPassword(input.password);
  user.lastLoginAt = db.now();
  if (!existing) d.users.push(user);
  db.save();
  await createSession("user", user.id);
  audit({ actorId: user.id, action: existing ? "auth.account_claimed" : "auth.signup", ip });
  return { user };
}

/** Used by admin "log in as owner" (impersonation). Reason is audited by the caller. */
export async function startUserSessionAs(userId: string) {
  await createSession("user", userId);
}

// ---------- admins ----------
/**
 * Bootstraps admin access from the environment (PRD §15).
 *
 * - No admins at all  → seeds one from ADMIN_EMAIL / ADMIN_PASSWORD.
 * - ADMIN_EMAIL set but no admin has that address → creates that admin too. This is the
 *   recovery path: set the two variables, restart, sign in. Existing accounts are left alone.
 * - ADMIN_PASSWORD_RESET=true → also re-applies ADMIN_PASSWORD to ADMIN_EMAIL's existing
 *   account and ends its sessions. Remove the flag afterwards so a restart cannot undo a
 *   password later changed in the panel.
 *
 * Anyone able to set these variables already controls the server, so this grants no new access.
 */
export function ensureDefaultAdmin() {
  const d = db.get();
  const email = process.env.ADMIN_EMAIL ?? (d.admins.length ? null : "admin@4xstudios.com");
  const password = process.env.ADMIN_PASSWORD ?? (d.admins.length ? null : "Admin@4x2026");
  if (!email || !password) return;

  const existing = d.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!existing) {
    d.admins.push({ id: db.id("adm"), name: "4X Super Admin", email, passwordHash: hashPassword(password), role: "superadmin", createdAt: db.now() });
    db.save();
    console.log(`[4xcms] created super admin ${email} from ADMIN_EMAIL/ADMIN_PASSWORD`);
    return;
  }
  if (process.env.ADMIN_PASSWORD_RESET === "true") {
    existing.passwordHash = hashPassword(password);
    d.sessions = d.sessions.filter((s) => !(s.kind === "admin" && s.subjectId === existing.id));
    db.save();
    console.log(`[4xcms] reset password for ${email} (ADMIN_PASSWORD_RESET=true — remove this variable now)`);
  }
}

export async function currentAdmin(): Promise<AdminUser | null> {
  const s = await readSession("admin");
  if (!s) return null;
  return db.get().admins.find((a) => a.id === s.subjectId) ?? null;
}

export async function loginAdmin(email: string, password: string): Promise<{ admin?: AdminUser; error?: string }> {
  ensureDefaultAdmin();
  const { ip } = await requestInfo();
  const key = `a:${ip}:${email.toLowerCase()}`;
  if (rateLimited(key)) return { error: "Too many attempts. Try again in 15 minutes." };
  const admin = db.get().admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
  if (!admin || !verifyPassword(password, admin.passwordHash)) {
    recordFailure(key);
    audit({ actorId: email, action: "admin.login_failed", ip });
    return { error: "Incorrect email or password" };
  }
  clearFailures(key);
  admin.lastLoginAt = db.now();
  await createSession("admin", admin.id);
  audit({ actorId: admin.id, action: "admin.login", ip });
  return { admin };
}
