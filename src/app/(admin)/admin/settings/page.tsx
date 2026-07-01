"use client";

import * as React from "react";
import {
  Settings, Store, CreditCard, Mail, Zap, Shield,
  Save, Loader2, Eye, EyeOff, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "general" | "payments" | "email" | "integrations" | "security";

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "general",      label: "General",      icon: Store,      desc: "Store name, tagline, contact info" },
  { id: "payments",     label: "Payments",     icon: CreditCard, desc: "Razorpay, UPI, bank details" },
  { id: "email",        label: "Email",        icon: Mail,       desc: "SMTP & notification templates" },
  { id: "integrations", label: "Integrations", icon: Zap,        desc: "WhatsApp, Telegram, analytics" },
  { id: "security",     label: "Security",     icon: Shield,     desc: "Admin emails, session settings" },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SaveBtn({ saving, saved }: { saving: boolean; saved: boolean }) {
  return (
    <button type="submit" disabled={saving}
      className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 active:scale-95">
      {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
      {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
    </button>
  );
}

function useSave(section: string, getData: () => object) {
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [section]: getData() }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }
  return { saving, saved, save };
}

/* ── Tab panels ──────────────────────────────────────────── */
function GeneralTab() {
  const [form, setForm] = React.useState({
    storeName: "ScaleAIQ", tagline: "India's AI & Digital Marketplace",
    email: "scaleaiq@gmail.com", phone: "", website: "https://www.scaleaiq.in",
    address: "", currency: "INR", timezone: "Asia/Kolkata",
  });
  const u = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const { saving, saved, save } = useSave("general", () => form);

  return (
    <form onSubmit={save} className="space-y-5 max-w-xl">
      <Field label="Store Name">
        <input value={form.storeName} onChange={e => u("storeName", e.target.value)}
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
      </Field>
      <Field label="Tagline" hint="Short description shown in the site header">
        <input value={form.tagline} onChange={e => u("tagline", e.target.value)}
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Support Email">
          <input type="email" value={form.email} onChange={e => u("email", e.target.value)}
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="Phone">
          <input value={form.phone} onChange={e => u("phone", e.target.value)} placeholder="+91 98765 43210"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
      </div>
      <Field label="Website URL">
        <input value={form.website} onChange={e => u("website", e.target.value)}
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
      </Field>
      <Field label="Business Address">
        <textarea value={form.address} onChange={e => u("address", e.target.value)} rows={2}
          className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="City, State, India" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Currency">
          <select value={form.currency} onChange={e => u("currency", e.target.value)}
            className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
            <option value="INR">INR — Indian Rupee</option>
            <option value="USD">USD — US Dollar</option>
          </select>
        </Field>
        <Field label="Timezone">
          <select value={form.timezone} onChange={e => u("timezone", e.target.value)}
            className="h-9 w-full cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="UTC">UTC</option>
          </select>
        </Field>
      </div>
      <div className="pt-2"><SaveBtn saving={saving} saved={saved} /></div>
    </form>
  );
}

function PaymentsTab() {
  const [showSecret, setShowSecret] = React.useState(false);
  const [form, setForm] = React.useState({
    rzpKeyId: "", rzpKeySecret: "", upiId: "", bankName: "", bankAccount: "", bankIfsc: "",
  });
  const u = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const { saving, saved, save } = useSave("payments", () => form);

  return (
    <form onSubmit={save} className="space-y-6 max-w-xl">
      <div className="rounded-xl border p-5 space-y-4">
        <h3 className="font-heading text-sm font-semibold">Razorpay</h3>
        <Field label="Key ID" hint="Starts with rzp_live_ or rzp_test_">
          <input value={form.rzpKeyId} onChange={e => u("rzpKeyId", e.target.value)}
            placeholder="rzp_live_xxxxxxxxxxxx"
            className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="Key Secret">
          <div className="relative">
            <input type={showSecret ? "text" : "password"} value={form.rzpKeySecret}
              onChange={e => u("rzpKeySecret", e.target.value)} placeholder="••••••••••••••••"
              className="h-9 w-full rounded-lg border bg-background px-3 pr-10 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <button type="button" onClick={() => setShowSecret(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground">
              {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
      </div>

      <div className="rounded-xl border p-5 space-y-4">
        <h3 className="font-heading text-sm font-semibold">UPI</h3>
        <Field label="UPI ID" hint="e.g. scaleaiq@upi">
          <input value={form.upiId} onChange={e => u("upiId", e.target.value)} placeholder="yourname@upi"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
      </div>

      <div className="rounded-xl border p-5 space-y-4">
        <h3 className="font-heading text-sm font-semibold">Bank Transfer</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Bank Name">
            <input value={form.bankName} onChange={e => u("bankName", e.target.value)} placeholder="HDFC Bank"
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
          <Field label="IFSC Code">
            <input value={form.bankIfsc} onChange={e => u("bankIfsc", e.target.value)} placeholder="HDFC0001234"
              className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </Field>
        </div>
        <Field label="Account Number">
          <input value={form.bankAccount} onChange={e => u("bankAccount", e.target.value)} placeholder="••••••••••••"
            className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
      </div>
      <SaveBtn saving={saving} saved={saved} />
    </form>
  );
}

function EmailTab() {
  const [form, setForm] = React.useState({
    smtpHost: "", smtpPort: "587", smtpUser: "", smtpPass: "",
    fromName: "ScaleAIQ", fromEmail: "noreply@scaleaiq.in",
  });
  const u = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const { saving, saved, save } = useSave("email", () => form);

  return (
    <form onSubmit={save} className="space-y-5 max-w-xl">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        SMTP is used for transactional emails (order confirmations, welcome emails). Leave blank to disable.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="SMTP Host">
          <input value={form.smtpHost} onChange={e => u("smtpHost", e.target.value)} placeholder="smtp.gmail.com"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="Port">
          <input value={form.smtpPort} onChange={e => u("smtpPort", e.target.value)}
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Username / Email">
          <input value={form.smtpUser} onChange={e => u("smtpUser", e.target.value)} placeholder="you@gmail.com"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="App Password">
          <input type="password" value={form.smtpPass} onChange={e => u("smtpPass", e.target.value)} placeholder="••••••••"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="From Name">
          <input value={form.fromName} onChange={e => u("fromName", e.target.value)}
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="From Email">
          <input type="email" value={form.fromEmail} onChange={e => u("fromEmail", e.target.value)}
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
      </div>
      <SaveBtn saving={saving} saved={saved} />
    </form>
  );
}

function IntegrationsTab() {
  const [form, setForm] = React.useState({
    whatsapp: "", telegram: "", telegramBot: "", instagram: "",
    gaId: "", fbPixel: "", hotjar: "",
  });
  const u = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));
  const { saving, saved, save } = useSave("integrations", () => form);

  return (
    <form onSubmit={save} className="space-y-6 max-w-xl">
      <div className="rounded-xl border p-5 space-y-4">
        <h3 className="font-heading text-sm font-semibold">Social & Community</h3>
        <Field label="WhatsApp Group / Channel Link">
          <input value={form.whatsapp} onChange={e => u("whatsapp", e.target.value)} placeholder="https://chat.whatsapp.com/..."
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="Telegram Channel Link">
          <input value={form.telegram} onChange={e => u("telegram", e.target.value)} placeholder="https://t.me/scaleaiq"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="Telegram Bot Token" hint="For sending notifications via bot">
          <input value={form.telegramBot} onChange={e => u("telegramBot", e.target.value)} placeholder="1234567890:ABC..."
            className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="Instagram Handle">
          <input value={form.instagram} onChange={e => u("instagram", e.target.value)} placeholder="@scaleaiq"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
      </div>
      <div className="rounded-xl border p-5 space-y-4">
        <h3 className="font-heading text-sm font-semibold">Analytics & Tracking</h3>
        <Field label="Google Analytics ID">
          <input value={form.gaId} onChange={e => u("gaId", e.target.value)} placeholder="G-XXXXXXXXXX"
            className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="Facebook Pixel ID">
          <input value={form.fbPixel} onChange={e => u("fbPixel", e.target.value)} placeholder="1234567890123456"
            className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
        <Field label="Hotjar Site ID">
          <input value={form.hotjar} onChange={e => u("hotjar", e.target.value)} placeholder="1234567"
            className="h-9 w-full rounded-lg border bg-background px-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </Field>
      </div>
      <SaveBtn saving={saving} saved={saved} />
    </form>
  );
}

function SecurityTab() {
  const [adminEmails, setAdminEmails] = React.useState("scaleaiq@gmail.com\njitendramathur.85@gmail.com");
  const [sessionDays, setSessionDays] = React.useState("14");
  const { saving, saved, save } = useSave("security", () => ({ adminEmails, sessionDays }));

  return (
    <form onSubmit={save} className="space-y-5 max-w-xl">
      <Field label="Admin Emails" hint="One email per line. These accounts have full admin access.">
        <textarea value={adminEmails} onChange={e => setAdminEmails(e.target.value)} rows={4}
          className="w-full resize-none rounded-lg border bg-background px-3 py-2 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30" />
      </Field>
      <Field label="Session Duration (days)" hint="How long admin sessions stay active before requiring re-login">
        <select value={sessionDays} onChange={e => setSessionDays(e.target.value)}
          className="h-9 w-40 cursor-pointer rounded-lg border bg-background px-3 text-sm outline-none">
          <option value="1">1 day</option>
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30">30 days</option>
        </select>
      </Field>
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        Changing admin emails requires a server restart to take effect. Update your <code className="font-mono">.env.local</code> file and restart the dev server.
      </div>
      <SaveBtn saving={saving} saved={saved} />
    </form>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>("general");
  const active = TABS.find(t => t.id === tab)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Manage your store configuration and integrations.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <nav className="hidden w-52 shrink-0 space-y-1 lg:block">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors active:scale-95",
                tab === t.id ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>
              <t.icon className="size-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Mobile tab select */}
        <div className="mb-4 block lg:hidden w-full">
          <select value={tab} onChange={e => setTab(e.target.value as Tab)}
            className="h-10 w-full cursor-pointer rounded-xl border bg-background px-3 text-sm outline-none">
            {TABS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        {/* Panel */}
        <div className="flex-1 rounded-xl border bg-card p-6">
          <div className="mb-6 flex items-center gap-3 border-b pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <active.icon className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold">{active.label}</h2>
              <p className="text-xs text-muted-foreground">{active.desc}</p>
            </div>
          </div>
          {tab === "general"      && <GeneralTab />}
          {tab === "payments"     && <PaymentsTab />}
          {tab === "email"        && <EmailTab />}
          {tab === "integrations" && <IntegrationsTab />}
          {tab === "security"     && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}
