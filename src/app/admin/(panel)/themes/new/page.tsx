import Link from "next/link";
import { STEP_IDS } from "@/lib/theme-admin";
import { Page } from "../../ui";
import { ThemeForm } from "../ThemeForm";

export default function NewTheme() {
  return (
    <Page title="Add theme" sub="Creates a new theme from the shared building blocks. It appears in the store as soon as it is published." aside={<Link href="/admin/themes" className="btn-secondary">← Themes</Link>}>
      <ThemeForm steps={STEP_IDS} initial={{ name: "", profession: "dentist", tagline: "", forWhom: "", description: "", layout: "split", accent: "#1747d4", style: "minimal", features: [], priceINR: 5999, highlights: [], featured: false, status: "draft", version: "1.0.0", manifest: { pages: [{ slug: "home", name: "Home", sections: ["hero", "trust", "services", "team", "gallery", "faq", "contact"] }, { slug: "about", name: "About", sections: ["about", "team", "contact"] }, { slug: "contact", name: "Contact", sections: ["contact"] }], steps: ["brand", "about", "services", "team", "photos", "contact", "social", "faq", "dentist", "review"], fonts: ["Schibsted Grotesk", "Inter"], headerVariants: ["standard", "centered", "minimal"] } }} />
    </Page>
  );
}
