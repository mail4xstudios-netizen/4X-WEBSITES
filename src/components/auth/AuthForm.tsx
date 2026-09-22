"use client";
import { useActionState } from "react";
import Link from "next/link";
import { loginAction, signupAction, type AuthState } from "@/app/login/actions";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? loginAction : signupAction, {});
  const v = state.values ?? {};
  return (
    <form action={action} className="card w-full max-w-md p-6 sm:p-8">
      <Link href="/" className="flex items-center gap-2 font-extrabold text-ink"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue text-sm text-white">4X</span>Theme Store</Link>
      <h1 className="mt-5 text-2xl font-extrabold">{mode === "login" ? "Sign in" : "Create your account"}</h1>
      <p className="mt-1 text-sm text-muted">{mode === "login" ? "Access your website dashboard, leads and billing." : "You’ll use this to manage your website after purchase."}</p>
      <input type="hidden" name="next" value={next} />
      <div className="mt-5 grid gap-4">
        {mode === "signup" && (
          <>
            <div><label className="label">Full name</label><input name="name" required className="input" defaultValue={v.name} autoComplete="name" /></div>
            <div><label className="label">Mobile</label><input name="phone" required className="input" placeholder="+91 98XXXXXXXX" defaultValue={v.phone} autoComplete="tel" /></div>
          </>
        )}
        <div><label className="label">Email</label><input name="email" type="email" required className="input" defaultValue={v.email} autoComplete="email" /></div>
        <div><label className="label">Password</label><input name="password" type="password" required minLength={mode === "signup" ? 8 : 1} className="input" autoComplete={mode === "login" ? "current-password" : "new-password"} />{mode === "signup" && <p className="mt-1 text-xs text-muted">At least 8 characters with a number.</p>}</div>
        {mode === "signup" && <div><label className="label">Confirm password</label><input name="confirm" type="password" required className="input" autoComplete="new-password" /></div>}
        {state.error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="btn-primary w-full !py-3">{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
      </div>
      <p className="mt-5 text-center text-sm text-muted">
        {mode === "login" ? <>New here? <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-semibold text-blue">Create an account</Link></> : <>Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-blue">Sign in</Link></>}
      </p>
      {mode === "login" && <p className="mt-2 text-center text-xs text-muted">Forgot your password? Contact 4X Studios support and we’ll reset it from the admin panel.</p>}
    </form>
  );
}
