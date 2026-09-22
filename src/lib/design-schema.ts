import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const optHex = hex.optional().or(z.literal(""));
export const sectionStyleSchema = z.object({
  bg: z.enum(["none", "wash", "accent", "dark", "custom"]).optional(),
  bgColor: optHex, textColor: optHex,
  align: z.enum(["left", "center", "right"]).optional(),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  padding: z.enum(["none", "sm", "md", "lg", "xl"]).optional(),
  width: z.enum(["narrow", "normal", "wide", "full"]).optional(),
  imagePosition: z.enum(["left", "right"]).optional(),
  imageAspect: z.enum(["auto", "21:9", "16:9", "4:3", "3:2", "1:1", "3:4"]).optional(),
  imageShape: z.enum(["square", "rounded", "circle", "soft"]).optional(),
  headingSize: z.enum(["sm", "md", "lg", "xl"]).optional(),
  bodySize: z.enum(["sm", "md", "lg"]).optional(),
  cardStyle: z.enum(["flat", "outline", "shadow", "filled"]).optional(),
  gap: z.enum(["sm", "md", "lg"]).optional(),
  divider: z.boolean().optional(),
}).strict();

export const slotStyleSchema = z.object({
  fontSize: z.number().min(8).max(160).optional(),
  fontWeight: z.union([z.literal(300), z.literal(400), z.literal(500), z.literal(600), z.literal(700), z.literal(800), z.literal(900)]).optional(),
  lineHeight: z.number().min(0.8).max(3).optional(),
  letterSpacing: z.number().min(-0.1).max(0.5).optional(),
  color: optHex,
  align: z.enum(["left", "center", "right"]).optional(),
  italic: z.boolean().optional(), uppercase: z.boolean().optional(), underline: z.boolean().optional(),
  maxWidth: z.number().min(80).max(2000).optional(),
  width: z.number().min(8).max(2000).optional(),
  height: z.number().min(8).max(2000).optional(),
  widthUnit: z.enum(["px", "%"]).optional(),
  objectFit: z.enum(["cover", "contain"]).optional(),
  focalX: z.number().min(0).max(100).optional(), focalY: z.number().min(0).max(100).optional(),
  radius: z.number().min(0).max(500).optional(),
  shadow: z.enum(["none", "sm", "md", "lg"]).optional(),
  opacity: z.number().min(0).max(100).optional(),
  rotate: z.number().min(-180).max(180).optional(),
  offsetX: z.number().min(-500).max(500).optional(), offsetY: z.number().min(-500).max(500).optional(),
  marginTop: z.number().min(-200).max(400).optional(), marginBottom: z.number().min(-200).max(400).optional(),
  hidden: z.boolean().optional(),
}).strict();

/** Everything the visual editor can change. Tracking + custom CSS are handled separately (plan-gated). */
export const visualDesignSchema = z.object({
  accent: hex.optional(),
  font: z.string().max(40).optional(),
  headerVariant: z.string().max(20).optional(),
  buttonStyle: z.enum(["rounded", "pill", "square"]).optional(),
  colors: z.object({ background: optHex, text: optHex, heading: optHex, wash: optHex, secondary: optHex, footerBg: optHex }).partial().optional(),
  typography: z.object({ headingFont: z.string().max(40).optional(), bodyFont: z.string().max(40).optional(), baseSize: z.number().min(12).max(22).optional(), headingScale: z.number().min(0.6).max(1.8).optional(), headingWeight: z.union([z.literal(500), z.literal(600), z.literal(700), z.literal(800), z.literal(900)]).optional(), letterSpacing: z.number().min(-0.08).max(0.2).optional(), lineHeight: z.number().min(1.1).max(2.2).optional() }).partial().optional(),
  shape: z.object({ radius: z.number().min(0).max(48).optional(), imageShape: z.enum(["square", "rounded", "circle", "soft"]).optional(), cardStyle: z.enum(["flat", "outline", "shadow", "filled"]).optional(), buttonSize: z.enum(["sm", "md", "lg"]).optional(), buttonWeight: z.union([z.literal(500), z.literal(600), z.literal(700)]).optional() }).partial().optional(),
  spacing: z.object({ section: z.enum(["compact", "normal", "spacious"]).optional(), container: z.enum(["narrow", "normal", "wide", "full"]).optional(), gap: z.enum(["sm", "md", "lg"]).optional() }).partial().optional(),
  header: z.object({ sticky: z.boolean().optional(), transparent: z.boolean().optional(), logoSize: z.number().min(20).max(96).optional(), showCta: z.boolean().optional(), ctaText: z.string().max(30).optional() }).partial().optional(),
  sectionStyles: z.record(z.string().max(60), sectionStyleSchema).optional(),
  slotStyles: z.record(z.string().max(80), slotStyleSchema).optional(),
  sectionOrder: z.record(z.string().max(40), z.array(z.string().max(40)).max(30)).optional(),
});
export type VisualDesign = z.infer<typeof visualDesignSchema>;
