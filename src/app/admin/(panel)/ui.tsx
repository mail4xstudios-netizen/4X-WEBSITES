export function Page({ title, sub, children, aside }: { title: string; sub?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-extrabold">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>{aside}</div>
      <div className="mt-6 grid gap-6">{children}</div>
    </main>
  );
}
export function Table({ head, children, empty, rows }: { head: string[]; children: React.ReactNode; empty: string; rows: number }) {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm"><thead className="bg-wash text-left"><tr>{head.map((h) => <th key={h} className="whitespace-nowrap p-3 font-semibold">{h}</th>)}</tr></thead><tbody>{children}</tbody></table>
      {!rows && <p className="p-8 text-center text-muted">{empty}</p>}
    </div>
  );
}
export const Td = ({ children, className = "" }: { children?: React.ReactNode; className?: string }) => <td className={`p-3 align-top ${className}`}>{children}</td>;
export const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");
