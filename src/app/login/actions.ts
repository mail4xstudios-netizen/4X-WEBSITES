"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { destroyAllSessions, destroySession, loginUser, signupUser, currentUser } from "@/lib/auth";

export type AuthState = { error?: string; values?: Record<string, string> };

const safeNext = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/account");

export async function loginAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse({ email: fd.get("email"), password: fd.get("password") });
  const values = { email: String(fd.get("email") ?? "") };
  if (!parsed.success) return { error: "Enter your email and password", values };
  const r = await loginUser(parsed.data.email, parsed.data.password);
  if (r.error) return { error: r.error, values };
  redirect(safeNext(fd.get("next")));
}

export async function signupAction(_prev: AuthState, fd: FormData): Promise<AuthState> {
  const values = { name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? ""), phone: String(fd.get("phone") ?? "") };
  const parsed = z
    .object({
      name: z.string().min(2, "Enter your name").max(80),
      email: z.string().email("Enter a valid email"),
      phone: z.string().regex(/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/, "Enter an Indian mobile number"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirm: z.string(),
    })
    .refine((v) => v.password === v.confirm, { message: "Passwords do not match", path: ["confirm"] })
    .safeParse({ name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone"), password: fd.get("password"), confirm: fd.get("confirm") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, values };
  const { confirm: _c, ...input } = parsed.data;
  void _c;
  const r = await signupUser(input);
  if (r.error) return { error: r.error, values };
  redirect(safeNext(fd.get("next")));
}

export async function logoutAction() {
  await destroySession("user");
  redirect("/");
}

export async function logoutEverywhereAction() {
  const u = await currentUser();
  if (u) destroyAllSessions("user", u.id);
  await destroySession("user");
  redirect("/login");
}
