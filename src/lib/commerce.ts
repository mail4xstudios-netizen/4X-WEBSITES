import crypto from "node:crypto";
import { z } from "zod";
import { PLANS, priceBreakdown } from "./catalogue";
import { getTheme } from "./themes";
import { db, audit, uniqueSlug } from "./store";
import type { Order, Tenant } from "./types";
import { defaultDesign } from "./engine";

export const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "local-dev-webhook-secret";

export const orderSchema = z.object({
  themeSlug: z.string().min(1),
  planId: z.enum(["starter", "growth", "managed"]),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().regex(/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/, "Indian mobile number"),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN").optional().or(z.literal("")),
  coupon: z.string().max(30).optional(),
});

/** Server-side order creation: amount always computed from the catalogue, never trusted from the browser (PRD §4.3). */
export function createOrder(input: z.infer<typeof orderSchema>, userId: string): { order: Order; tenant: Tenant } {
  const theme = getTheme(input.themeSlug);
  if (!theme || theme.status !== "published") throw new Error("Theme not available");
  const plan = PLANS.find((p) => p.id === input.planId)!;
  const d = db.get();
  let coupon = input.coupon ? d.coupons.find((c) => c.code.toLowerCase() === input.coupon!.toLowerCase()) : undefined;
  if (coupon && (new Date(coupon.expiresAt) < new Date() || coupon.used >= coupon.usageLimit || (coupon.themeId && coupon.themeId !== theme.id))) coupon = undefined;
  const b = priceBreakdown(theme.priceINR, plan, coupon);

  const tenant: Tenant = {
    id: db.id("tnt"),
    slug: uniqueSlug(input.name.split(" ")[0] + "-" + theme.profession),
    name: `${input.name}'s ${theme.name} site`,
    profession: theme.profession,
    status: "onboarding",
    planId: plan.id,
    themeId: theme.id,
    themeVersion: theme.version,
    expiresAt: new Date(Date.now() + 365 * 86400e3).toISOString(),
    createdAt: db.now(),
    design: defaultDesign(theme),
    draft: null,
    published: null,
  };
  const order: Order = {
    id: db.id("ord"),
    tenantId: tenant.id,
    userId,
    themeId: theme.id,
    planId: plan.id,
    ...b,
    gstin: input.gstin || undefined,
    coupon: coupon?.code,
    status: "created",
    razorpayOrderId: "order_" + crypto.randomBytes(7).toString("hex"),
    createdAt: db.now(),
  };
  d.tenants.push(tenant);
  d.orders.push(order);
  d.memberships.push({ userId, tenantId: tenant.id, role: "owner" });
  db.save();
  audit({ actorId: userId, tenantId: tenant.id, action: "order.created", target: order.id, ip: "local" });
  return { order, tenant };
}

export function sign(body: string) {
  return crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex");
}

/** Idempotent webhook processing (PRD §4.3): event id stored, duplicates ignored. */
export function processWebhook(rawBody: string, signature: string | null): { ok: boolean; outcome: string; status: number } {
  const expected = sign(rawBody);
  if (!signature || signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return { ok: false, outcome: "bad signature", status: 401 };
  }
  const evt = JSON.parse(rawBody) as { id: string; event: string; payload: { payment: { entity: { id: string; order_id: string; amount: number } } } };
  const d = db.get();
  if (d.webhookEvents.some((e) => e.eventId === evt.id)) return { ok: true, outcome: "duplicate ignored", status: 200 };
  let outcome = "ignored event " + evt.event;
  if (evt.event === "payment.captured") {
    const p = evt.payload.payment.entity;
    const order = d.orders.find((o) => o.razorpayOrderId === p.order_id);
    if (!order) outcome = "order not found";
    else if (p.amount !== order.total * 100) outcome = "amount mismatch";
    else if (order.status === "paid") outcome = "already paid";
    else {
      order.status = "paid";
      order.razorpayPaymentId = p.id;
      order.paidAt = db.now();
      const seq = d.orders.filter((o) => o.invoiceNumber).length + 1;
      order.invoiceNumber = `4X/${new Date().getFullYear()}/${String(seq).padStart(5, "0")}`;
      if (order.coupon) { const c = d.coupons.find((x) => x.code === order.coupon); if (c) c.used++; }
      outcome = "order marked paid";
      audit({ actorId: "razorpay", tenantId: order.tenantId, action: "payment.captured", target: order.id, ip: "webhook" });
    }
  }
  d.webhookEvents.unshift({ id: db.id("whk"), provider: "razorpay", eventId: evt.id, type: evt.event, payloadHash: db.hash(rawBody), processedAt: db.now(), outcome });
  db.save();
  return { ok: true, outcome, status: 200 };
}
