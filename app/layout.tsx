import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { getStoreSettings } from "@/lib/actions";

export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getStoreSettings();
    return {
      title: {
        default: settings.metaTitle || settings.storeName || "Online Store",
        template: `%s | ${settings.storeName || "Online Store"}`,
      },
      description: settings.metaDescription || settings.tagline || "Shop our collection",
      icons: settings.faviconUrl ? { icon: settings.faviconUrl } : {},
      openGraph: {
        type: "website",
        siteName: settings.storeName || "Online Store",
        title: settings.metaTitle || settings.storeName || "Online Store",
        description: settings.metaDescription || settings.tagline || "",
      },
    };
  } catch {
    return {
      title: "SiteReady Ecommerce",
      description: "Fastest way to launch your business through WhatsApp",
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
