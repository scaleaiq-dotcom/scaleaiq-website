import Link from "next/link";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/social";

const socialIcons = [
  { icon: FacebookIcon, href: siteConfig.social.facebook, label: "Facebook" },
  { icon: XIcon, href: siteConfig.social.twitter, label: "X" },
  { icon: InstagramIcon, href: siteConfig.social.instagram, label: "Instagram" },
  { icon: YoutubeIcon, href: siteConfig.social.youtube, label: "YouTube" },
  { icon: LinkedinIcon, href: siteConfig.social.linkedin, label: "LinkedIn" },
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
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="mt-4 flex gap-2">
              {socialIcons.map(({ icon: Icon, href, label }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  aria-label={label}
                  nativeButton={false}
                  render={<Link href={href} />}
                >
                  <Icon className="size-4" />
                </Button>
              ))}
            </div>
          </div>

          <FooterColumn title="Quick Links" links={siteConfig.footerNav.quickLinks} />
          <FooterColumn title="Categories" links={siteConfig.footerNav.categories} />
          <FooterColumn title="Support" links={siteConfig.footerNav.support} />

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <h3 className="mb-3 text-sm font-semibold">Get Free AI Resources</h3>
            <p className="mb-3 text-sm text-muted-foreground">
              Join thousands of learners and receive new AI tools, templates and
              free downloads.
            </p>
            <form className="flex gap-2" action="#">
              <Input
                type="email"
                placeholder="Enter your email"
                aria-label="Email address"
                className="h-9"
              />
              <Button type="submit" size="default">
                Join Free
              </Button>
            </form>
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
