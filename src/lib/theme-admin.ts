import { z } from "zod";
import type { Profession, Theme } from "./types";
import { visualDesignSchema } from "./design-schema";
import { STEP_LIBRARY } from "./catalogue";
import { getTheme, nextThemeId, uniqueThemeSlug } from "./themes";

export const SECTION_IDS = ["hero", "trust", "services", "team", "gallery", "faq", "contact", "about", "practice", "profile", "courts", "courses", "batches", "achievements", "listings", "amenities", "branches"];
export const STEP_IDS = Object.keys(STEP_LIBRARY);

export const themeInputSchema = z.object({
  name: z.string().min(2).max(40),
  profession: z.enum(["dentist", "lawyer", "institute", "realestate"]),
  tagline: z.string().max(80).optional(),
  forWhom: z.string().max(120),
  description: z.string().max(600).optional(),
  layout: z.enum(["split", "center", "full", "grid", "classic"]),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  style: z.enum(["minimal", "premium", "friendly"]),
  features: z.array(z.enum(["booking", "listings", "courses", "blog", "gallery", "brochure", "branches"])).max(7),
  priceINR: z.number().int().min(0).max(1000000),
  highlights: z.array(z.string().max(80)).max(6),
  featured: z.boolean().optional(),
  status: z.enum(["published", "draft"]),
  version: z.string().max(20).optional(),
  manifest: z.object({
    pages: z.array(z.object({ slug: z.string().regex(/^[a-z0-9-]+$/).max(30), name: z.string().min(1).max(30), sections: z.array(z.string().max(30)).max(20) })).min(1).max(12),
    steps: z.array(z.string().max(30)).min(1).max(20),
    fonts: z.array(z.string().max(40)).min(1).max(8),
    headerVariants: z.array(z.string().max(20)).min(1).max(5),
  }),
  defaults: visualDesignSchema.optional(),
});
export type ThemeInput = z.infer<typeof themeInputSchema>;

export function buildTheme(input: ThemeInput, existing?: Theme): Theme {
  const id = existing?.id ?? nextThemeId(input.profession as Profession);
  const manifest = { ...input.manifest, pages: input.manifest.pages.map((p) => ({ ...p, sections: p.sections.filter((s) => SECTION_IDS.includes(s)) })), steps: input.manifest.steps.filter((s) => STEP_IDS.includes(s)) };
  if (!manifest.steps.includes("review")) manifest.steps.push("review");
  return {
    ...(existing ?? {}),
    id,
    slug: existing?.slug ?? uniqueThemeSlug(input.name),
    name: input.name,
    profession: input.profession,
    tagline: input.tagline ?? existing?.tagline ?? "",
    forWhom: input.forWhom,
    description: input.description,
    layout: input.layout,
    accent: input.accent,
    style: input.style,
    features: input.features,
    priceINR: input.priceINR,
    highlights: input.highlights.filter(Boolean),
    featured: !!input.featured,
    status: input.status,
    version: input.version || existing?.version || "1.0.0",
    manifest,
    defaults: input.defaults ?? existing?.defaults,
    demoContent: existing?.demoContent,
    custom: existing ? existing.custom : true,
  };
}

export function themeToInput(t: Theme): ThemeInput {
  return { name: t.name, profession: t.profession, tagline: t.tagline, forWhom: t.forWhom, description: t.description, layout: t.layout, accent: t.accent, style: t.style, features: t.features, priceINR: t.priceINR, highlights: t.highlights, featured: t.featured, status: t.status, version: t.version, manifest: t.manifest, defaults: t.defaults as ThemeInput["defaults"] };
}

export { getTheme };
