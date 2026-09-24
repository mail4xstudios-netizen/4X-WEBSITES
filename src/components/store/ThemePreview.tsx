import type { Theme } from "@/lib/types";

/**
 * Browser-framed mini rendering of a theme, used as the card artwork across the store.
 * Each layout draws a distinct composition tinted with the theme's accent, so a grid of
 * cards reads like a shelf of real sites rather than the same block recoloured.
 *
 * Every dimension is expressed in `cqw` (percentage of the preview's own width) against a
 * 420px design, so one component fills a 360px card and a 1080px hero identically.
 */
const DESIGN = 420;
const u = (px: number) => `${((px / DESIGN) * 100).toFixed(3)}cqw`;

const Bar = ({ w = "100%", h = 6, c = "#0f172a", o = 1, r = 3 }: { w?: string | number; h?: number; c?: string; o?: number; r?: number }) => (
  <span style={{ display: "block", width: typeof w === "number" ? u(w) : w, height: u(h), background: c, opacity: o, borderRadius: u(r) }} />
);

function Nav({ a, centered, serif }: { a: string; centered?: boolean; serif?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: u(6), padding: `${u(7)} ${u(10)}`, borderBottom: "1px solid rgba(15,23,42,.08)", justifyContent: centered ? "center" : undefined, background: "#fff" }}>
      <span style={{ width: u(16), height: u(16), borderRadius: u(serif ? 3 : 5), background: a, flex: "none" }} />
      {!centered && <Bar w={34} h={5} o={0.75} />}
      <span style={{ flex: 1 }} />
      {!centered && <><Bar w={18} h={4} c="#64748b" o={0.5} /><Bar w={18} h={4} c="#64748b" o={0.5} /><Bar w={18} h={4} c="#64748b" o={0.5} /></>}
      {centered && <><Bar w={16} h={4} c="#64748b" o={0.5} /><Bar w={16} h={4} c="#64748b" o={0.5} /></>}
      {!centered && <span style={{ width: u(30), height: u(12), borderRadius: u(6), background: a, flex: "none" }} />}
    </div>
  );
}

const Photo = ({ a, h, r = 6, dark }: { a: string; h: number | string; r?: number; dark?: boolean }) => (
  <span style={{ display: "block", height: typeof h === "number" ? u(h) : h, borderRadius: u(r), background: dark ? `linear-gradient(150deg, ${a}, #0b1220)` : `linear-gradient(140deg, ${a}33, ${a}bb)` }} />
);

const Cards = ({ n, a, h = 34 }: { n: number; a: string; h?: number }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: u(6) }}>
    {Array.from({ length: n }).map((_, i) => (
      <span key={i} style={{ borderRadius: u(6), border: "1px solid rgba(15,23,42,.08)", padding: u(6), display: "grid", gap: u(4), background: "#fff", height: u(h) }}>
        <span style={{ width: u(12), height: u(12), borderRadius: u(4), background: a }} />
        <Bar w="80%" h={4} o={0.7} />
        <Bar w="55%" h={3} c="#94a3b8" />
      </span>
    ))}
  </div>
);

/** Lower band: a quote/CTA strip plus a dark footer, so a preview fills a 16:10 frame like a real page. */
const Tail = ({ a, wash, mobile }: { a: string; wash: string; mobile?: boolean }) => (
  <>
    <div style={{ background: wash, padding: `${u(12)} ${u(10)}`, display: "grid", gap: u(5), justifyItems: "center" }}>
      <Bar w="44%" h={6} o={0.8} />
      <Bar w="62%" h={4} c="#94a3b8" />
      <span style={{ width: u(44), height: u(12), borderRadius: u(6), background: a, marginTop: u(3) }} />
    </div>
    <div style={{ background: "#0f172a", padding: u(10), display: "grid", gridTemplateColumns: mobile ? "1fr" : "1.4fr 1fr 1fr", gap: u(8) }}>
      <span style={{ display: "grid", gap: u(4) }}><Bar w="60%" h={5} c="#fff" o={0.9} /><Bar w="85%" h={3} c="#fff" o={0.35} /></span>
      {!mobile && <span style={{ display: "grid", gap: u(4) }}><Bar w="70%" h={3} c="#fff" o={0.45} /><Bar w="50%" h={3} c="#fff" o={0.25} /></span>}
      {!mobile && <span style={{ display: "grid", gap: u(4) }}><Bar w="70%" h={3} c="#fff" o={0.45} /><Bar w="50%" h={3} c="#fff" o={0.25} /></span>}
    </div>
  </>
);

export function ThemePreview({ theme, className = "", chrome = true, frame }: { theme: Theme; className?: string; chrome?: boolean; frame?: "mobile" }) {
  const a = theme.accent;
  const serif = theme.layout === "classic";
  const bg = serif ? "#fbfaf6" : "#ffffff";
  const mobile = frame === "mobile";

  let body: React.ReactNode;
  switch (theme.layout) {
    case "split":
      body = (
        <div style={{ padding: u(10), display: "grid", gap: u(8) }}>
          <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: u(10), alignItems: "center" }}>
            <div style={{ display: "grid", gap: u(5) }}>
              <span style={{ width: u(40), height: u(8), borderRadius: u(99), background: `${a}22` }} />
              <Bar w="100%" h={9} /><Bar w="72%" h={9} />
              <Bar w="90%" h={4} c="#94a3b8" /><Bar w="60%" h={4} c="#94a3b8" />
              <span style={{ display: "flex", gap: u(4), marginTop: u(2) }}><span style={{ width: u(38), height: u(13), borderRadius: u(7), background: a }} /><span style={{ width: u(30), height: u(13), borderRadius: u(7), border: "1px solid rgba(15,23,42,.15)" }} /></span>
            </div>
            <Photo a={a} h={mobile ? 60 : 78} />
          </div>
          <Cards n={mobile ? 1 : 3} a={a} />
        </div>
      );
      break;
    case "center":
      body = (
        <div style={{ padding: u(10), display: "grid", gap: u(8), justifyItems: "center" }}>
          <span style={{ width: u(46), height: u(8), borderRadius: u(99), background: `${a}22` }} />
          <Bar w="74%" h={10} /><Bar w="52%" h={10} />
          <Bar w="64%" h={4} c="#94a3b8" />
          <span style={{ width: u(40), height: u(13), borderRadius: u(99), background: a, marginBottom: u(2) }} />
          <Photo a={a} h={54} />
          <div style={{ width: "100%" }}><Cards n={mobile ? 1 : 3} a={a} h={30} /></div>
        </div>
      );
      break;
    case "full":
      body = (
        <div style={{ display: "grid", gap: u(8) }}>
          <div style={{ position: "relative", height: u(mobile ? 120 : 104) }}>
            <Photo a={a} h="100%" r={0} dark />
            <div style={{ position: "absolute", left: u(12), bottom: u(12), display: "grid", gap: u(5), width: mobile ? "80%" : "60%" }}>
              <Bar w="100%" h={9} c="#fff" /><Bar w="70%" h={9} c="#fff" />
              <Bar w="85%" h={4} c="#fff" o={0.65} />
              <span style={{ width: u(38), height: u(13), borderRadius: u(7), background: a, marginTop: u(2) }} />
            </div>
          </div>
          <div style={{ padding: `0 ${u(10)} ${u(10)}` }}><Cards n={mobile ? 1 : 3} a={a} /></div>
        </div>
      );
      break;
    case "grid":
      body = (
        <div style={{ padding: u(10), display: "grid", gap: u(8) }}>
          <div style={{ display: "flex", gap: u(5), alignItems: "center", border: "1px solid rgba(15,23,42,.12)", borderRadius: u(8), padding: u(4), background: "#fff" }}>
            <Bar w={72} h={4} c="#94a3b8" /><span style={{ flex: 1 }} />
            <span style={{ width: u(34), height: u(14), borderRadius: u(6), background: a, flex: "none" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${mobile ? 2 : 3},1fr)`, gap: u(6) }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} style={{ display: "grid", gap: u(3) }}>
                <Photo a={a} h={32} r={5} />
                <Bar w="85%" h={4} o={0.7} /><Bar w="50%" h={3} c={a} />
              </span>
            ))}
          </div>
        </div>
      );
      break;
    default: // classic
      body = (
        <div style={{ padding: u(12), display: "grid", gap: u(7), justifyItems: "center" }}>
          <span style={{ width: u(30), height: "1px", background: a }} />
          <Bar w="46%" h={4} c="#94a3b8" />
          <Bar w="80%" h={11} /><Bar w="56%" h={11} />
          <Bar w="66%" h={4} c="#94a3b8" />
          <span style={{ width: u(44), height: u(13), borderRadius: u(2), background: a, margin: `${u(2)} 0` }} />
          <span style={{ width: u(30), height: "1px", background: a }} />
          <div style={{ width: "100%", marginTop: u(2) }}><Cards n={mobile ? 1 : 2} a={a} h={30} /></div>
        </div>
      );
  }

  const site = (
    <div className="tp-scale" style={{ background: bg, height: "100%", fontFamily: serif ? "Georgia, serif" : "inherit" }}>
      <Nav a={a} centered={serif || theme.layout === "center"} serif={serif} />
      {body}
      <Tail a={a} wash={serif ? "#f3f0e7" : `${a}0f`} mobile={mobile} />
    </div>
  );

  if (mobile) {
    return (
      <div className={`overflow-hidden rounded-[22px] bg-white p-2 shadow-sm ring-1 ring-line ${className}`}>
        <div className="overflow-hidden rounded-[15px] ring-1 ring-line/70">
          <div className="flex justify-center bg-[#f7f9fc] py-1.5"><span className="h-1 w-10 rounded-full bg-line" /></div>
          <div style={{ aspectRatio: "9/15", overflow: "hidden" }}>{site}</div>
        </div>
      </div>
    );
  }
  if (!chrome) return <div className={`aspect-[16/10] overflow-hidden ${className}`}>{site}</div>;

  return (
    <div className={`overflow-hidden bg-white ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-line/70 bg-[#f7f9fc] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" /><span className="h-2 w-2 rounded-full bg-[#febc2e]" /><span className="h-2 w-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-muted ring-1 ring-line/70">{theme.slug}.4xstudios.com</span>
      </div>
      <div className="aspect-[16/10] overflow-hidden">{site}</div>
    </div>
  );
}

/** Older name kept so the admin, account and checkout pages keep working. */
export const Wireframe = ThemePreview;
