import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/config/site";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

// Body font
const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Heading font
const fontHeading = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "AI tools",
    "online courses",
    "templates",
    "ChatGPT prompts",
    "eBooks",
    "digital marketplace",
    "India",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: ["/brand/hero-marketplace.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/brand/hero-marketplace.png"],
  },
  // Favicon is provided by the file convention: src/app/icon.png (brand logo mark).
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontHeading.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <WhatsAppButton />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
