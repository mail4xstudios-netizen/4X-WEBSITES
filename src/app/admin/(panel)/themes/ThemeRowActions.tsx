"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function ThemeRowActions({ id, slug, catalogue, overridden, tenants }: { id: string; slug: string; catalogue: boolean; overridden: boolean; tenants: number }) {
  const router = useRouter();
  async function reset() {
    const msg = catalogue ? "Discard admin edits and restore this theme's catalogue definition?" : tenants ? "Tenants use this theme; it cannot be deleted. Unpublish it instead." : "Delete this custom theme?";
    if (!catalogue && tenants) return alert(msg);
    if (!confirm(msg)) return;
    const r = await fetch(`/api/v1/admin/themes/${id}`, { method: "DELETE" });
    if (!r.ok) alert((await r.json()).error);
    router.refresh();
  }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Link href={`/admin/themes/${id}`} className="btn-secondary !py-1 text-xs">Edit details</Link>
      <Link href={`/admin/themes/${id}/design`} className="btn-primary !py-1 text-xs">Visual designer</Link>
      <a href={`/demo/${slug}`} target="_blank" className="btn-secondary !py-1 text-xs">Demo</a>
      {(overridden || !catalogue) && <button onClick={reset} className="text-xs text-red-600">{catalogue ? "Reset to catalogue" : "Delete"}</button>}
    </div>
  );
}
