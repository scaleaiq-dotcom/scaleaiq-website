import { Quote } from "lucide-react";

import { testimonials } from "@/lib/mock-data";

export function Testimonials() {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h2 className="text-section-title font-heading">Loved by Learners</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Join thousands of students and creators growing with ScaleAIQ.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
            className="flex flex-col rounded-2xl border bg-card p-6"
          >
            <Quote className="size-7 text-brand-violet" />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                {t.initials}
              </span>
              <span>
                <span className="block text-sm font-semibold">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
