import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth/AuthForm";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/account" } = await searchParams;
  if (await currentUser()) redirect(next.startsWith("/") ? next : "/account");
  return <main className="grid min-h-screen place-items-center bg-wash p-4"><AuthForm mode="signup" next={next} /></main>;
}
