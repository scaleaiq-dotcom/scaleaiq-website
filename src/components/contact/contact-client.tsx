"use client";

import * as React from "react";
import { CheckCircle2 } from "lucide-react";

const SUBJECTS = [
  "General Enquiry",
  "Product Support",
  "Partnership / Collaboration",
  "Billing / Refund",
  "Report an Issue",
  "Other",
];

export function ContactClient() {
  const [form, setForm] = React.useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [sent, setSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.message) return;
    const text = `Hi ScaleAIQ Team! 👋\n\nName: ${form.name}\nEmail: ${form.email || "Not provided"}\nSubject: ${form.subject}\n\n${form.message}`;
    window.open(`https://wa.me/917990368493?text=${encodeURIComponent(text)}`, "_blank");
    setSent(true);
    setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card py-16 text-center">
        <CheckCircle2 className="size-14 text-emerald-500" />
        <div>
          <p className="font-heading text-xl font-bold">Opening WhatsApp...</p>
          <p className="mt-2 text-sm text-muted-foreground">Your message is ready. Complete sending it on WhatsApp to connect with us.</p>
        </div>
        <button onClick={() => setSent(false)}
          className="cursor-pointer rounded-xl border px-5 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-card p-6 lg:p-8">
      <h2 className="font-heading text-xl font-bold">Send a Message</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Your Name <span className="text-rose-500">*</span></label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Rahul Sharma"
            className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email Address <span className="text-rose-500">*</span></label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="you@example.com"
            className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Subject</label>
        <select value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
          className="h-10 w-full cursor-pointer rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30">
          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Message <span className="text-rose-500">*</span></label>
        <textarea rows={6} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          placeholder="Tell us how we can help…"
          className="w-full resize-none rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      <button type="submit" disabled={!form.name || !form.message}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
        {"Send via WhatsApp"}
      </button>
    </form>
  );
}
