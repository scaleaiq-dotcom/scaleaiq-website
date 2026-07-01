import Link from "next/link";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons/social";

const WHATSAPP_GROUP = "https://chat.whatsapp.com/BcQlNPZ5Wkg0FyO5fLcQxH";

const socialLinks = [
  { icon: InstagramIcon, href: "https://www.instagram.com/aishiksha01/", label: "Instagram", color: "hover:text-pink-500" },
  { icon: WhatsAppIcon, href: WHATSAPP_GROUP, label: "WhatsApp Community", color: "hover:text-green-500" },
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { title: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {siteConfig.description}
            </p>

            {/* Social icons */}
            <div className="mt-4 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`flex size-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors ${color}`}
                >
                  <Icon className="size-4" />
                </Link>
              ))}
            </div>

            {/* Join community */}
            <Button
              className="mt-4 gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
              size="sm"
              nativeButton={false}
              render={
                <Link href={WHATSAPP_GROUP} target="_blank" rel="noopener noreferrer" />
              }
            >
              <WhatsAppIcon className="size-4" />
              Join Our Community
            </Button>
          </div>

          <FooterColumn title="Quick Links" links={siteConfig.footerNav.quickLinks} />
          <FooterColumn title="Categories" links={siteConfig.footerNav.categories} />
          <FooterColumn title="Support" links={siteConfig.footerNav.support} />

          {/* Contact */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h3 className="mb-3 text-sm font-semibold">Get in Touch</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Questions? Chat with us on WhatsApp or email us directly.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={WHATSAPP_GROUP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:border-green-400 hover:text-green-600"
              >
                <WhatsAppIcon className="size-4 text-green-500" />
                WhatsApp Community
              </Link>
              <Link
                href="mailto:scaleaiq@gmail.com"
                className="inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                ✉️ scaleaiq@gmail.com
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Secure payments · UPI · Cards · Netbanking</p>
        </div>
      </div>
    </footer>
  );
}
