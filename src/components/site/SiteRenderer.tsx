import type { DesignSettings, SiteContent, Theme } from "@/lib/types";
import { PROFESSIONS } from "@/lib/catalogue";
import { schemaOrg } from "@/lib/engine";
import { designCss, mergeDesign, orderedSections } from "@/lib/design-css";
import { DisclaimerGate, EditBridge, EmiCalculator, LeadForm } from "./client";

export interface RenderProps {
  theme: Theme;
  content: SiteContent;
  design: DesignSettings;
  page?: string;
  tenantId?: string; // undefined for demos → forms are simulated
  baseHref?: string; // prefix for internal page links
  mode: "demo" | "preview" | "live";
  edit?: boolean;
}

/* ----------------------------- helpers ----------------------------- */
const wa = (n: string) => `https://wa.me/${n.replace(/\D/g, "")}`;

function Section({ id, title, kicker, children, alt, slot }: { id: string; title?: string; kicker?: string; children: React.ReactNode; alt?: boolean; slot?: string }) {
  return (
    <section id={id} className={`sec px-5 sm:px-8 ${alt ? "bg-[var(--wash)]" : ""}`} data-section={id}>
      <div className="sec-inner mx-auto max-w-6xl">
        {(title || kicker) && (
          <header className="sec-head mb-8 max-w-2xl" data-slot={slot}>
            {kicker && <p className="mb-1 text-sm font-semibold uppercase tracking-wide" style={{ color: "var(--a)" }}>{kicker}</p>}
            {title && <h2 className="text-3xl font-bold tracking-tight">{title}</h2>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

/* ------------------------------ header ----------------------------- */
function Header({ theme, content, page, baseHref, design }: RenderProps) {
  const pages = theme.manifest.pages;
  const centered = design.headerVariant === "centered" || theme.layout === "classic";
  const cta = theme.profession === "dentist" ? "Book appointment" : theme.profession === "lawyer" ? "Request consultation" : theme.profession === "institute" ? "Enquire now" : "Get a callback";
  return (
    <header className={`site-header sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur ${theme.layout === "classic" ? "border-b-2" : ""}`} style={theme.layout === "classic" ? { borderColor: "var(--a)" } : undefined}>
      <div className={`mx-auto flex max-w-6xl items-center gap-6 px-5 py-3 sm:px-8 ${centered ? "flex-col gap-2 py-4 sm:flex-row sm:justify-between" : ""}`}>
        <a href={`${baseHref}`} className="flex items-center gap-2 font-bold" data-slot="brand.logo">
          {content.brand.logo ? <img src={content.brand.logo} alt={content.brand.name} className="site-logo h-9 w-auto max-w-[200px] object-contain" /> : <span className="grid h-9 w-9 place-items-center rounded-lg text-white" style={{ background: "var(--a)" }}>{content.brand.name.slice(0, 1) || "A"}</span>}
          <span data-slot="brand.name" className="text-lg">{content.brand.name}</span>
        </a>
        <nav className="hidden flex-1 items-center gap-5 text-sm font-medium text-slate-600 md:flex" style={centered ? { justifyContent: "center" } : undefined}>
          {pages.map((p) => (
            <a key={p.slug} href={`${baseHref}${p.slug === "home" ? "" : "/" + p.slug}`} className={`hover:text-[var(--a)] ${page === p.slug ? "text-[var(--a)]" : ""}`}>{p.name}</a>
          ))}
        </nav>
        <a href="#contact" className="btn header-cta hidden text-white md:inline-block" style={{ background: "var(--a)" }}>{design.header?.ctaText || cta}</a>
      </div>
    </header>
  );
}

/* ------------------------------- hero ------------------------------ */
function Hero(p: RenderProps) {
  const { theme, content } = p;
  const cta = theme.profession === "dentist" ? "Book an appointment" : theme.profession === "lawyer" ? "Request a consultation" : theme.profession === "institute" ? "Enquire about admissions" : "Get a callback";
  const trust = content.dentist?.registrationNumber ? `Reg. no. ${content.dentist.registrationNumber}` : content.lawyer?.enrolment ? `Enrolment ${content.lawyer.enrolment}` : content.realestate?.rera ? `RERA ${content.realestate.rera}` : content.about.foundedYear ? `Since ${content.about.foundedYear}` : content.social.city;
  const Text = (
    <div className="hero-text max-w-xl">
      {trust && <p className="mb-3 inline-block rounded-full bg-[var(--wash)] px-3 py-1 text-xs font-semibold" style={{ color: "var(--a)" }}>{trust}</p>}
      <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl" data-slot="brand.tagline">{content.brand.tagline || content.brand.name}</h1>
      <p className="mt-4 text-lg text-slate-600" data-slot="about.intro">{content.about.intro}</p>
      <div className="btn-row mt-6 flex flex-wrap gap-3">
        <a href="#contact" className="btn text-white" style={{ background: "var(--a)" }}>{cta}</a>
        <a href={wa(content.contact.whatsapp)} className="btn border border-slate-300 bg-white" data-slot="contact.whatsapp">WhatsApp us</a>
      </div>
    </div>
  );
  const Img = content.photos.hero ? <img src={content.photos.hero} alt="" className="img-x h-full w-full rounded-2xl object-cover" data-slot="photos.hero" /> : <div className="img-x h-full w-full rounded-2xl bg-[var(--wash)]" data-slot="photos.hero" />;

  switch (theme.layout) {
    case "full":
      return (
        <section className="relative isolate min-h-[520px] overflow-hidden text-white" data-section="hero">
          {content.photos.hero && <img src={content.photos.hero} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" data-slot="photos.hero" />}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
          <div className="sec-inner mx-auto flex min-h-[520px] max-w-6xl items-end px-5 pb-16 pt-24 sm:px-8">
            <div className="hero-text max-w-xl">
              {trust && <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/80">{trust}</p>}
              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl" data-slot="brand.tagline">{content.brand.tagline || content.brand.name}</h1>
              <p className="mt-4 text-lg text-white/85" data-slot="about.intro">{content.about.intro}</p>
              <div className="btn-row mt-6 flex flex-wrap gap-3">
                <a href="#contact" className="btn text-white" style={{ background: "var(--a)" }}>{cta}</a>
                <a href={wa(content.contact.whatsapp)} className="btn bg-white/15 text-white ring-1 ring-white/40">WhatsApp us</a>
              </div>
            </div>
          </div>
        </section>
      );
    case "center":
      return (
        <section className="sec px-5 text-center sm:px-8" data-section="hero">
          <div className="sec-inner mx-auto max-w-3xl [&>div]:mx-auto [&_h1]:mx-auto [&_.flex]:justify-center">{Text}</div>
          <div className="img-box mx-auto mt-10 aspect-[21/9] max-w-5xl">{Img}</div>
        </section>
      );
    case "grid":
      return (
        <section className="sec bg-[var(--wash)] px-5 sm:px-8" data-section="hero">
          <div className="sec-inner mx-auto max-w-6xl">
            {Text}
            <form className="mt-8 flex max-w-2xl gap-2 rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5" action="#listings">
              <input className="flex-1 rounded-lg px-3 py-2 outline-none" placeholder={theme.profession === "realestate" ? "Search by location, BHK or budget" : theme.profession === "dentist" ? "Search treatments or branches" : "Search courses"} />
              <button className="btn text-white" style={{ background: "var(--a)" }}>Search</button>
            </form>
          </div>
        </section>
      );
    case "classic":
      return (
        <section className="sec px-5 text-center sm:px-8" data-section="hero">
          <div className="sec-inner hero-text mx-auto max-w-3xl">
            <div className="mx-auto mb-6 h-px w-24" style={{ background: "var(--a)" }} />
            {trust && <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-slate-500">{trust}</p>}
            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl" data-slot="brand.tagline">{content.brand.tagline || content.brand.name}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600" data-slot="about.intro">{content.about.intro}</p>
            <div className="btn-row mt-7 flex justify-center gap-3">
              <a href="#contact" className="btn text-white" style={{ background: "var(--a)" }}>{cta}</a>
              <a href={wa(content.contact.whatsapp)} className="btn border border-slate-300">WhatsApp</a>
            </div>
            <div className="mx-auto mt-6 h-px w-24" style={{ background: "var(--a)" }} />
          </div>
          {content.photos.hero && <div className="img-box mx-auto mt-10 aspect-[21/9] max-w-5xl">{Img}</div>}
        </section>
      );
    default: // split
      return (
        <section className="sec px-5 sm:px-8" data-section="hero">
          <div className="sec-inner hero-grid mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            {Text}
            <div className="img-box aspect-[4/3]">{Img}</div>
          </div>
        </section>
      );
  }
}

/* ----------------------------- sections ---------------------------- */
function Services({ content, theme }: RenderProps) {
  if (!content.services.length) return null;
  const titles = { dentist: ["Treatments", "What we do"], lawyer: ["Practice areas", "How we can help"], institute: ["Programmes", "What we teach"], realestate: ["Services", "How we help"] }[theme.profession];
  return (
    <Section id="services" kicker={titles[1]} title={titles[0]} alt>
      <div className="sec-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {content.services.map((s, i) => (
          <article key={i} className="card-x rounded-xl border border-black/5 bg-white p-5 shadow-sm" data-slot={`services[${i}].name`}>
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg text-white" style={{ background: "var(--a)" }}>{s.name.slice(0, 1)}</div>
            <h3 className="text-lg font-bold">{s.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{s.description}</p>
            {(s.price || s.duration) && theme.profession !== "lawyer" && (
              <p className="mt-3 text-xs font-semibold text-slate-500">{[s.duration, s.price].filter(Boolean).join(" · ")}</p>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}

function Trust({ content }: RenderProps) {
  const d = content.dentist;
  if (!d) return null;
  const items = [
    ["Registered", d.registrationNumber],
    ["Qualification", d.qualifications],
    ["Appointments", d.appointmentPreference],
    ["Timings", d.timings?.split("\n")[0]],
  ].filter(([, v]) => v);
  return (
    <section className="px-5 py-8 sm:px-8" data-section="trust">
      <div className="sec-inner sec-grid card-x mx-auto grid max-w-6xl gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:grid-cols-4" data-slot="dentist.registrationNumber">
        {items.map(([k, v]) => (
          <div key={k}><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{k}</p><p className="font-semibold">{v}</p></div>
        ))}
      </div>
    </section>
  );
}

function About({ content }: RenderProps) {
  return (
    <Section id="about" kicker="About us" title={content.brand.name}>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="prose max-w-none whitespace-pre-line text-slate-700 md:col-span-2" data-slot="about.full">{content.about.full}</div>
        <aside className="grid gap-3 self-start rounded-xl bg-[var(--wash)] p-5 text-sm">
          {content.about.foundedYear && <div><b>Founded</b><br />{content.about.foundedYear}</div>}
          {content.about.teamSize && <div><b>Team</b><br />{content.about.teamSize}</div>}
          {content.about.mission && <div><b>Mission</b><br /><span data-slot="about.mission">{content.about.mission}</span></div>}
        </aside>
      </div>
    </Section>
  );
}

function Team({ content, theme }: RenderProps) {
  if (!content.team.length) return null;
  const title = { dentist: "Our doctors", lawyer: "Advocates", institute: "Faculty", realestate: "Our team" }[theme.profession];
  return (
    <Section id="team" kicker="People" title={title}>
      <div className="sec-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {content.team.map((m, i) => (
          <article key={i} className="flex gap-4" data-slot={`team[${i}].name`}>
            {m.photo ? <img src={m.photo} alt={m.name} className="h-20 w-20 flex-none rounded-full object-cover" data-slot={`team[${i}].photo`} /> : <div className="grid h-20 w-20 flex-none place-items-center rounded-full bg-[var(--wash)] text-xl font-bold" style={{ color: "var(--a)" }}>{m.name.slice(0, 1)}</div>}
            <div>
              <h3 className="font-bold">{m.name}</h3>
              <p className="text-sm" style={{ color: "var(--a)" }}>{m.role}</p>
              {m.qualification && <p className="text-xs text-slate-500">{m.qualification}</p>}
              {m.bio && <p className="mt-1 text-sm text-slate-600">{m.bio}</p>}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Gallery({ content, theme }: RenderProps) {
  if (!content.photos.gallery.length) return null;
  return (
    <Section id="gallery" kicker="Gallery" title={theme.profession === "dentist" ? "Inside the clinic" : theme.profession === "institute" ? "Campus life" : "Gallery"} alt>
      {theme.profession === "dentist" && !content.dentist?.beforeAfterConsent && (
        <p className="mb-4 text-xs text-slate-500">Before/after photos are hidden until patient consent is confirmed in the dashboard.</p>
      )}
      <div className="sec-grid grid grid-cols-2 gap-3 md:grid-cols-3" data-slot="photos.gallery">
        {content.photos.gallery.slice(0, 6).map((src, i) => <img key={i} src={src} alt="" className="img-x img-box aspect-[4/3] w-full rounded-lg object-cover" data-slot={`photos.gallery[${i}]`} />)}
      </div>
    </Section>
  );
}

function Faq({ content }: RenderProps) {
  if (!content.faq.length) return null;
  return (
    <Section id="faq" kicker="FAQ" title="Common questions">
      <div className="sec-grid grid gap-3 md:grid-cols-2">
        {content.faq.map((f, i) => (
          <details key={i} className="card-x rounded-lg border border-black/5 bg-white p-4" data-slot={`faq[${i}].q`}>
            <summary className="cursor-pointer font-semibold">{f.q}</summary>
            <p className="mt-2 text-sm text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Contact(p: RenderProps) {
  const { content, theme, tenantId } = p;
  const c = content.contact;
  const formTitle = { dentist: "Book an appointment", lawyer: "Request a consultation", institute: "Admission enquiry", realestate: "Schedule a site visit" }[theme.profession];
  const fields = theme.profession === "dentist" || theme.profession === "realestate" ? ["name", "phone", "date", "message"] : ["name", "phone", "email", "message"];
  return (
    <Section id="contact" kicker="Contact" title="Get in touch" alt>
      <div className="sec-grid grid gap-8 md:grid-cols-2">
        <div className="grid gap-4 text-sm" data-slot="contact.phone">
          <div><b>Phone</b><br /><a href={`tel:${c.phone}`} style={{ color: "var(--a)" }}>{c.phone}</a></div>
          <div><b>WhatsApp</b><br /><a href={wa(c.whatsapp)} style={{ color: "var(--a)" }}>{c.whatsapp}</a></div>
          <div><b>Email</b><br /><a href={`mailto:${c.email}`} style={{ color: "var(--a)" }}>{c.email}</a></div>
          <div><b>Address</b><br /><span className="whitespace-pre-line">{c.address}</span>{c.mapsLink && <> · <a href={c.mapsLink} style={{ color: "var(--a)" }}>Open in Maps</a></>}</div>
          <div><b>Hours</b><br />{c.hours}</div>
          {content.dentist?.timings && <div><b>Clinic timings</b><br /><span className="whitespace-pre-line">{content.dentist.timings}</span></div>}
          {c.mapsLink && (
            <iframe title="map" className="mt-2 h-48 w-full rounded-lg border-0" loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(c.address)}&output=embed`} />
          )}
        </div>
        <div className="card-x rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h3 className="mb-3 text-lg font-bold">{formTitle}</h3>
          {theme.profession === "lawyer" && <p className="mb-3 text-xs text-slate-500">This form is for scheduling a consultation only; sending it does not create an advocate–client relationship.</p>}
          <LeadForm tenantId={tenantId} form={formTitle} cta={formTitle} fields={fields} />
        </div>
      </div>
    </Section>
  );
}

/* profession-specific */
function Practice({ content }: RenderProps) {
  const l = content.lawyer;
  if (!l?.practiceAreas.length) return null;
  return (
    <Section id="practice" kicker="Practice" title="Areas of practice" alt>
      <ul className="sec-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-slot="lawyer.practiceAreas">
        {l.practiceAreas.map((a) => <li key={a} className="card-x rounded-lg border border-black/5 bg-white px-4 py-3 font-medium">{a}</li>)}
      </ul>
    </Section>
  );
}
function Profile({ content }: RenderProps) {
  const l = content.lawyer;
  if (!l) return null;
  return (
    <Section id="profile" kicker="Chamber" title="About the chamber">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="whitespace-pre-line text-slate-700 md:col-span-2" data-slot="about.full">{content.about.full}</div>
        <aside className="grid gap-3 self-start rounded-xl bg-[var(--wash)] p-5 text-sm" data-slot="lawyer.enrolment">
          <div><b>Enrolment</b><br />{l.enrolment}</div>
          <div><b>Languages</b><br />{l.languages.join(", ")}</div>
          <div><b>Consultation</b><br />{l.consultationMode}</div>
          <div><b>Chamber</b><br /><span className="whitespace-pre-line">{l.chamberAddress}</span></div>
        </aside>
      </div>
    </Section>
  );
}
function Courts({ content }: RenderProps) {
  const l = content.lawyer;
  if (!l?.courts.length) return null;
  return (
    <section className="px-5 py-8 sm:px-8" data-section="courts">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-500">Appears before</p>
        <div className="flex flex-wrap justify-center gap-2" data-slot="lawyer.courts">{l.courts.map((c) => <span key={c} className="rounded-full border px-3 py-1 text-sm">{c}</span>)}</div>
      </div>
    </section>
  );
}
function Courses({ content }: RenderProps) {
  const i = content.institute;
  if (!i?.courses.length) return null;
  return (
    <Section id="courses" kicker="Courses" title="Our courses" alt>
      <div className="sec-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {i.courses.map((c, k) => (
          <article key={k} className="card-x rounded-xl border border-black/5 bg-white p-5 shadow-sm" data-slot={`institute.courses[${k}].name`}>
            <span className="rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-semibold" style={{ color: "var(--a)" }}>{c.mode}</span>
            <h3 className="mt-2 text-lg font-bold">{c.name}</h3>
            {c.description && <p className="mt-1 text-sm text-slate-600">{c.description}</p>}
            <dl className="mt-3 grid grid-cols-2 gap-1 text-xs text-slate-600">
              <dt className="font-semibold">Duration</dt><dd>{c.duration}</dd>
              {c.eligibility && <><dt className="font-semibold">Eligibility</dt><dd>{c.eligibility}</dd></>}
              {c.fees && <><dt className="font-semibold">Fees</dt><dd>{c.fees}</dd></>}
            </dl>
          </article>
        ))}
      </div>
    </Section>
  );
}
function Batches({ content }: RenderProps) {
  const i = content.institute;
  if (!i?.batches.length) return null;
  return (
    <Section id="batches" kicker="Admissions open" title="Upcoming batches">
      <div className="overflow-x-auto rounded-xl border border-black/5">
        <table className="w-full text-sm" data-slot="institute.batches">
          <thead className="bg-[var(--wash)] text-left"><tr><th className="p-3">Course</th><th className="p-3">Starts</th><th className="p-3">Timing</th><th className="p-3"></th></tr></thead>
          <tbody>{i.batches.map((b, k) => <tr key={k} className="border-t"><td className="p-3 font-medium">{b.course}</td><td className="p-3">{b.startDate}</td><td className="p-3">{b.timing}</td><td className="p-3 text-right"><a href="#contact" className="font-semibold" style={{ color: "var(--a)" }}>Enquire →</a></td></tr>)}</tbody>
        </table>
      </div>
    </Section>
  );
}
function Achievements({ content }: RenderProps) {
  const i = content.institute;
  if (!i?.achievements.length) return null;
  return (
    <Section id="achievements" kicker="Results" title="Achievements" alt>
      <div className="sec-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-slot="institute.achievements">
        {i.achievements.map((a, k) => (
          <div key={k} className="card-x rounded-xl bg-white p-5 ring-1 ring-black/5"><p className="text-lg font-bold">{a.text}</p><p className="mt-1 text-xs text-slate-500">{a.year} · Source: {a.source}</p></div>
        ))}
      </div>
      {i.placementPartners && <p className="mt-6 text-sm text-slate-600"><b>Placement partners:</b> {i.placementPartners}</p>}
    </Section>
  );
}
function Listings({ content }: RenderProps) {
  const r = content.realestate;
  if (!r?.listings.length) return null;
  return (
    <Section id="listings" kicker="Projects" title="Featured listings" alt>
      <div className="sec-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {r.listings.map((l, k) => (
          <article key={k} className="card-x overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm" data-slot={`realestate.listings[${k}].title`}>
            {l.image ? <img src={l.image} alt="" className="img-box aspect-[4/3] w-full object-cover" data-slot={`realestate.listings[${k}].image`} /> : <div className="img-box aspect-[4/3] bg-[var(--wash)]" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2"><h3 className="text-lg font-bold">{l.title}</h3><span className="rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-semibold" style={{ color: "var(--a)" }}>{l.type}</span></div>
              <p className="text-sm text-slate-600">{l.location}{l.bhk ? ` · ${l.bhk}` : ""}{l.carpetArea ? ` · ${l.carpetArea}` : ""}</p>
              <p className="mt-2 font-bold" style={{ color: "var(--a)" }}>{l.priceRange}</p>
              {l.possession && <p className="text-xs text-slate-500">Possession: {l.possession}</p>}
              <p className="mt-2 text-[11px] text-slate-500">RERA: {l.reraNumber} · <a href="https://maharera.mahaonline.gov.in" className="underline">maharera.mahaonline.gov.in</a></p>
              <a href={wa(content.contact.whatsapp)} className="btn mt-3 inline-block text-white" style={{ background: "var(--a)" }}>Enquire on WhatsApp</a>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
function Amenities({ content }: RenderProps) {
  const r = content.realestate;
  if (!r) return null;
  return (
    <Section id="amenities" kicker="Plan your purchase" title="EMI calculator">
      <EmiCalculator />
      {r.agentDetails && <p className="mt-4 text-xs text-slate-500" data-slot="realestate.agentDetails">{r.agentDetails}</p>}
    </Section>
  );
}
function Branches({ content }: RenderProps) {
  const b = content.dentist?.branches;
  if (!b?.length) return null;
  return (
    <Section id="branches" kicker="Locations" title="Our branches">
      <div className="sec-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-slot="dentist.branches">
        {b.map((br, k) => <div key={k} className="card-x rounded-xl border border-black/5 bg-white p-5"><h3 className="font-bold">{br.name}</h3><p className="text-sm text-slate-600">{br.address}</p><p className="mt-2 text-sm"><a href={`tel:${br.phone}`} style={{ color: "var(--a)" }}>{br.phone}</a>{br.timings ? ` · ${br.timings}` : ""}</p></div>)}
      </div>
    </Section>
  );
}

const SECTIONS: Record<string, (p: RenderProps) => React.ReactNode> = {
  hero: Hero, trust: Trust, services: Services, team: Team, gallery: Gallery, faq: Faq, contact: Contact, about: About,
  practice: Practice, profile: Profile, courts: Courts, courses: Courses, batches: Batches, achievements: Achievements,
  listings: Listings, amenities: Amenities, branches: Branches,
};

function Footer({ content, theme, mode }: RenderProps) {
  return (
    <footer className="site-footer border-t border-black/5 bg-slate-900 px-5 py-10 text-sm text-slate-300 sm:px-8" data-section="footer">
      <div className="sec-inner mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
        <div><p className="text-lg font-bold text-white">{content.brand.name}</p><p className="mt-1">{content.brand.tagline}</p>
          {content.dentist?.registrationNumber && <p className="mt-2 text-xs">Dental Council Reg. {content.dentist.registrationNumber}</p>}
          {content.lawyer?.enrolment && <p className="mt-2 text-xs">Bar Council Enrolment {content.lawyer.enrolment}</p>}
          {content.realestate?.rera && <p className="mt-2 text-xs">MahaRERA {content.realestate.rera}</p>}
        </div>
        <div><p className="font-semibold text-white">Contact</p><p className="mt-1 whitespace-pre-line">{content.contact.address}</p><p>{content.contact.phone}</p><p>{content.contact.email}</p></div>
        <div><p className="font-semibold text-white">Follow</p>
          <p className="mt-1 flex flex-wrap gap-3">{Object.entries(content.social).filter(([k, v]) => v && k !== "city").map(([k, v]) => <a key={k} href={v} className="capitalize hover:text-white">{k === "gbp" ? "Google" : k}</a>)}</p>
          <p className="mt-4 text-xs text-slate-400">Privacy policy · Terms · © {new Date().getFullYear()} {content.brand.name}</p>
          {theme.profession === "lawyer" && <p className="mt-2 text-xs text-slate-400">This website is for information only and is not an advertisement or solicitation.</p>}
        </div>
      </div>
      {mode !== "live" && <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-slate-500">Built with 4XCMS · {theme.name} theme · {mode === "demo" ? "demo content" : "preview — noindex"}</p>}
    </footer>
  );
}

/* ------------------------------ renderer --------------------------- */
export function SiteRenderer(p: RenderProps) {
  const { theme, content, page = "home", mode, baseHref = "" } = p;
  const design = mergeDesign(theme, p.design);
  const props = { ...p, design, baseHref, page };
  const pageDef = theme.manifest.pages.find((x) => x.slug === page) ?? theme.manifest.pages[0];
  const hidden = content.hiddenSections?.[pageDef.slug] ?? [];
  const ordered = orderedSections(pageDef.sections, pageDef.slug, design, hidden);
  const sections = pageDef.slug === "home" ? ordered : ["pagehero", ...ordered];
  const cta = theme.profession === "dentist" ? "Book" : theme.profession === "lawyer" ? "Consult" : theme.profession === "institute" ? "Enquire" : "Callback";
  return (
    <div className={`site-root min-h-screen bg-white text-slate-900 ${theme.layout === "classic" ? "bg-[#fbfaf6]" : ""}`} data-page={pageDef.slug} data-layout={theme.layout}>
      {/* .btn display lives in Tailwind's `components` layer so utilities like `hidden md:inline-block` still win. */}
      <style>{`@layer components{.site-root .btn{display:inline-block;line-height:1.2}.edit-mode [data-slot],.edit-mode [data-section]{outline:2px dashed transparent;outline-offset:3px;transition:outline-color .15s}.edit-mode [data-slot]{cursor:pointer}.edit-mode [data-slot]:hover{outline-color:var(--a)}.edit-mode [data-section]:hover{outline-color:rgba(23,71,212,.35)}.edit-mode .sel-slot{outline-color:var(--a)!important;outline-style:solid!important}.edit-mode .sel-section{outline-color:rgba(23,71,212,.6)!important;outline-style:solid!important}}`}</style>
      <style id="design-css">{designCss(design, theme.layout)}</style>
      {design.customCss && <style id="custom-css">{design.customCss}</style>}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg(content, theme.profession, baseHref || "/")) }} />
      {mode !== "live" && <meta name="robots" content="noindex" />}
      {theme.profession === "lawyer" && mode !== "preview" && <DisclaimerGate firm={content.brand.name} />}
      <EditBridge />
      <Header {...props} />
      {sections.map((id) => {
        if (id === "pagehero") return <section key={id} className="px-5 pt-12 sm:px-8" data-section="pagehero"><div className="sec-inner mx-auto max-w-6xl"><p className="text-sm font-semibold" style={{ color: "var(--a)" }}>{content.brand.name}</p><h1 className="text-4xl font-extrabold tracking-tight">{pageDef.name}</h1></div></section>;
        const C = SECTIONS[id];
        return C ? <C key={id} {...props} /> : null;
      })}
      <Footer {...props} />
      {/* WhatsApp click-to-chat on every theme (PRD §8) + sticky mobile CTA for dentists (D1) */}
      <a href={wa(content.contact.whatsapp)} aria-label="Chat on WhatsApp" className="fixed bottom-20 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] md:bottom-5 md:right-5 text-white shadow-lg">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 5.2 5.2 0 0 0 3.2.7 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z"/></svg>
      </a>
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t bg-white p-3 md:hidden">
        <a href={`tel:${content.contact.phone}`} className="btn flex-1 border text-center">Call</a>
        <a href="#contact" className="btn flex-1 text-center text-white" style={{ background: "var(--a)" }}>{cta}</a>
      </div>
      <div className="h-16 md:hidden" />
      <p className="sr-only">{PROFESSIONS[theme.profession].label} website</p>
    </div>
  );
}
