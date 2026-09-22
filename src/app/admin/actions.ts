"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { currentAdmin, destroyAllSessions, destroySession, hashPassword, loginAdmin, passwordProblems, startUserSessionAs } from "@/lib/auth";
import { audit, db } from "@/lib/store";

export type AdminAuthState = { error?: string; email?: string };

export async function adminLoginAction(_prev: AdminAuthState, fd: FormData): Promise<AdminAuthState> {
  const email = String(fd.get("email") ?? "");
  const r = await loginAdmin(email, String(fd.get("password") ?? ""));
  if (r.error) return { error: r.error, email };
  redirect("/admin");
}
export async function adminLogoutAction() {
  await destroySession("admin");
  redirect("/admin/login");
}

async function must() {
  const a = await currentAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

export async function tenantAction(fd: FormData) {
  const admin = await must();
  const d = db.get();
  const t = d.tenants.find((x) => x.id === fd.get("tenantId"));
  if (!t) return;
  const action = String(fd.get("action"));
  if (action === "suspend") t.status = "suspended";
  if (action === "restore") t.status = t.published ? "live" : "preview";
  if (action === "extend") t.expiresAt = new Date(new Date(t.expiresAt).getTime() + 365 * 86400e3).toISOString();
  if (action === "plan") t.planId = fd.get("planId") as typeof t.planId;
  if (action === "loginas") {
    const reason = String(fd.get("reason") ?? "").trim();
    if (reason.length < 5) return;
    const owner = d.memberships.find((m) => m.tenantId === t.id && m.role === "owner");
    audit({ actorId: admin.id, tenantId: t.id, action: "admin.impersonate", target: reason, ip: "local" });
    db.save();
    if (owner) await startUserSessionAs(owner.userId);
    redirect(`/dashboard/${t.id}`);
  }
  db.save();
  audit({ actorId: admin.id, tenantId: t.id, action: `admin.tenant.${action}`, ip: "local" });
  revalidatePath("/admin", "layout");
}

export async function refundOrder(fd: FormData) {
  const admin = await must();
  const o = db.get().orders.find((x) => x.id === fd.get("orderId"));
  if (!o || o.status !== "paid") return;
  o.status = "refunded";
  db.save();
  audit({ actorId: admin.id, tenantId: o.tenantId, action: "order.refunded", target: o.id, ip: "local" });
  revalidatePath("/admin", "layout");
}

export async function createCoupon(fd: FormData) {
  const admin = await must();
  const code = String(fd.get("code") ?? "").toUpperCase().trim();
  if (!code) return;
  const d = db.get();
  d.coupons = d.coupons.filter((c) => c.code !== code);
  d.coupons.push({ code, kind: fd.get("kind") === "flat" ? "flat" : "percent", value: Number(fd.get("value") ?? 0), expiresAt: String(fd.get("expiresAt") ?? "2027-12-31"), usageLimit: Number(fd.get("usageLimit") ?? 100), used: 0, themeId: String(fd.get("themeId") ?? "") || undefined });
  db.save();
  audit({ actorId: admin.id, action: "coupon.created", target: code, ip: "local" });
  revalidatePath("/admin", "layout");
}

export async function deleteCoupon(fd: FormData) {
  const admin = await must();
  const d = db.get();
  d.coupons = d.coupons.filter((c) => c.code !== fd.get("code"));
  db.save();
  audit({ actorId: admin.id, action: "coupon.deleted", target: String(fd.get("code")), ip: "local" });
  revalidatePath("/admin", "layout");
}

export async function verifyDomainAdmin(fd: FormData) {
  const admin = await must();
  const dom = db.get().domains.find((x) => x.hostname === fd.get("hostname"));
  if (dom) { dom.verifiedAt = db.now(); dom.sslStatus = "issued"; db.save(); audit({ actorId: admin.id, tenantId: dom.tenantId, action: "domain.verified_by_admin", target: dom.hostname, ip: "local" }); }
  revalidatePath("/admin", "layout");
}

// ---------- users ----------
export async function userAction(fd: FormData) {
  const admin = await must();
  const d = db.get();
  const u = d.users.find((x) => x.id === fd.get("userId"));
  if (!u) return;
  const action = String(fd.get("action"));
  if (action === "disable" || action === "enable") {
    u.disabled = action === "disable";
    if (u.disabled) destroyAllSessions("user", u.id);
  }
  if (action === "resetPassword") {
    const pw = String(fd.get("password") ?? "");
    if (passwordProblems(pw)) return;
    u.passwordHash = hashPassword(pw);
    destroyAllSessions("user", u.id);
  }
  if (action === "logoutAll") destroyAllSessions("user", u.id);
  db.save();
  audit({ actorId: admin.id, action: `admin.user.${action}`, target: u.email, ip: "local" });
  revalidatePath("/admin", "layout");
}

// ---------- admin accounts ----------
export async function createAdminAction(fd: FormData) {
  const admin = await must();
  if (admin.role !== "superadmin") return;
  const parsed = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), role: z.enum(["superadmin", "manager"]) }).safeParse({ name: fd.get("name"), email: fd.get("email"), password: fd.get("password"), role: fd.get("role") });
  if (!parsed.success || passwordProblems(parsed.data.password)) return;
  const d = db.get();
  if (d.admins.some((a) => a.email.toLowerCase() === parsed.data.email.toLowerCase())) return;
  d.admins.push({ id: db.id("adm"), name: parsed.data.name, email: parsed.data.email, passwordHash: hashPassword(parsed.data.password), role: parsed.data.role, createdAt: db.now() });
  db.save();
  audit({ actorId: admin.id, action: "admin.created", target: parsed.data.email, ip: "local" });
  revalidatePath("/admin", "layout");
}

export async function removeAdminAction(fd: FormData) {
  const admin = await must();
  if (admin.role !== "superadmin") return;
  const d = db.get();
  const id = String(fd.get("adminId"));
  if (id === admin.id || d.admins.length <= 1) return;
  d.admins = d.admins.filter((a) => a.id !== id);
  destroyAllSessions("admin", id);
  db.save();
  audit({ actorId: admin.id, action: "admin.removed", target: id, ip: "local" });
  revalidatePath("/admin", "layout");
}

export async function changeOwnPasswordAction(fd: FormData) {
  const admin = await must();
  const pw = String(fd.get("password") ?? "");
  if (passwordProblems(pw)) return;
  const a = db.get().admins.find((x) => x.id === admin.id)!;
  a.passwordHash = hashPassword(pw);
  db.save();
  audit({ actorId: admin.id, action: "admin.password_changed", ip: "local" });
  revalidatePath("/admin", "layout");
}
