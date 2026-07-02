"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase/client");
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      // Don't reveal whether the email exists — show success either way,
      // but surface real problems (bad email format, network).
      if (msg.includes("invalid-email")) {
        setError("That email address doesn't look valid.");
      } else if (msg.includes("network")) {
        setError("Network error — please check your connection and try again.");
      } else {
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border bg-card p-8 shadow-xl">
        {sent ? (
          <div className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
              <MailCheck className="size-7 text-emerald-500" />
            </span>
            <h1 className="mt-4 font-heading text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>,
              we&apos;ve sent a password reset link. It may take a minute — check spam too.
            </p>
            <Link
              href="/sign-in"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-3.5" /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Reset your password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your account email and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

              <Button type="submit" className="w-full font-semibold" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Remembered it?{" "}
              <Link href="/sign-in" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
