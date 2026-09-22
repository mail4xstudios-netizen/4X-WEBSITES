import Link from "next/link";
import type { Theme } from "@/lib/types";
import { PROFESSIONS, inr } from "@/lib/catalogue";

export function Wireframe({ theme, className = "" }: { theme: Theme; className?: string }) {
  const a = { ["--a" as string]: theme.accent };
  const nav = (
    <div className="nav"><div className="logo" /><div className="nl" /><div className="ln" /><div className="ln" /><div className="ln" /><div className="cta" /></div>
  );
  let body: React.ReactNode;
  switch (theme.layout) {
    case "split":
      body = <><div className="hero"><div className="txt"><div className="bar" /><div className="bar" style={{ width: "70%" }} /><div className="bar s" /><div className="btn" /></div><div className="img" /></div><div className="row"><div className="card" style={{ flex: 1 }} /><div className="card" style={{ flex: 1 }} /><div className="card" style={{ flex: 1 }} /></div></>;
      break;
    case "center":
      body = <><div className="hero"><div className="bar" /><div className="bar s" /><div className="btn" /></div><div className="row"><div className="img" style={{ flex: 1 }} /><div className="img" style={{ flex: 1 }} /><div className="img" style={{ flex: 1 }} /></div></>;
      break;
    case "full":
      body = <div className="hero"><div className="img" /><div className="txt"><div className="bar" /><div className="bar s" /><div className="btn" /></div></div>;
      break;
    case "grid":
      body = <><div className="search"><i /></div><div className="g">{[...Array(6)].map((_, i) => <div key={i} className="img" />)}</div></>;
      break;
    case "classic":
      body = <><div className="rule" /><div className="hero"><div className="bar" /><div className="bar s" /><div className="btn" /></div><div className="rule" /><div className="row"><div className="card" style={{ flex: 1 }} /><div className="card" style={{ flex: 1 }} /></div></>;
      break;
  }
  return (
    <div className={`tp l-${theme.layout} ${className}`} style={a}>
      {nav}
      {body}
      <span className="absolute right-1.5 top-1.5 rounded bg-white px-1 py-0.5 font-mono text-[10px] font-semibold text-muted">{theme.id}</span>
    </div>
  );
}

export function ThemeCard({ theme }: { theme: Theme }) {
  return (
    <article className="card group flex flex-col overflow-hidden transition hover:shadow-lg">
      <Link href={`/themes/${theme.slug}`} className="border-b border-line"><Wireframe theme={theme} /></Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold">{theme.name}</h3>
          <span className="tag">{PROFESSIONS[theme.profession].label}</span>
        </div>
        <p className="text-sm text-muted">{theme.forWhom}</p>
        <ul className="mt-3 space-y-1 text-sm text-ink2">
          {theme.highlights.map((h) => <li key={h} className="flex gap-2"><span className="text-blue">✓</span>{h}</li>)}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <p><span className="text-lg font-extrabold">{inr(theme.priceINR)}</span> <span className="text-xs text-muted">theme fee + hosting</span></p>
          <div className="flex gap-2 text-sm">
            <Link href={`/demo/${theme.slug}`} className="btn-secondary !px-3 !py-1.5">Demo</Link>
            <Link href={`/themes/${theme.slug}`} className="btn-primary !px-3 !py-1.5">Details</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
