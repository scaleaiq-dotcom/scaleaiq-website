"use client";

import * as React from "react";
import { Gift, Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, source: "landing" }),
      });
      const d = await res.json();
      if (res.ok) setDone(true);
      else setError(d.error ?? "Something went wrong. Try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border bg-brand-gradient px-6 py-12 text-center text-white sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-xl">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/15">
            <Gift className="size-6" />
          </span>
          <h2 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
            Sign Up Free — Never Miss a Free Resource
          </h2>
          <p className="mt-2 text-white/85">
            Add your name and phone number and we&apos;ll notify you whenever new
            free AI tools, templates and downloads drop.
          </p>

          {done ? (
            <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-3.5 font-semibold">
              <CheckCircle2 className="size-5" /> You&apos;re in! We&apos;ll notify you about every free resource.
            </div>
          ) : (
            <>
              <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
                <Input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  aria-label="Your name"
                  className="h-11 border-white/30 bg-white/15 text-white placeholder:text-white/70"
                />
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Phone number"
                  aria-label="Phone number"
                  className="h-11 border-white/30 bg-white/15 text-white placeholder:text-white/70"
                />
                <Button
                  type="submit"
                  size="lg"
                  variant="secondary"
                  disabled={busy}
                  className="h-11 shrink-0 font-semibold"
                >
                  {busy ? <Loader2 className="size-4 animate-spin" /> : "Join Free"}
                </Button>
              </form>
              {error && <p className="mt-2 text-sm font-medium text-amber-200">{error}</p>}
              <p className="mt-3 text-xs text-white/60">No OTP, no spam — just free resources on WhatsApp.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
