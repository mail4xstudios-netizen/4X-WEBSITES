// Core domain types for the 4XCMS Theme Store.
// Mirrors PRD §13 (data model) in a form that runs on localhost without Postgres.

export type Profession = "dentist" | "lawyer" | "institute" | "realestate";
export type Layout = "split" | "center" | "full" | "grid" | "classic";
export type Style = "minimal" | "premium" | "friendly";
export type Feature = "booking" | "listings" | "courses" | "blog" | "gallery" | "brochure" | "branches";
export type PlanId = "starter" | "growth" | "managed";

export type TenantStatus = "onboarding" | "building" | "preview" | "live" | "grace" | "suspended";

export interface Plan {
  id: PlanId;
  name: string;
  priceINR: number; // yearly hosting (excl. GST)
  billing: string;
  includes: string[];
}

/** Field types the onboarding form generator understands (PRD §5, BLD-01). */
export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "url"
  | "email"
  | "phone"
  | "select"
  | "multiselect"
  | "image"
  | "images"
  | "repeater"
  | "checkbox";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  max?: number; // max characters (text) or max items (repeater/images)
  min?: number;
  options?: string[]; // select / multiselect
  fields?: FieldDef[]; // repeater sub-fields
  ratio?: string; // image aspect ratio hint e.g. "16:9"
  aiAssist?: boolean; // "Help me write this"
}

export interface StepDef {
  id: string;
  title: string;
  description?: string;
  fields: FieldDef[];
}

export interface PageDef {
  slug: string;
  name: string;
  sections: string[];
}

/** theme.manifest.json equivalent (PRD §6). */
export interface ThemeManifest {
  pages: PageDef[];
  steps: string[]; // ids of step definitions this theme needs
  fonts: string[]; // approved font pairings
  headerVariants: string[];
}

export interface Theme {
  id: string; // D1, L2 ...
  slug: string;
  name: string;
  profession: Profession;
  tagline: string;
  forWhom: string;
  layout: Layout;
  accent: string;
  style: Style;
  features: Feature[];
  priceINR: number; // one-time theme fee (excl. GST)
  highlights: string[];
  featured?: boolean;
  version: string;
  manifest: ThemeManifest;
  status: "published" | "draft";
  /** Theme-level design defaults, editable from the admin theme designer. Merged under tenant design. */
  defaults?: Partial<DesignSettings>;
  /** Optional demo content override (admin-edited); falls back to the profession's sample content. */
  demoContent?: SiteContent;
  /** True for themes created in the admin panel (stored in the database rather than in code). */
  custom?: boolean;
  description?: string;
  updatedAt?: string;
}

// ---------- Site content (what the form produces, what the theme reads) ----------

export interface ServiceItem {
  name: string;
  description: string;
  price?: string;
  duration?: string;
  icon?: string;
}
export interface TeamMember {
  name: string;
  role: string;
  qualification?: string;
  bio?: string;
  photo?: string;
}
export interface FaqItem {
  q: string;
  a: string;
}
export interface Course {
  name: string;
  duration: string;
  mode: string;
  eligibility?: string;
  fees?: string;
  description?: string;
}
export interface Batch {
  course: string;
  startDate: string;
  timing?: string;
}
export interface Achievement {
  text: string;
  year: string;
  source: string;
}
export interface Listing {
  title: string;
  type: string;
  bhk?: string;
  carpetArea?: string;
  priceRange: string;
  location: string;
  amenities?: string;
  possession?: string;
  reraNumber: string;
  image?: string;
}
export interface Branch {
  name: string;
  address: string;
  phone: string;
  timings?: string;
}

export interface SiteContent {
  brand: { name: string; tagline: string; logo?: string; color?: string };
  about: { intro: string; full: string; foundedYear?: string; teamSize?: string; mission?: string };
  services: ServiceItem[];
  team: TeamMember[];
  photos: { hero?: string; gallery: string[] };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    mapsLink?: string;
    hours: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
    gbp?: string;
    city?: string;
  };
  faq: FaqItem[];
  dentist?: {
    registrationNumber: string;
    qualifications: string;
    treatments: string[];
    timings: string;
    appointmentPreference: string;
    branches: Branch[];
    beforeAfterConsent?: boolean;
  };
  lawyer?: {
    enrolment: string;
    practiceAreas: string[];
    courts: string[];
    languages: string[];
    chamberAddress: string;
    consultationMode: string;
  };
  institute?: {
    courses: Course[];
    batches: Batch[];
    achievements: Achievement[];
    affiliations: string;
    placementPartners: string;
  };
  realestate?: {
    rera: string;
    listings: Listing[];
    agentDetails: string;
  };
  /** Sections hidden by the owner in the editor, keyed by page slug. */
  hiddenSections?: Record<string, string[]>;
  seo?: { title?: string; description?: string };
}

/** Per-section layout controls (editor "Section" inspector). Keyed by `${page}:${sectionId}` in DesignSettings.sectionStyles. */
export interface SectionStyle {
  bg?: "none" | "wash" | "accent" | "dark" | "custom";
  bgColor?: string;
  textColor?: string;
  align?: "left" | "center" | "right";
  columns?: 1 | 2 | 3 | 4;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  width?: "narrow" | "normal" | "wide" | "full";
  imagePosition?: "left" | "right"; // split heroes / two-column sections
  imageAspect?: "auto" | "21:9" | "16:9" | "4:3" | "3:2" | "1:1" | "3:4";
  imageShape?: "square" | "rounded" | "circle" | "soft";
  headingSize?: "sm" | "md" | "lg" | "xl";
  bodySize?: "sm" | "md" | "lg";
  cardStyle?: "flat" | "outline" | "shadow" | "filled";
  gap?: "sm" | "md" | "lg";
  divider?: boolean;
}
/** Per-element overrides (editor "Element" inspector). Keyed by the element's data-slot key. */
export interface SlotStyle {
  fontSize?: number; // px
  fontWeight?: 300 | 400 | 500 | 600 | 700 | 800 | 900;
  lineHeight?: number;
  letterSpacing?: number; // em
  color?: string;
  align?: "left" | "center" | "right";
  italic?: boolean;
  uppercase?: boolean;
  underline?: boolean;
  maxWidth?: number; // px, text blocks
  width?: number; // px (images / blocks)
  height?: number; // px
  widthUnit?: "px" | "%";
  objectFit?: "cover" | "contain";
  focalX?: number; // 0-100, image focal point
  focalY?: number;
  radius?: number; // px
  shadow?: "none" | "sm" | "md" | "lg";
  opacity?: number; // 0-100
  rotate?: number; // deg
  offsetX?: number; // px translate
  offsetY?: number;
  marginTop?: number;
  marginBottom?: number;
  hidden?: boolean;
}
export interface DesignSettings {
  accent: string;
  font: string;
  headerVariant: string;
  buttonStyle: "rounded" | "pill" | "square";
  customCss?: string;
  tracking?: { ga4?: string; gtm?: string; metaPixel?: string; clarity?: string };
  // ---- extended visual controls (editor "Style" tab) ----
  colors?: { background?: string; text?: string; heading?: string; wash?: string; secondary?: string; footerBg?: string };
  typography?: { headingFont?: string; bodyFont?: string; baseSize?: number; headingScale?: number; headingWeight?: 500 | 600 | 700 | 800 | 900; letterSpacing?: number; lineHeight?: number };
  shape?: { radius?: number; imageShape?: "square" | "rounded" | "circle" | "soft"; cardStyle?: "flat" | "outline" | "shadow" | "filled"; buttonSize?: "sm" | "md" | "lg"; buttonWeight?: 500 | 600 | 700 };
  spacing?: { section?: "compact" | "normal" | "spacious"; container?: "narrow" | "normal" | "wide" | "full"; gap?: "sm" | "md" | "lg" };
  header?: { sticky?: boolean; transparent?: boolean; logoSize?: number; showCta?: boolean; ctaText?: string };
  sectionStyles?: Record<string, SectionStyle>;
  slotStyles?: Record<string, SlotStyle>;
  sectionOrder?: Record<string, string[]>; // page → ordered section ids (overrides manifest order)
}

// ---------- Commerce & tenancy ----------

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash?: string; // scrypt; absent for accounts created by an admin/editor invite until they set one
  createdAt: string;
  lastLoginAt?: string;
  disabled?: boolean;
}
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "superadmin" | "manager";
  createdAt: string;
  lastLoginAt?: string;
}
/** Database session (PRD §15): httpOnly cookie holds only this id. */
export interface Session {
  id: string;
  kind: "user" | "admin";
  subjectId: string; // userId or adminId
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  userAgent: string;
  ip: string;
}
export interface Membership {
  userId: string;
  tenantId: string;
  role: "owner" | "editor" | "manager";
}
export interface Tenant {
  id: string;
  slug: string;
  name: string;
  profession: Profession;
  status: TenantStatus;
  planId: PlanId;
  themeId: string;
  themeVersion: string;
  expiresAt: string;
  createdAt: string;
  design: DesignSettings;
  draft: SiteContent | null;
  published: SiteContent | null;
  publishedVersionId?: string;
}
export interface SiteVersion {
  id: string;
  tenantId: string;
  snapshot: SiteContent;
  design: DesignSettings;
  createdBy: string;
  createdAt: string;
  note?: string;
}
export interface Order {
  id: string;
  tenantId?: string;
  userId: string;
  themeId: string;
  planId: PlanId;
  themeFee: number;
  hostingFee: number;
  discount: number;
  subtotal: number;
  gst: number;
  total: number;
  gstin?: string;
  coupon?: string;
  status: "created" | "paid" | "failed" | "refunded";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  invoiceNumber?: string;
  createdAt: string;
  paidAt?: string;
}
export interface Coupon {
  code: string;
  kind: "percent" | "flat";
  value: number;
  expiresAt: string;
  usageLimit: number;
  used: number;
  themeId?: string;
}
export interface WebhookEvent {
  id: string;
  provider: "razorpay";
  eventId: string;
  type: string;
  payloadHash: string;
  processedAt: string;
  outcome: string;
}
export interface Lead {
  id: string;
  tenantId: string;
  form: string;
  fields: Record<string, string>;
  status: "new" | "contacted" | "closed";
  notes: string;
  ipHash: string;
  createdAt: string;
}
export interface Domain {
  tenantId: string;
  hostname: string;
  verificationToken: string;
  verifiedAt?: string;
  sslStatus: "pending" | "issued" | "error";
}
export interface OnboardingDraft {
  tenantId: string;
  step: number;
  answers: Record<string, unknown>;
  updatedAt: string;
}
export interface BuildJob {
  id: string;
  tenantId: string;
  progress: number;
  stage: string;
  log: string[];
  status: "queued" | "running" | "done" | "failed";
  startedAt: string;
  finishedAt?: string;
}
export interface AuditEntry {
  id: string;
  actorId: string;
  tenantId?: string;
  action: string;
  target?: string;
  ip: string;
  createdAt: string;
}
export interface MediaItem {
  id: string;
  tenantId: string;
  filename: string;
  mime: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string;
  altText?: string;
}
