export function DashPage({ title, sub, children, aside }: { title: string; sub?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-end justify-between gap-4"><div><h1 className="text-2xl font-extrabold">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>{aside}</div>
      <div className="mt-6 grid gap-6">{children}</div>
    </main>
  );
}
