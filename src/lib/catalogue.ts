import type { Plan, Profession, Theme, ThemeManifest, Layout, Style, Feature, StepDef, Coupon } from "./types";

export const PROFESSIONS: Record<Profession, { label: string; plural: string; blurb: string; icon: string }> = {
  dentist: {
    label: "Dentist",
    plural: "Dentists & dental clinics",
    blurb: "Clinic sites built around trust and easy appointments.",
    icon: "🦷",
  },
  lawyer: {
    label: "Lawyer",
    plural: "Advocates & law firms",
    blurb: "Informational sites compliant with Bar Council rules by default.",
    icon: "⚖️",
  },
  institute: {
    label: "Institute",
    plural: "Schools, coaching & training",
    blurb: "Admission-focused sites with courses, batches and results.",
    icon: "🎓",
  },
  realestate: {
    label: "Real estate",
    plural: "Developers & brokers",
    blurb: "Lead-generation sites with RERA details built in.",
    icon: "🏢",
  },
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceINR: 4999,
    billing: "Theme fee + yearly hosting",
    includes: ["Hosting + SSL", "1 custom domain", "Up to 8 pages", "Contact form & leads inbox", "5 GB media"],
  },
  {
    id: "growth",
    name: "Growth",
    priceINR: 9999,
    billing: "Theme fee + yearly hosting",
    includes: ["Everything in Starter", "Blog", "WhatsApp chat widget", "GA4 / Meta Pixel / GTM", "SEO tools", "2 editors", "20 GB media"],
  },
  {
    id: "managed",
    name: "Managed",
    priceINR: 24999,
    billing: "Yearly (monthly available)",
    includes: ["Everything in Growth", "4X team does onboarding", "Copywriting", "Monthly content updates", "Priority support"],
  },
];

export const COUPONS: Coupon[] = [
  { code: "LAUNCH20", kind: "percent", value: 20, expiresAt: "2027-03-31", usageLimit: 500, used: 0 },
  { code: "FLAT1000", kind: "flat", value: 1000, expiresAt: "2027-03-31", usageLimit: 100, used: 0 },
];

// ---------- Form step definitions (PRD §5.1, §5.2) ----------

const TREATMENTS = [
  "Root canal (RCT)", "Dental implants", "Clear aligners", "Braces", "Teeth whitening", "Veneers", "Crowns & bridges",
  "Extraction", "Wisdom tooth removal", "Scaling & polishing", "Paediatric dentistry", "Dentures", "Gum treatment", "Smile design",
];
const PRACTICE_AREAS = [
  "Civil", "Criminal", "Family & matrimonial", "Property", "Corporate & commercial", "Startup advisory", "Tax", "Labour & employment",
  "Consumer disputes", "Cheque bounce (NI Act)", "Arbitration", "Intellectual property", "Cyber law", "Real estate / RERA",
];
const COURTS = ["Supreme Court of India", "Bombay High Court", "District & Sessions Court, Thane", "NCLT", "Consumer Forum", "Family Court", "RERA Authority", "Tribunals"];
const LANGUAGES = ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Kannada", "Bengali", "Urdu"];

export const STEP_LIBRARY: Record<string, StepDef> = {
  brand: {
    id: "brand",
    title: "Brand",
    description: "Your business name and logo appear on every page.",
    fields: [
      { key: "brand.name", label: "Business name", type: "text", required: true, max: 60, placeholder: "e.g. Parasnath Dental Clinic" },
      { key: "brand.tagline", label: "Tagline", type: "text", max: 90, placeholder: "One line about what you do", aiAssist: true },
      { key: "brand.logo", label: "Logo", type: "image", help: "PNG, JPG, SVG or WebP · max 5 MB · at least 200 px wide", ratio: "logo" },
      { key: "brand.color", label: "Brand colour", type: "text", help: "Optional. Leave blank to use the theme's colour.", placeholder: "#1747d4" },
    ],
  },
  about: {
    id: "about",
    title: "About us",
    fields: [
      { key: "about.intro", label: "Short intro (homepage)", type: "textarea", required: true, max: 220, aiAssist: true },
      { key: "about.full", label: "Full about text", type: "richtext", required: true, max: 1500, aiAssist: true },
      { key: "about.foundedYear", label: "Founding year", type: "number", placeholder: "2012" },
      { key: "about.teamSize", label: "Team size", type: "text", placeholder: "e.g. 6 doctors and 4 staff" },
      { key: "about.mission", label: "Mission", type: "textarea", max: 200 },
    ],
  },
  services: {
    id: "services",
    title: "Services",
    description: "Add 1 to 20 services. Each becomes a card on your site.",
    fields: [
      {
        key: "services",
        label: "Services",
        type: "repeater",
        required: true,
        min: 1,
        max: 20,
        fields: [
          { key: "name", label: "Name", type: "text", required: true, max: 50 },
          { key: "description", label: "Short description", type: "textarea", required: true, max: 160, aiAssist: true },
          { key: "price", label: "Price (optional)", type: "text", max: 30 },
          { key: "duration", label: "Duration (optional)", type: "text", max: 30 },
        ],
      },
    ],
  },
  team: {
    id: "team",
    title: "Team",
    description: "Optional. Add doctors, partners, faculty or agents.",
    fields: [
      {
        key: "team",
        label: "Team members",
        type: "repeater",
        max: 20,
        fields: [
          { key: "name", label: "Name", type: "text", required: true, max: 50 },
          { key: "role", label: "Role", type: "text", required: true, max: 60 },
          { key: "qualification", label: "Qualification", type: "text", max: 80 },
          { key: "bio", label: "Short bio", type: "textarea", max: 240, aiAssist: true },
          { key: "photo", label: "Photo", type: "image", ratio: "1:1" },
        ],
      },
    ],
  },
  photos: {
    id: "photos",
    title: "Photos",
    fields: [
      { key: "photos.hero", label: "Hero image", type: "image", ratio: "16:9", help: "JPG, PNG, WebP or HEIC · max 10 MB" },
      { key: "photos.gallery", label: "Gallery", type: "images", max: 12 },
    ],
  },
  contact: {
    id: "contact",
    title: "Contact",
    fields: [
      { key: "contact.phone", label: "Phone", type: "phone", required: true, placeholder: "+91 98XXXXXXXX" },
      { key: "contact.whatsapp", label: "WhatsApp number", type: "phone", required: true },
      { key: "contact.email", label: "Email", type: "email", required: true },
      { key: "contact.address", label: "Address", type: "textarea", required: true, max: 240 },
      { key: "contact.mapsLink", label: "Google Maps link", type: "url" },
      { key: "contact.hours", label: "Working hours", type: "text", required: true, placeholder: "Mon–Sat 10am–8pm" },
    ],
  },
  social: {
    id: "social",
    title: "Social & SEO",
    fields: [
      { key: "social.instagram", label: "Instagram", type: "url" },
      { key: "social.facebook", label: "Facebook", type: "url" },
      { key: "social.youtube", label: "YouTube", type: "url" },
      { key: "social.linkedin", label: "LinkedIn", type: "url" },
      { key: "social.gbp", label: "Google Business Profile link", type: "url" },
      { key: "social.city", label: "Target city / area", type: "text", placeholder: "Navi Mumbai", required: true },
    ],
  },
  faq: {
    id: "faq",
    title: "FAQ",
    description: "Optional. Common questions visitors ask.",
    fields: [
      {
        key: "faq",
        label: "Questions",
        type: "repeater",
        max: 10,
        fields: [
          { key: "q", label: "Question", type: "text", required: true, max: 120 },
          { key: "a", label: "Answer", type: "textarea", required: true, max: 400, aiAssist: true },
        ],
      },
    ],
  },
  dentist: {
    id: "dentist",
    title: "Clinic details",
    fields: [
      { key: "dentist.qualifications", label: "Doctor qualifications", type: "text", required: true, placeholder: "BDS, MDS (Orthodontics)" },
      { key: "dentist.registrationNumber", label: "Dental Council registration no.", type: "text", required: true },
      { key: "dentist.treatments", label: "Treatments offered", type: "multiselect", options: TREATMENTS, required: true },
      { key: "dentist.timings", label: "Clinic timings", type: "textarea", required: true, placeholder: "Mon–Sat: 10:00–13:30, 17:00–21:00\nSun: Closed" },
      { key: "dentist.appointmentPreference", label: "Appointment preference", type: "select", options: ["Call", "WhatsApp", "Booking form"], required: true },
      {
        key: "dentist.branches",
        label: "Branches",
        type: "repeater",
        max: 10,
        fields: [
          { key: "name", label: "Branch name", type: "text", required: true },
          { key: "address", label: "Address", type: "textarea", required: true },
          { key: "phone", label: "Phone", type: "phone", required: true },
          { key: "timings", label: "Timings", type: "text" },
        ],
      },
      { key: "dentist.beforeAfterConsent", label: "I have written patient consent for every before/after photo I upload", type: "checkbox" },
    ],
  },
  lawyer: {
    id: "lawyer",
    title: "Practice details",
    fields: [
      { key: "lawyer.enrolment", label: "Bar Council enrolment no.", type: "text", required: true, placeholder: "MAH/1234/2015" },
      { key: "lawyer.practiceAreas", label: "Practice areas", type: "multiselect", options: PRACTICE_AREAS, required: true },
      { key: "lawyer.courts", label: "Courts practised in", type: "multiselect", options: COURTS, required: true },
      { key: "lawyer.languages", label: "Languages", type: "multiselect", options: LANGUAGES, required: true },
      { key: "lawyer.chamberAddress", label: "Chamber address", type: "textarea", required: true },
      { key: "lawyer.consultationMode", label: "Consultation mode", type: "select", options: ["In person", "Video call", "Phone", "In person or video"], required: true },
    ],
  },
  institute: {
    id: "institute",
    title: "Courses & batches",
    fields: [
      {
        key: "institute.courses",
        label: "Courses",
        type: "repeater",
        required: true,
        min: 1,
        max: 30,
        fields: [
          { key: "name", label: "Course name", type: "text", required: true },
          { key: "duration", label: "Duration", type: "text", required: true, placeholder: "6 months" },
          { key: "mode", label: "Mode", type: "select", options: ["Classroom", "Online", "Hybrid"], required: true },
          { key: "eligibility", label: "Eligibility", type: "text" },
          { key: "fees", label: "Fees (optional)", type: "text" },
          { key: "description", label: "Description", type: "textarea", max: 240, aiAssist: true },
        ],
      },
      {
        key: "institute.batches",
        label: "Upcoming batches",
        type: "repeater",
        max: 20,
        fields: [
          { key: "course", label: "Course", type: "text", required: true },
          { key: "startDate", label: "Start date", type: "text", required: true, placeholder: "2026-10-05" },
          { key: "timing", label: "Timing", type: "text" },
        ],
      },
      {
        key: "institute.achievements",
        label: "Results & achievements",
        type: "repeater",
        max: 20,
        help: "Every claim needs a year and a source (PRD §11).",
        fields: [
          { key: "text", label: "Achievement", type: "text", required: true },
          { key: "year", label: "Year", type: "text", required: true },
          { key: "source", label: "Source", type: "text", required: true, placeholder: "Board result sheet / internal records" },
        ],
      },
      { key: "institute.affiliations", label: "Affiliations", type: "text" },
      { key: "institute.placementPartners", label: "Placement partners", type: "text", help: "Comma separated" },
    ],
  },
  realestate: {
    id: "realestate",
    title: "RERA & listings",
    fields: [
      { key: "realestate.rera", label: "RERA registration no. (agent or developer)", type: "text", required: true, placeholder: "A51700000123" },
      { key: "realestate.agentDetails", label: "Agent / developer details", type: "textarea", max: 240 },
      {
        key: "realestate.listings",
        label: "Projects / listings",
        type: "repeater",
        required: true,
        min: 1,
        max: 50,
        fields: [
          { key: "title", label: "Title", type: "text", required: true },
          { key: "type", label: "Type", type: "select", options: ["Apartment", "Villa", "Plot", "Office", "Shop", "Warehouse", "Penthouse"], required: true },
          { key: "bhk", label: "BHK / configuration", type: "text" },
          { key: "carpetArea", label: "Carpet area", type: "text", placeholder: "650–980 sq ft" },
          { key: "priceRange", label: "Price range", type: "text", required: true, placeholder: "₹85 L – ₹1.4 Cr" },
          { key: "location", label: "Location", type: "text", required: true },
          { key: "amenities", label: "Amenities", type: "text" },
          { key: "possession", label: "Possession", type: "text" },
          { key: "reraNumber", label: "Project RERA no.", type: "text", required: true, help: "Listing will not publish without it." },
          { key: "image", label: "Image", type: "image", ratio: "4:3" },
        ],
      },
    ],
  },
  review: { id: "review", title: "Review", fields: [] },
};

// ---------- Theme catalogue (PRD §10) ----------

const COMMON_STEPS = ["brand", "about", "services", "team", "photos", "contact", "social", "faq"];

function manifest(profession: Profession, extraPages: { slug: string; name: string; sections: string[] }[] = []): ThemeManifest {
  const homeSections: Record<Profession, string[]> = {
    dentist: ["hero", "trust", "services", "team", "gallery", "faq", "contact"],
    lawyer: ["hero", "practice", "profile", "courts", "faq", "contact"],
    institute: ["hero", "courses", "batches", "achievements", "team", "gallery", "faq", "contact"],
    realestate: ["hero", "listings", "amenities", "about", "gallery", "faq", "contact"],
  };
  const servicePage: Record<Profession, { slug: string; name: string }> = {
    dentist: { slug: "treatments", name: "Treatments" },
    lawyer: { slug: "practice-areas", name: "Practice areas" },
    institute: { slug: "courses", name: "Courses" },
    realestate: { slug: "projects", name: "Projects" },
  };
  return {
    pages: [
      { slug: "home", name: "Home", sections: homeSections[profession] },
      { slug: "about", name: "About", sections: ["about", "team", "contact"] },
      { slug: servicePage[profession].slug, name: servicePage[profession].name, sections: ["services", "faq", "contact"] },
      { slug: "contact", name: "Contact", sections: ["contact"] },
      ...extraPages,
    ],
    steps: [...COMMON_STEPS, profession, "review"],
    fonts: ["Schibsted Grotesk", "Inter", "Source Serif 4", "DM Sans"],
    headerVariants: ["standard", "centered", "minimal"],
  };
}

type Seed = [id: string, name: string, forWhom: string, layout: Layout, accent: string, style: Style, features: Feature[], price: number, highlights: string[], featured?: boolean];

const SEEDS: Record<Profession, Seed[]> = {
  dentist: [
    ["D1", "Enamel", "Single-doctor clinics that want a calm, clinical look", "split", "#1c7ed6", "minimal", ["booking"], 5999, ["Doctor-first hero with credentials", "Treatment cards with duration", "Sticky 'Book appointment' bar on mobile"], true],
    ["D2", "Smile Studio", "Cosmetic dentistry — whitening, veneers, smile design", "full", "#0ca5b0", "premium", ["booking", "gallery"], 7999, ["Full-width photo hero", "Consent-gated before/after slider", "Treatment price-range cards"]],
    ["D3", "Little Teeth", "Family and paediatric dental clinics", "center", "#f59f00", "friendly", ["booking"], 5999, ["Friendly rounded style", "'Your child's first visit' guide", "Parent FAQ block"]],
    ["D4", "Align Pro", "Orthodontists — braces and clear aligners", "split", "#5f3dc4", "premium", ["booking"], 6999, ["Treatment journey timeline", "Braces vs aligners comparison", "EMI information block"]],
    ["D5", "Dental Hospital", "Multi-branch and multi-speciality dental hospitals", "grid", "#1747d4", "minimal", ["booking", "branches"], 8999, ["Branch finder with maps", "Specialist directory", "Per-branch timings and contacts"]],
  ],
  lawyer: [
    ["L1", "Chambers", "Senior advocates wanting a classic, dignified presence", "classic", "#7a5c1e", "premium", [], 6999, ["Traditional serif typography", "Enrolment and court details", "Mandatory disclaimer gate"], true],
    ["L2", "Counsel", "Independent advocates and young practices", "split", "#1747d4", "minimal", [], 4999, ["Clean profile-led homepage", "Practice area pages", "Consultation enquiry form"]],
    ["L3", "Partners", "Multi-partner law firms", "center", "#0b3d6e", "premium", ["blog"], 7999, ["Partner and associate directory", "Office locations", "Publications and articles"]],
    ["L4", "Corporate Desk", "Corporate, startup, tax and compliance practices", "full", "#12355b", "minimal", ["blog", "brochure"], 7999, ["Service-area grid", "Legal updates blog", "Downloadable firm profile"]],
    ["L5", "Family Counsel", "Family, matrimonial and property matters", "center", "#2b8a3e", "friendly", [], 4999, ["Warm, approachable tone", "Plain-language guides", "Confidential enquiry form"]],
  ],
  institute: [
    ["I1", "Campus", "Schools and colleges", "full", "#1747d4", "premium", ["courses", "gallery", "blog"], 8999, ["Campus photo hero", "Admissions page with steps", "Notices and events board"], true],
    ["I2", "Rank Up", "Competitive exam coaching — JEE, NEET, CA, UPSC", "split", "#e03131", "minimal", ["courses", "booking"], 6999, ["Results and toppers wall", "Upcoming batch countdown", "Demo class booking"]],
    ["I3", "SkillLab", "IT, SAP and professional skill training", "grid", "#1098ad", "minimal", ["courses", "brochure"], 6999, ["Course catalogue with filters", "Syllabus PDF per course", "Placement partners strip"]],
    ["I4", "Lingua", "Language and communication academies", "center", "#9c36b5", "friendly", ["courses"], 4999, ["Level-based course ladder", "Online and offline modes", "Free assessment form"]],
    ["I5", "Bright Minds", "Kids activity, arts, music and abacus centres", "center", "#f76707", "friendly", ["courses", "gallery"], 4999, ["Playful illustrated sections", "Age-group programmes", "Parent enquiry and trial class"]],
  ],
  realestate: [
    ["R1", "Skyline", "Single-project launch microsites for developers", "full", "#0b3d91", "premium", ["listings", "brochure", "gallery"], 9999, ["Cinematic project hero", "Configurations and price table", "Brochure download with lead capture"], true],
    ["R2", "Broker Hub", "Brokers and channel partners with many listings", "grid", "#1747d4", "minimal", ["listings"], 7999, ["Search and filter listings", "Buy / rent / resale tabs", "Per-listing WhatsApp enquiry"]],
    ["R3", "Luxe Estates", "Premium villas, penthouses and second homes", "classic", "#8d6e2f", "premium", ["listings", "gallery"], 9999, ["Editorial, image-led layout", "Virtual tour embed", "Private viewing request"]],
    ["R4", "Plotline", "Plotted developments and farmland", "split", "#2f9e44", "friendly", ["listings", "booking"], 6999, ["Layout map with plot status", "Location advantages", "Site-visit scheduling"]],
    ["R5", "Commercial Spaces", "Offices, shops and warehouses for lease or sale", "grid", "#495057", "minimal", ["listings", "brochure"], 7999, ["Lease / sale listings with area filters", "Location and connectivity block", "Enquiry per unit"]],
  ],
};

const TAGLINES: Record<Profession, string> = {
  dentist: "Healthy smiles, gentle care.",
  lawyer: "Clear counsel. Considered advice.",
  institute: "Learn with purpose.",
  realestate: "Find the address you deserve.",
};

export const THEMES: Theme[] = (Object.keys(SEEDS) as Profession[]).flatMap((profession) =>
  SEEDS[profession].map(([id, name, forWhom, layout, accent, style, features, priceINR, highlights, featured]) => ({
    id,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    profession,
    tagline: TAGLINES[profession],
    forWhom,
    layout,
    accent,
    style,
    features,
    priceINR,
    highlights,
    featured: !!featured,
    version: "1.0.0",
    manifest: manifest(profession),
    status: "published" as const,
  })),
);

export function getTheme(slugOrId: string): Theme | undefined {
  return THEMES.find((t) => t.slug === slugOrId || t.id === slugOrId);
}

export function themesFor(profession?: Profession) {
  return profession ? THEMES.filter((t) => t.profession === profession) : THEMES;
}

export const GST_RATE = 0.18;

export function priceBreakdown(themeFee: number, plan: Plan, coupon?: Coupon | null) {
  const hostingFee = plan.priceINR;
  const gross = themeFee + hostingFee;
  let discount = 0;
  if (coupon) discount = coupon.kind === "percent" ? Math.round((gross * coupon.value) / 100) : Math.min(coupon.value, gross);
  const subtotal = gross - discount;
  const gst = Math.round(subtotal * GST_RATE);
  return { themeFee, hostingFee, discount, subtotal, gst, total: subtotal + gst };
}

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
