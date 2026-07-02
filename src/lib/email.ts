/**
 * Transactional email via Resend's REST API (no SDK dependency).
 * Fails soft: email problems must never break an order or claim.
 *
 * FROM address: set EMAIL_FROM (e.g. "ScaleAIQ <orders@scaleaiq.in>") once your
 * domain is verified in Resend. Until then the test sender is used, which can
 * only deliver to the Resend account owner's own email.
 */

const FROM = process.env.EMAIL_FROM ?? "ScaleAIQ <onboarding@resend.dev>";

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !opts.to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [opts.to], subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) console.error("Email send failed:", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.scaleaiq.in";

function shell(content: string): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#eef4ff;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;padding:16px 0;">
      <span style="font-size:22px;font-weight:800;color:#0a0f1f;">Scale<span style="color:#7b3dff;">AIQ</span></span>
    </div>
    <div style="background:#ffffff;border-radius:14px;padding:28px;border:1px solid #e5e7eb;">
      ${content}
    </div>
    <p style="text-align:center;color:#6b7280;font-size:11px;margin-top:16px;">
      © ScaleAIQ · <a href="${APP_URL}" style="color:#7b3dff;text-decoration:none;">www.scaleaiq.in</a><br/>
      Questions? Reply to this email or write to scaleaiq@gmail.com
    </p>
  </div>
</body></html>`;
}

export interface ReceiptItem { title: string; price: number }
export interface ReceiptFile { title: string; url: string }

export function orderReceiptHtml(opts: {
  name: string;
  orderId: string;
  items: ReceiptItem[];
  total: number;
  isFree: boolean;
  files: ReceiptFile[];
  externalUrl?: string;
}): string {
  const rows = opts.items.map(i => `
    <tr>
      <td style="padding:8px 0;color:#111827;font-size:14px;">${i.title}</td>
      <td style="padding:8px 0;color:#111827;font-size:14px;text-align:right;">${i.price === 0 ? "FREE" : `₹${i.price.toLocaleString("en-IN")}`}</td>
    </tr>`).join("");

  const fileButtons = opts.files.map(f => `
    <a href="${f.url}" style="display:block;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;padding:12px 16px;margin:8px 0;color:#7b3dff;font-weight:bold;font-size:14px;text-decoration:none;">
      ⬇️ ${f.title}
    </a>`).join("");

  const appButton = opts.externalUrl ? `
    <a href="${opts.externalUrl}" style="display:block;background:#7b3dff;border-radius:10px;padding:14px 16px;margin:8px 0;color:#ffffff;font-weight:bold;font-size:14px;text-decoration:none;text-align:center;">
      Open App →
    </a>` : "";

  return shell(`
    <h1 style="margin:0 0 6px;font-size:20px;color:#0a0f1f;">${opts.isFree ? "Your free download is ready! 🎉" : "Thank you for your purchase! 🎉"}</h1>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Hi ${opts.name || "there"}, your order <strong>${opts.orderId}</strong> is confirmed.</p>

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;">
      ${rows}
      <tr>
        <td style="padding:10px 0;font-weight:bold;color:#0a0f1f;font-size:14px;">Total</td>
        <td style="padding:10px 0;font-weight:bold;color:#0a0f1f;font-size:14px;text-align:right;">${opts.total === 0 ? "FREE" : `₹${opts.total.toLocaleString("en-IN")}`}</td>
      </tr>
    </table>

    ${opts.files.length > 0 || appButton ? `
      <p style="margin:20px 0 8px;font-weight:bold;color:#0a0f1f;font-size:14px;">Your downloads</p>
      ${fileButtons}
      ${appButton}
    ` : ""}

    <p style="margin:20px 0 0;color:#6b7280;font-size:12px;">
      You can re-download anytime from <a href="${APP_URL}/dashboard/downloads" style="color:#7b3dff;">My Library</a>${opts.isFree ? " (sign in with the same account)" : ""}.
    </p>
  `);
}
