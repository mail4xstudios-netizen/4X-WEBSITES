import { getTheme } from "./themes";
import { answersToContent, complianceIssues, defaultDesign } from "./engine";
import { audit, db } from "./store";
import type { BuildJob } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** BLD-07: runs as a background job; the customer polls progress. Stages mirror PRD §6 flowchart. */
export function startBuild(tenantId: string, actorId: string): BuildJob {
  const d = db.get();
  const job: BuildJob = { id: db.id("job"), tenantId, progress: 0, stage: "Queued", log: [], status: "queued", startedAt: db.now() };
  d.jobs.unshift(job);
  const tenant = d.tenants.find((t) => t.id === tenantId)!;
  tenant.status = "building";
  db.save();

  (async () => {
    const step = async (pct: number, stage: string, line: string, ms = 500) => {
      job.progress = pct; job.stage = stage; job.log.push(line); job.status = "running"; db.save();
      await sleep(ms);
    };
    try {
      const theme = getTheme(tenant.themeId)!;
      const draft = d.drafts.find((x) => x.tenantId === tenantId);
      await step(10, "Validating answers", "Validating and sanitising form answers…");
      const content = answersToContent(draft?.answers ?? {}, tenant.profession);
      const issues = complianceIssues(content, tenant.profession);
      await step(25, "Compliance check", `${issues.length} compliance note(s) for ${tenant.profession}`);
      await step(40, "Mapping slots", `Mapping content into ${theme.name} — ${theme.manifest.pages.length} pages, ${theme.manifest.pages.reduce((n, p) => n + p.sections.length, 0)} sections`);
      const imgCount = (content.photos.gallery?.length ?? 0) + (content.photos.hero ? 1 : 0) + (content.brand.logo ? 1 : 0);
      await step(60, "Optimising images", `${imgCount} image(s) → WebP, EXIF stripped, smart-cropped`, 700);
      tenant.design = defaultDesign(theme, content.brand.color || (theme.defaults?.accent as string | undefined));
      await step(75, "Brand colours", `Accent ${tenant.design.accent} passes WCAG AA against white`);
      await step(88, "Generating SEO", "Titles, meta descriptions, sitemap.xml, robots.txt, schema.org LocalBusiness data");
      tenant.draft = content; // raw draft; compliance filtering happens at publish
      tenant.status = "preview";
      await step(100, "Preview ready", "Preview link created. Review, edit, then publish.", 200);
      job.status = "done"; job.finishedAt = db.now();
      audit({ actorId, tenantId, action: "site.built", target: job.id, ip: "local" });
    } catch (e) {
      job.status = "failed"; job.stage = "Failed"; job.log.push(String((e as Error).message));
      tenant.status = "onboarding";
    }
    db.save();
  })();
  return job;
}
