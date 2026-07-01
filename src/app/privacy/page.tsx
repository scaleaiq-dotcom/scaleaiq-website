import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";

export const metadata: Metadata = { title: "Privacy Policy — ScaleAIQ" };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="1 July 2025">
      <Section title="1. Information We Collect">
        We collect information you provide directly — such as your name, email address, and payment details when you create an account or make a purchase. We also collect usage data such as pages visited, products viewed, and interactions with the Platform through cookies and analytics tools.
      </Section>

      <Section title="2. How We Use Your Information">
        We use your information to: process orders and deliver products; send transactional emails (receipts, access links); send promotional emails if you have opted in; improve the Platform experience; prevent fraud and ensure security; comply with legal obligations.
      </Section>

      <Section title="3. Payment Information">
        All payment transactions are processed by Razorpay. ScaleAIQ does not store your card details. Razorpay's privacy policy governs their handling of your payment information.
      </Section>

      <Section title="4. Sharing of Information">
        We do not sell your personal data. We may share your information with: payment processors (Razorpay) to complete transactions; analytics providers (e.g., Google Analytics) in anonymized form; legal authorities when required by law.
      </Section>

      <Section title="5. Cookies">
        We use essential cookies for authentication and session management, and optional analytics cookies to understand how users interact with the Platform. You can disable cookies in your browser settings, though this may affect functionality.
      </Section>

      <Section title="6. Data Retention">
        We retain your account data as long as your account is active. Purchase records are retained for 7 years for tax and legal compliance. You may request deletion of your account and personal data at any time.
      </Section>

      <Section title="7. Your Rights">
        You have the right to: access the personal data we hold about you; correct inaccurate data; request deletion of your data; opt out of marketing communications at any time; lodge a complaint with a data protection authority.
      </Section>

      <Section title="8. Security">
        We implement industry-standard security measures including SSL encryption, Firebase Authentication, and server-side session management. However, no method of transmission over the internet is 100% secure.
      </Section>

      <Section title="9. Children's Privacy">
        ScaleAIQ is not directed to children under 13. We do not knowingly collect personal information from children under 13.
      </Section>

      <Section title="10. Contact">
        For privacy-related questions or data requests, contact us at <a href="mailto:privacy@scaleaiq.in" className="text-primary hover:underline">privacy@scaleaiq.in</a>.
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
