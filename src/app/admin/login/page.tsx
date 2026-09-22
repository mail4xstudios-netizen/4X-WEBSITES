import { redirect } from "next/navigation";
import { currentAdmin, ensureDefaultAdmin } from "@/lib/auth";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLogin() {
  ensureDefaultAdmin();
  if (await currentAdmin()) redirect("/admin");
  return <main className="grid min-h-screen place-items-center bg-slate-900 p-4"><AdminLoginForm /></main>;
}
