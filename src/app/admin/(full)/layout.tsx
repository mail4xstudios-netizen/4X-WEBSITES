import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";

/** Full-screen admin tools (visual theme designer) — admin session required, no sidebar. */
export default async function AdminFullLayout({ children }: { children: React.ReactNode }) {
  if (!(await currentAdmin())) redirect("/admin/login");
  return <>{children}</>;
}
