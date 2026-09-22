import type { DesignSettings, SectionStyle, SlotStyle, Theme } from "./types";

/**
 * Compiles DesignSettings into plain CSS. Used server-side by SiteRenderer and client-side by the editor
 * for instant preview (it posts the CSS into the iframe). Pure: no imports from server modules.
 */

export const DESIGN_DEFAULTS = {
  colors: { background: "#ffffff", text: "#0f172a", heading: "#0f172a", wash: "", secondary: "", footerBg: "#0f172a" },
  typography: { headingFont: "", bodyFont: "", baseSize: 16, headingScale: 1, headingWeight: 800 as const, letterSpacing: -0.02, lineHeight: 1.6 },
  shape: { radius: 12, imageShape: "rounded" as const, cardStyle: "shadow" as const, buttonSize: "md" as const, buttonWeight: 600 as const },
  spacing: { section: "normal" as const, container: "normal" as const, gap: "md" as const },
  header: { sticky: true, transparent: false, logoSize: 36, showCta: true, ctaText: "" },
};

export const FONT_STACKS: Record<string, string> = {
  "Schibsted Grotesk": `"Schibsted Grotesk", Inter, system-ui, sans-serif`,
  Inter: `Inter, "Schibsted Grotesk", system-ui, sans-serif`,
  "DM Sans": `"DM Sans", "Schibsted Grotesk", system-ui, sans-serif`,
  "Source Serif 4": `"Source Serif 4", Georgia, "Times New Roman", serif`,
  Georgia: `Georgia, "Times New Roman", serif`,
  System: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`,
  Mono: `"JetBrains Mono", ui-monospace, Menlo, monospace`,
};
export const FONT_OPTIONS = Object.keys(FONT_STACKS);

const PAD = { none: "0", sm: "1.5rem", md: "3.5rem", lg: "5rem", xl: "7rem" };
const SECTION_PAD = { compact: "2.25rem", normal: "3.5rem", spacious: "5.5rem" };
const CONTAINER = { narrow: "56rem", normal: "72rem", wide: "88rem", full: "100%" };
const GAP = { sm: "0.75rem", md: "1.25rem", lg: "2rem" };
const ASPECT: Record<string, string> = { "21:9": "21/9", "16:9": "16/9", "4:3": "4/3", "3:2": "3/2", "1:1": "1/1", "3:4": "3/4" };
const SHADOW = { none: "none", sm: "0 1px 2px rgba(0,0,0,.08)", md: "0 6px 16px rgba(0,0,0,.12)", lg: "0 18px 40px rgba(0,0,0,.2)" };
const HEADING = { sm: 0.8, md: 1, lg: 1.2, xl: 1.45 };
const BODY = { sm: 0.9, md: 1, lg: 1.12 };

export function mergeDesign(theme: Theme | undefined, design: DesignSettings): DesignSettings {
  const t = theme?.defaults ?? {};
  return {
    ...t, ...design,
    colors: { ...t.colors, ...design.colors },
    typography: { ...t.typography, ...design.typography },
    shape: { ...t.shape, ...design.shape },
    spacing: { ...t.spacing, ...design.spacing },
    header: { ...t.header, ...design.header },
    sectionStyles: { ...t.sectionStyles, ...design.sectionStyles },
    slotStyles: { ...t.slotStyles, ...design.slotStyles },
    sectionOrder: { ...t.sectionOrder, ...design.sectionOrder },
  };
}

function fontStack(name: string | undefined, fallback: string) {
  return (name && FONT_STACKS[name]) || fallback;
}

export function radiusFor(shape: DesignSettings["shape"], buttonStyle: DesignSettings["buttonStyle"]) {
  const base = shape?.radius ?? DESIGN_DEFAULTS.shape.radius;
  return { card: `${base}px`, button: buttonStyle === "pill" ? "999px" : buttonStyle === "square" ? "4px" : `${Math.max(4, Math.round(base * 0.66))}px`, image: shape?.imageShape === "circle" ? "50%" : shape?.imageShape === "square" ? "0" : shape?.imageShape === "soft" ? `${Math.max(base, 24)}px` : `${base}px` };
}

/** Root variables + global rules. `classic` layouts default to serif headings. */
export function designCss(design: DesignSettings, layout: string): string {
  const c = { ...DESIGN_DEFAULTS.colors, ...design.colors };
  const ty = { ...DESIGN_DEFAULTS.typography, ...design.typography };
  const sh = { ...DESIGN_DEFAULTS.shape, ...design.shape };
  const sp = { ...DESIGN_DEFAULTS.spacing, ...design.spacing };
  const hd = { ...DESIGN_DEFAULTS.header, ...design.header };
  const r = radiusFor(sh, design.buttonStyle);
  const serif = layout === "classic";
  const body = fontStack(ty.bodyFont || design.font, serif ? FONT_STACKS["Source Serif 4"] : FONT_STACKS["Schibsted Grotesk"]);
  const heading = fontStack(ty.headingFont, body);
  const wash = c.wash || design.accent + "14";
  const btnPad = { sm: ".5rem .95rem", md: ".65rem 1.2rem", lg: ".85rem 1.6rem" }[sh.buttonSize];
  const btnSize = { sm: ".85rem", md: ".95rem", lg: "1.05rem" }[sh.buttonSize];
  const card = { flat: "border:0;box-shadow:none;background:transparent", outline: "border:1px solid rgba(0,0,0,.1);box-shadow:none", shadow: "border:1px solid rgba(0,0,0,.05);box-shadow:0 1px 2px rgba(0,0,0,.06)", filled: `border:0;box-shadow:none;background:${wash}` }[sh.cardStyle];
  let css = `.site-root{--a:${design.accent};--wash:${wash};--bg:${c.background};--text:${c.text};--heading:${c.heading};--secondary:${c.secondary || design.accent};--footer:${c.footerBg};--r:${r.button};--r-card:${r.card};--r-img:${r.image};--base:${ty.baseSize}px;--hscale:${ty.headingScale};--hweight:${ty.headingWeight};--track:${ty.letterSpacing}em;--lh:${ty.lineHeight};--sec-pad:${SECTION_PAD[sp.section]};--container:${CONTAINER[sp.container]};--gap:${GAP[sp.gap]};--logo:${hd.logoSize}px;font-family:${body};font-size:var(--base);line-height:var(--lh);background:var(--bg);color:var(--text)}
.site-root h1,.site-root h2,.site-root h3{font-family:${heading};color:var(--heading);letter-spacing:var(--track);font-weight:var(--hweight)}
.site-root h1{font-size:calc(2.75rem * var(--hscale))}.site-root h2{font-size:calc(1.875rem * var(--hscale))}.site-root h3{font-size:calc(1.125rem * var(--hscale))}
@media(min-width:640px){.site-root h1{font-size:calc(3.25rem * var(--hscale))}}
.site-root .sec{padding-top:var(--sec-pad);padding-bottom:var(--sec-pad)}.site-root .sec-inner,.site-root .container{max-width:var(--container)}
.site-root .sec-grid{gap:var(--gap)}.site-root .card-x{border-radius:var(--r-card);${card}}
.site-root .btn{padding:${btnPad};font-size:${btnSize};font-weight:${sh.buttonWeight};border-radius:var(--r)}
.site-root .img-x{border-radius:var(--r-img)}.site-root .site-header{${hd.sticky ? "position:sticky;top:0" : "position:relative"};${hd.transparent ? "background:transparent;backdrop-filter:none;border-color:transparent;position:absolute;left:0;right:0" : ""}}
.site-root .site-logo{height:var(--logo)}${hd.showCta === false ? ".site-root .header-cta{display:none!important}" : ""}
.site-root .site-footer{background:var(--footer)}
`;
  for (const [key, s] of Object.entries(design.sectionStyles ?? {})) css += sectionCss(key, s);
  for (const [key, s] of Object.entries(design.slotStyles ?? {})) css += slotCss(key, s);
  return css;
}

function sectionCss(key: string, s: SectionStyle) {
  const [page, id] = key.split(":");
  const sel = `.site-root[data-page="${page}"] [data-section="${id}"]`;
  const rules: string[] = [];
  if (s.bg === "wash") rules.push("background:var(--wash)");
  if (s.bg === "none") rules.push("background:transparent");
  if (s.bg === "accent") rules.push("background:var(--a);color:#fff;--heading:#fff;--text:#fff");
  if (s.bg === "dark") rules.push("background:#0f172a;color:#e2e8f0;--heading:#fff;--text:#e2e8f0");
  if (s.bg === "custom" && s.bgColor) rules.push(`background:${s.bgColor}`);
  if (s.textColor) rules.push(`color:${s.textColor};--heading:${s.textColor};--text:${s.textColor}`);
  if (s.padding) rules.push(`padding-top:${PAD[s.padding]};padding-bottom:${PAD[s.padding]}`);
  if (s.align) rules.push(`text-align:${s.align}`);
  if (s.headingSize) rules.push(`--hscale:${HEADING[s.headingSize]}`);
  if (s.bodySize) rules.push(`font-size:calc(var(--base) * ${BODY[s.bodySize]})`);
  if (s.gap) rules.push(`--gap:${GAP[s.gap]}`);
  if (s.divider) rules.push("border-top:1px solid rgba(0,0,0,.08)");
  let css = rules.length ? `${sel}{${rules.join(";")}}\n` : "";
  if (s.bg === "accent" || s.bg === "dark") {
    // Light text on the section, but white cards keep dark text inside.
    css += `${sel} .text-slate-600,${sel} .text-slate-500,${sel} .text-slate-700{color:rgba(255,255,255,.82)}${sel} .card-x{--heading:#0f172a;--text:#0f172a;color:#0f172a}${sel} .card-x .text-slate-600,${sel} .card-x .text-slate-700{color:#475569}${sel} .card-x .text-slate-500{color:#64748b}${sel} .bg-\\[var\\(--wash\\)\\]{background:rgba(255,255,255,.12)}\n`;
  }
  if (s.width) css += `${sel} .sec-inner{max-width:${CONTAINER[s.width]}}\n`;
  if (s.align === "center") css += `${sel} .sec-head,${sel} .hero-text{margin-left:auto;margin-right:auto}${sel} .btn-row{justify-content:center}${sel} .hero-text .btn-row{justify-content:center}\n`;
  if (s.align === "right") css += `${sel} .sec-head,${sel} .hero-text{margin-left:auto}${sel} .btn-row{justify-content:flex-end}\n`;
  if (s.columns) css += `@media(min-width:640px){${sel} .sec-grid{grid-template-columns:repeat(${Math.min(s.columns, 2)},minmax(0,1fr))}}@media(min-width:1024px){${sel} .sec-grid{grid-template-columns:repeat(${s.columns},minmax(0,1fr))}}\n`;
  if (s.imagePosition === "left") css += `${sel} .hero-grid{direction:rtl}${sel} .hero-grid>*{direction:ltr}\n`;
  if (s.imageAspect && s.imageAspect !== "auto") css += `${sel} .img-box{aspect-ratio:${ASPECT[s.imageAspect]}}\n`;
  if (s.imageShape) css += `${sel} .img-x{border-radius:${s.imageShape === "circle" ? "50%" : s.imageShape === "square" ? "0" : s.imageShape === "soft" ? "28px" : "var(--r-card)"}}\n`;
  if (s.cardStyle) css += `${sel} .card-x{${{ flat: "border:0;box-shadow:none;background:transparent", outline: "border:1px solid rgba(0,0,0,.1);box-shadow:none", shadow: "box-shadow:0 8px 24px rgba(0,0,0,.08)", filled: "border:0;background:var(--wash)" }[s.cardStyle]}}\n`;
  return css;
}

function slotCss(key: string, s: SlotStyle) {
  const sel = `.site-root [data-slot="${key.replace(/"/g, '\\"')}"]`;
  const r: string[] = [];
  if (s.hidden) return `${sel}{display:none!important}\n`;
  if (s.fontSize) r.push(`font-size:${s.fontSize}px`);
  if (s.fontWeight) r.push(`font-weight:${s.fontWeight}`);
  if (s.lineHeight) r.push(`line-height:${s.lineHeight}`);
  if (s.letterSpacing !== undefined) r.push(`letter-spacing:${s.letterSpacing}em`);
  if (s.color) r.push(`color:${s.color};--heading:${s.color}`);
  if (s.align) r.push(`text-align:${s.align}`);
  if (s.italic) r.push("font-style:italic");
  if (s.uppercase) r.push("text-transform:uppercase");
  if (s.underline) r.push("text-decoration:underline");
  if (s.maxWidth) r.push(`max-width:${s.maxWidth}px`);
  if (s.width) r.push(`width:${s.width}${s.widthUnit ?? "px"};max-width:100%`);
  if (s.height) r.push(`height:${s.height}px`);
  if (s.objectFit) r.push(`object-fit:${s.objectFit}`);
  if (s.focalX !== undefined || s.focalY !== undefined) r.push(`object-position:${s.focalX ?? 50}% ${s.focalY ?? 50}%`);
  if (s.radius !== undefined) r.push(`border-radius:${s.radius}px`);
  if (s.shadow) r.push(`box-shadow:${SHADOW[s.shadow]}`);
  if (s.opacity !== undefined) r.push(`opacity:${s.opacity / 100}`);
  const tf: string[] = [];
  if (s.offsetX || s.offsetY) tf.push(`translate(${s.offsetX ?? 0}px,${s.offsetY ?? 0}px)`);
  if (s.rotate) tf.push(`rotate(${s.rotate}deg)`);
  if (tf.length) r.push(`transform:${tf.join(" ")}`);
  if (s.marginTop !== undefined) r.push(`margin-top:${s.marginTop}px`);
  if (s.marginBottom !== undefined) r.push(`margin-bottom:${s.marginBottom}px`);
  if (s.align === "center" && (s.width || s.maxWidth)) r.push("margin-left:auto;margin-right:auto");
  if (s.align === "right" && (s.width || s.maxWidth)) r.push("margin-left:auto");
  if (s.width || s.height || s.maxWidth || s.offsetX || s.offsetY || s.rotate) r.push("display:block");
  return r.length ? `${sel}{${r.join(";")}}\n` : "";
}

/** Section ids for a page after applying the owner's order + hidden lists. */
export function orderedSections(manifestSections: string[], page: string, design: DesignSettings, hidden: string[] = []) {
  const custom = design.sectionOrder?.[page];
  const order = custom ? [...custom.filter((s) => manifestSections.includes(s)), ...manifestSections.filter((s) => !custom.includes(s))] : manifestSections;
  return order.filter((s) => !hidden.includes(s));
}
