"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BuildJob } from "@/lib/types";

export function BuildProgress({ jobId, tenantId }: { jobId: string; tenantId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<BuildJob | null>(null);
  useEffect(() => {
    let live = true;
    const tick = async () => {
      const r = await fetch(`/api/v1/build/${jobId}`);
      if (!live) return;
      if (r.ok) {
        const j = (await r.json()) as BuildJob;
        setJob(j);
        if (j.status === "done") return setTimeout(() => router.push(`/dashboard/${tenantId}`), 900);
        if (j.status === "failed") return;
      }
      setTimeout(tick, 500);
    };
    tick();
    return () => { live = false; };
  }, [jobId, tenantId, router]);
  return (
    <div className="card w-full max-w-lg p-8">
      <p className="kicker">Auto-build</p>
      <h1 className="text-2xl font-extrabold">{job?.stage ?? "Starting…"}</h1>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-line"><div className="h-full bg-blue transition-all duration-500" style={{ width: `${job?.progress ?? 0}%` }} /></div>
      <ul className="mt-5 space-y-1 font-mono text-xs text-ink2">{job?.log.map((l, i) => <li key={i}>✓ {l}</li>)}</ul>
      {job?.status === "failed" && <a href={`/onboarding/${tenantId}`} className="btn-secondary mt-5">Back to form</a>}
      {job?.status === "done" && <p className="mt-5 text-sm text-emerald-700">Opening your dashboard…</p>}
    </div>
  );
}
