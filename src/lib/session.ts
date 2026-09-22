import { db } from "./store";
import type { Membership, Tenant, User } from "./types";
import { currentAdmin, currentUser } from "./auth";

export { currentUser } from "./auth";

/** True when an admin session is present (admins may open any tenant dashboard; every action is audited). */
export async function isAdmin(): Promise<boolean> {
  return !!(await currentAdmin());
}

/** Create a user without a password (invited editors). They claim the account by signing up with the same email. */
export function findOrCreateUser(name: string, email: string, phone?: string): User {
  const d = db.get();
  const existing = d.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return existing;
  const user: User = { id: db.id("usr"), name, email, phone, createdAt: db.now() };
  d.users.push(user);
  db.save();
  return user;
}

/** Resolve a tenant the current user may access. Returns null when not a member (PRD §15 tenant isolation). */
export async function tenantForUser(tenantId: string): Promise<{ tenant: Tenant; membership: Membership; user: User } | null> {
  const user = await currentUser();
  const d = db.get();
  const tenant = d.tenants.find((t) => t.id === tenantId);
  if (!tenant) return null;
  const admin = await currentAdmin();
  if (admin) {
    return { tenant, membership: { userId: admin.id, tenantId, role: "manager" }, user: user ?? { id: admin.id, name: admin.name, email: admin.email, createdAt: admin.createdAt } };
  }
  if (!user) return null;
  const membership = d.memberships.find((m) => m.userId === user.id && m.tenantId === tenantId);
  if (!membership) return null;
  return { tenant, membership, user };
}

export async function tenantsForCurrentUser(): Promise<Tenant[]> {
  const user = await currentUser();
  if (!user) return [];
  const d = db.get();
  const ids = new Set(d.memberships.filter((m) => m.userId === user.id).map((m) => m.tenantId));
  return d.tenants.filter((t) => ids.has(t.id));
}
