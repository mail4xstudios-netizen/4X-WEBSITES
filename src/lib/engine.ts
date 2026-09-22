import type { DesignSettings, FieldDef, Profession, SiteContent, StepDef, Tenant, Theme } from "./types";
import { STEP_LIBRARY } from "./catalogue";

// ------------------------------------------------------------------
// Slot mapper (PRD §6): form answers → structured SiteContent.
// Answers are stored flat by dotted key ("brand.name") or as arrays for repeaters.
// ------------------------------------------------------------------

export function stepsForTheme(theme: Theme): StepDef[] {
  return theme.manifest.steps.map((id) => STEP_LIBRARY[id]).filter(Boolean);
}

function setPath(obj: Record<string, unknown>, dotted: string, value: unknown) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = (cur[parts[i]] as Record<string, unknown>) ?? {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export function answersToContent(answers: Record<string, unknown>, profession: Profession): SiteContent {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(answers)) {
    if (v === "" || v === undefined || v === null) continue;
    setPath(out, k, v);
  }
  const c = out as unknown as Partial<SiteContent>;
  const content: SiteContent = {
    brand: { name: "", tagline: "", ...(c.brand ?? {}) },
    about: { intro: "", full: "", ...(c.about ?? {}) },
    services: Array.isArray(c.services) ? c.services : [],
    team: Array.isArray(c.team) ? c.team : [],
    photos: { gallery: [], ...(c.photos ?? {}) },
    contact: { phone: "", whatsapp: "", email: "", address: "", hours: "", ...(c.contact ?? {}) },
    social: { ...(c.social ?? {}) },
    faq: Array.isArray(c.faq) ? c.faq : [],
    hiddenSections: {},
  };
  if (profession === "dentist") content.dentist = { registrationNumber: "", qualifications: "", treatments: [], timings: "", appointmentPreference: "Call", branches: [], ...(c.dentist ?? {}) };
  if (profession === "lawyer") content.lawyer = { enrolment: "", practiceAreas: [], courts: [], languages: [], chamberAddress: "", consultationMode: "In person", ...(c.lawyer ?? {}) };
  if (profession === "institute") content.institute = { courses: [], batches: [], achievements: [], affiliations: "", placementPartners: "", ...(c.institute ?? {}) };
  if (profession === "realestate") content.realestate = { rera: "", listings: [], agentDetails: "", ...(c.realestate ?? {}) };
  return content;
}

// ------------------------------------------------------------------
// Validation (Zod-free light version used for step gating; API routes use Zod).
// ------------------------------------------------------------------

export interface Issue {
  key: string;
  message: string;
  level: "error" | "warning";
}

export function validateStep(step: StepDef, answers: Record<string, unknown>): Issue[] {
  const issues: Issue[] = [];
  const check = (f: FieldDef, value: unknown, prefix = "") => {
    const key = prefix + f.key;
    if (f.type === "repeater") {
      const arr = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      if (f.required && arr.length < (f.min ?? 1)) issues.push({ key, message: `Add at least ${f.min ?? 1}`, level: "error" });
      if (f.max && arr.length > f.max) issues.push({ key, message: `Maximum ${f.max} items`, level: "error" });
      arr.forEach((row, i) => f.fields?.forEach((sf) => check(sf, row[sf.key], `${key}[${i}].`)));
      return;
    }
    if (f.type === "multiselect" || f.type === "images") {
      const arr = Array.isArray(value) ? value : [];
      if (f.required && arr.length === 0) issues.push({ key, message: "Pick at least one", level: "error" });
      return;
    }
    if (f.type === "checkbox") return;
    const s = typeof value === "string" ? value.trim() : value == null ? "" : String(value);
    if (f.required && !s) issues.push({ key, message: "Required", level: "error" });
    if (f.max && s.length > f.max) issues.push({ key, message: `Too long for this slot (${s.length}/${f.max}). It will be flagged, not cut.`, level: "warning" });
    if (s && f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) issues.push({ key, message: "Enter a valid email", level: "error" });
    if (s && f.type === "phone" && !/^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(s)) issues.push({ key, message: "Enter an Indian mobile number", level: "error" });
    if (s && f.type === "url" && !/^https?:\/\/.+/.test(s)) issues.push({ key, message: "Must start with http:// or https://", level: "error" });
  };
  for (const f of step.fields) check(f, answers[f.key]);
  return issues;
}

// ------------------------------------------------------------------
// Vertical compliance (PRD §11)
// ------------------------------------------------------------------

const BANNED: Record<Profession, RegExp[]> = {
  dentist: [/\bbest\b/i, /\bno\.?\s?1\b/i, /\bguarantee[ds]?\b/i, /\bpainless guaranteed\b/i, /\btop dentist\b/i],
  lawyer: [/\bbest\b/i, /\bno\.?\s?1\b/i, /\bsuccess rate\b/i, /\bguarantee[ds]?\b/i, /\bwin(ning)? rate\b/i, /\btop lawyer\b/i],
  institute: [/\b100%\s*(placement|selection|result)/i, /\bguaranteed? (placement|selection|job)/i, /\bbest institute\b/i],
  realestate: [/\bguaranteed? returns?\b/i, /\bassured returns?\b/i],
};

export function complianceIssues(content: SiteContent, profession: Profession): Issue[] {
  const issues: Issue[] = [];
  const texts: [string, string][] = [
    ["brand.tagline", content.brand.tagline],
    ["about.intro", content.about.intro],
    ["about.full", content.about.full],
    ["about.mission", content.about.mission ?? ""],
    ...content.services.map((s, i): [string, string] => [`services[${i}].description`, `${s.name} ${s.description}`]),
    ...content.faq.map((f, i): [string, string] => [`faq[${i}].a`, `${f.q} ${f.a}`]),
  ];
  for (const [key, text] of texts) {
    for (const re of BANNED[profession]) {
      const m = text?.match(re);
      if (m) issues.push({ key, message: `"${m[0]}" is flagged for ${profession} sites — remove superlatives and guarantees.`, level: "warning" });
    }
  }
  if (profession === "lawyer") {
    content.services.forEach((s, i) => {
      if (s.price) issues.push({ key: `services[${i}].price`, message: "Bar Council rules: no pricing blocks on lawyer sites. Price will not be shown.", level: "warning" });
    });
    if (!content.lawyer?.enrolment) issues.push({ key: "lawyer.enrolment", message: "Enrolment number is required.", level: "error" });
  }
  if (profession === "realestate") {
    content.realestate?.listings.forEach((l, i) => {
      if (!l.reraNumber?.trim()) issues.push({ key: `realestate.listings[${i}].reraNumber`, message: `"${l.title}" has no RERA number — it stays in your draft but will not be published.`, level: "warning" });
    });
  }
  if (profession === "institute") {
    content.institute?.achievements.forEach((a, i) => {
      if (!a.source || !a.year) issues.push({ key: `institute.achievements[${i}]`, message: `"${a.text}" needs a year and source — it will not be published until it has both.`, level: "warning" });
    });
  }
  if (profession === "dentist" && !content.dentist?.registrationNumber) {
    issues.push({ key: "dentist.registrationNumber", message: "Registration number must be shown on the site.", level: "error" });
  }
  return issues;
}

/**
 * Applied at publish time only (the draft keeps everything so the owner can fix it in the editor):
 * drops lawyer prices, RERA-less listings and unsourced result claims. Missing registration/enrolment
 * numbers are hard errors that block publishing instead.
 */
export function enforceCompliance(content: SiteContent, profession: Profession): SiteContent {
  const c: SiteContent = JSON.parse(JSON.stringify(content));
  if (profession === "lawyer") c.services = c.services.map((s) => { const { price, ...rest } = s; void price; return rest; });
  if (profession === "realestate" && c.realestate) c.realestate.listings = c.realestate.listings.filter((l) => l.reraNumber?.trim());
  if (profession === "institute" && c.institute) c.institute.achievements = c.institute.achievements.filter((a) => a.source && a.year);
  return c;
}

// ------------------------------------------------------------------
// Brand colour → CSS variables with WCAG AA contrast (BLD-05)
// ------------------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function luminance([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrastWithWhite(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 21;
  return (1.05) / (luminance(rgb) + 0.05);
}
/** Darkens the accent until white text on it meets 4.5:1. */
export function accessibleAccent(hex: string, fallback: string): string {
  let rgb = hexToRgb(hex) ?? hexToRgb(fallback)!;
  let guard = 0;
  while ((1.05) / (luminance(rgb) + 0.05) < 4.5 && guard++ < 40) {
    rgb = rgb.map((c) => Math.max(0, Math.round(c * 0.92))) as [number, number, number];
  }
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

export function defaultDesign(theme: Theme, brandColor?: string): DesignSettings {
  return {
    accent: accessibleAccent(brandColor || theme.accent, theme.accent),
    font: theme.manifest.fonts[0],
    headerVariant: theme.manifest.headerVariants[0],
    buttonStyle: theme.style === "friendly" ? "pill" : theme.style === "premium" ? "square" : "rounded",
  };
}

// ------------------------------------------------------------------
// SEO (BLD-06): titles, descriptions and schema.org JSON-LD
// ------------------------------------------------------------------

export function seoFor(content: SiteContent, profession: Profession, page = "home") {
  const city = content.social.city ? ` in ${content.social.city}` : "";
  const kind: Record<Profession, string> = { dentist: "Dental clinic", lawyer: "Advocates", institute: "Institute", realestate: "Real estate" };
  const title = content.seo?.title || (page === "home" ? `${content.brand.name} — ${kind[profession]}${city}` : `${page[0].toUpperCase()}${page.slice(1)} · ${content.brand.name}`);
  const description = content.seo?.description || (content.about.intro || content.brand.tagline).slice(0, 155);
  return { title, description };
}

export function schemaOrg(content: SiteContent, profession: Profession, url: string) {
  const type: Record<Profession, string> = { dentist: "Dentist", lawyer: "LegalService", institute: "EducationalOrganization", realestate: "RealEstateAgent" };
  return {
    "@context": "https://schema.org",
    "@type": type[profession],
    name: content.brand.name,
    description: content.about.intro,
    url,
    telephone: content.contact.phone,
    email: content.contact.email,
    address: { "@type": "PostalAddress", streetAddress: content.contact.address, addressLocality: content.social.city, addressCountry: "IN" },
    openingHours: content.contact.hours,
    image: content.photos.hero,
    sameAs: [content.social.instagram, content.social.facebook, content.social.youtube, content.social.linkedin].filter(Boolean),
  };
}

export function tenantHost(tenant: Tenant, verifiedDomain?: string) {
  return verifiedDomain ? `https://${verifiedDomain}` : `http://${tenant.slug}.localhost:3000`;
}

/** Inverse of answersToContent — used by the dashboard editor so it can reuse the form field renderer. */
export function contentToAnswers(content: SiteContent, steps: StepDef[]): Record<string, unknown> {
  const get = (obj: unknown, dotted: string) => dotted.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
  const out: Record<string, unknown> = {};
  for (const s of steps) for (const f of s.fields) {
    const v = get(content, f.key);
    if (v !== undefined) out[f.key] = v;
  }
  return out;
}
