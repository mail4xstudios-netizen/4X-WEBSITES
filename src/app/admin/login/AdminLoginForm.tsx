"use client";
import { useActionState } from "react";
import Link from "next/link";
import { adminLoginAction, type AdminAuthState } from "../actions";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState<AdminAuthState, FormData>(adminLoginAction, {});
  return (
    <form action={action} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
      <div className="flex items-center gap-2 font-extrabold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue text-sm text-white">4X</span>Super admin</div>
      <h1 className="mt-5 text-2xl font-extrabold">Sign in</h1>
      <p className="mt-1 text-sm text-muted">4X Studios staff only. Every action here is written to the audit log.</p>
      <div className="mt-5 grid gap-4">
        <div><label className="label">Email</label><input name="email" type="email" required className="input" defaultValue={state.email} autoComplete="username" /></div>
        <div><label className="label">Password</label><input name="password" type="password" required className="input" autoComplete="current-password" /></div>
        {state.error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="btn-primary w-full !py-3">{pending ? "Signing in…" : "Sign in"}</button>
      </div>
      <p className="mt-4 text-center text-xs text-muted">Default localhost credentials are in <code>.env.example</code>. TOTP 2FA is mandatory for admins in production.</p>
      <Link href="/" className="mt-3 block text-center text-sm text-blue">← Back to store</Link>
    </form>
  );
}
