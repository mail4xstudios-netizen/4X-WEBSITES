import type { Metadata } from "next";
import { Schibsted_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sans = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-sans-var", weight: ["400", "500", "600", "700", "800"] });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif-var", weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "4XCMS Theme Store",
  description: "Pick a professionally designed website theme, pay online, fill one guided form — and get a live, fully editable website.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
