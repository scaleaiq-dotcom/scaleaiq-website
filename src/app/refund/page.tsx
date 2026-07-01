import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";
import Link from "next/link";

export const metadata: Metadata = { title: "Refund Policy — ScaleAIQ" };

export default function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" updated="1 July 2025">
      <Section title="Our Policy">
        Because ScaleAIQ sells digital products that are instantly accessible after purchase, we follow a strict but fair refund policy. Please read this carefully before purchasing.
      </Section>

      <Section title="When Refunds Are Granted">
        We will issue a full refund in the following cases:
        <ul className="mt-3 space-y-2">
          {[
            "The product is significantly not as described on the listing page.",
            "The download link is broken and we cannot provide a working replacement within 48 hours.",
            "You were charged twice for the same product due to a technical error.",
            "The product was purchased within the last 7 days and has not been downloaded.",
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="When Refunds Are Not Granted">
        Refunds will not be issued in the following cases:
        <ul className="mt-3 space-y-2">
          {[
            "You changed your mind after downloading the product.",
            "You purchased the wrong product — please verify before buying.",
            "The product has already been downloaded or accessed.",
            "More than 7 days have passed since purchase.",
            "The issue is with your device or software compatibility, not the product itself.",
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-rose-500" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How to Request a Refund">
        Email us at <a href="mailto:scaleaiq@gmail.com" className="text-primary hover:underline">scaleaiq@gmail.com</a> with your order ID and a description of the issue. We will respond within 48 hours. If approved, refunds are processed to your original payment method within 5–7 business days.
      </Section>

      <Section title="Contact">
        Questions about refunds? <Link href="/contact" className="text-primary hover:underline">Contact our support team</Link> or email <a href="mailto:scaleaiq@gmail.com" className="text-primary hover:underline">scaleaiq@gmail.com</a>.
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      <div className="mt-2 leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}
