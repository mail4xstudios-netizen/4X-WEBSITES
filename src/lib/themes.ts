import { THEMES as BASE_THEMES } from "./catalogue";
import { audit, db } from "./store";
import type { Profession, Theme } from "./types";

/**
 * Theme registry: the code catalogue (src/lib/catalogue.ts) plus database records.
 * A DB record with the same id as a catalogue theme overrides it (admin edits); other DB records are
 * admin-created themes. Themes never contain executable code, only data — so admin edits are safe.
 */
export function allThemes(): Theme[] {
  const overrides = new Map(db.get().themes.map((t) => [t.id, t]));
  const base = BASE_THEMES.map((t) => overrides.get(t.id) ?? t);
  const custom = db.get().themes.filter((t) => !BASE_THEMES.some((b) => b.id === t.id));
  return [...base, ...custom];
}

export function getTheme(slugOrId: string): Theme | undefined {
  return allThemes().find((t) => t.slug === slugOrId || t.id === slugOrId);
}

export function themesFor(profession?: Profession, includeDrafts = false) {
  return allThemes().filter((t) => (!profession || t.profession === profession) && (includeDrafts || t.status === "published"));
}

export function isCatalogueTheme(id: string) {
  return BASE_THEMES.some((b) => b.id === id);
}

export function nextThemeId(profession: Profession) {
  const prefix = { dentist: "D", lawyer: "L", institute: "I", realestate: "R" }[profession];
  const nums = allThemes().filter((t) => t.id.startsWith(prefix)).map((t) => parseInt(t.id.slice(1), 10)).filter((n) => !isNaN(n));
  return prefix + (Math.max(0, ...nums) + 1);
}

export function uniqueThemeSlug(name: string, keepId?: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "theme";
  let slug = base, i = 2;
  while (allThemes().some((t) => t.slug === slug && t.id !== keepId)) slug = `${base}-${i++}`;
  return slug;
}

export function saveTheme(theme: Theme, actorId: string) {
  const d = db.get();
  theme.updatedAt = db.now();
  const i = d.themes.findIndex((t) => t.id === theme.id);
  if (i >= 0) d.themes[i] = theme;
  else d.themes.push(theme);
  db.save();
  audit({ actorId, action: i >= 0 ? "theme.updated" : "theme.created", target: theme.id, ip: "local" });
  return theme;
}

/** Remove the DB record: catalogue themes revert to code defaults; custom themes are deleted. */
export function resetTheme(id: string, actorId: string) {
  const d = db.get();
  d.themes = d.themes.filter((t) => t.id !== id);
  db.save();
  audit({ actorId, action: isCatalogueTheme(id) ? "theme.reset" : "theme.deleted", target: id, ip: "local" });
}
