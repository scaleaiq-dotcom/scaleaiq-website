import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = { title: "Terms of Use — ScaleAIQ" };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Use" updated="1 July 2025">
      <Section title="1. Acceptance of Terms">
        By accessing or using ScaleAIQ (&quot;the Platform&quot;), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Platform.
      </Section>

      <Section title="2. Use of the Platform">
        ScaleAIQ is an online marketplace offering digital products including AI tools, courses, templates, prompt packs, eBooks, and other digital resources. You must be at least 13 years old to use the Platform. By creating an account, you confirm that all information you provide is accurate and up to date.
      </Section>

      <Section title="3. Purchases & Payments">
        All purchases are processed securely through Razorpay. Prices are displayed in Indian Rupees (INR) inclusive of applicable taxes. Once a digital product is purchased and delivered, we do not offer refunds unless the product is defective or not as described (see Refund Policy).
      </Section>

      <Section title="4. Intellectual Property">
        All digital products sold on ScaleAIQ are for personal, non-commercial use unless explicitly stated otherwise. You may not resell, redistribute, or share purchased products without written permission from the creator. ScaleAIQ and its logo are trademarks of ScaleAIQ. All rights reserved.
      </Section>

      <Section title="5. User Accounts">
        You are responsible for maintaining the security of your account and password. ScaleAIQ cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You may not use another user's account without permission.
      </Section>

      <Section title="6. Prohibited Activities">
        You agree not to: use the Platform for any unlawful purpose; upload or transmit viruses or harmful code; attempt to gain unauthorized access to any part of the Platform; resell or redistribute products without authorization; use automated tools to scrape or crawl the Platform.
      </Section>

      <Section title="7. Limitation of Liability">
        ScaleAIQ is not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid for the product in question.
      </Section>

      <Section title="8. Governing Law">
        These Terms shall be governed by the laws of India. Any disputes arising shall be subject to the jurisdiction of courts in Maharashtra, India.
      </Section>

      <Section title="9. Changes to Terms">
        We reserve the right to modify these Terms at any time. Changes will be communicated via email or a notice on the Platform. Continued use after changes constitutes acceptance of the updated Terms.
      </Section>

      <Section title="10. Contact">
        For questions about these Terms, contact us at <a href="mailto:legal@scaleaiq.in" className="text-primary hover:underline">legal@scaleaiq.in</a>.
      </Section>
    </LegalLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      <p className="mt-2 leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
