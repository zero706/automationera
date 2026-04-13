import type { Metadata } from "next";
import "@/styles/globals.css";
import { ToastViewport } from "@/components/ui/Toast";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://leadhuntr.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "LeadHuntr — Reddit Lead Finder for SaaS Founders",
    template: "%s · LeadHuntr",
  },
  description:
    "LeadHuntr monitors Reddit 24/7 and finds people actively looking for tools like yours. AI-scored leads delivered to your dashboard.",
  keywords: [
    "reddit leads",
    "lead generation",
    "saas prospecting",
    "b2b leads",
    "reddit monitoring",
  ],
  openGraph: {
    type: "website",
    title: "LeadHuntr — Reddit Lead Finder for SaaS Founders",
    description:
      "Stop scrolling Reddit. Start closing deals. AI-scored leads from Reddit, delivered 24/7.",
    url: APP_URL,
    siteName: "LeadHuntr",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadHuntr — Reddit Lead Finder",
    description:
      "AI-scored Reddit leads for SaaS founders and solopreneurs.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
