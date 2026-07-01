"use client";

import * as React from "react";
import { Star, CheckCircle2 } from "lucide-react";

export function ReviewForm() {
  const [form, setForm] = React.useState({ name: "", rating: 5, comment: "" });
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");
  const [hovered, setHovered] = React.useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.comment) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-8 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <p className="font-semibold">Thank you for your review!</p>
        <p className="text-sm text-muted-foreground">It will appear here after approval.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-6 space-y-4">
      <h3 className="font-heading text-lg font-bold">Share Your Experience</h3>

      {/* Star rating */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setForm(p => ({ ...p, rating: star }))}
              className="cursor-pointer transition-transform hover:scale-110"
            >
              <Star
                className={`size-7 ${star <= (hovered || form.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Your Name <span className="text-rose-500">*</span></label>
        <input
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          placeholder="Rahul Sharma"
          className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Your Review <span className="text-rose-500">*</span></label>
        <textarea
          rows={3}
          value={form.comment}
          onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
          placeholder="Tell others about your experience with ScaleAIQ..."
          className="w-full resize-none rounded-xl border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || !form.name || !form.comment}
        className="w-full cursor-pointer rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
