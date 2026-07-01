import { Star } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
}

export function Testimonials({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h2 className="text-section-title font-heading">What People Say</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Real reviews from our community of learners and creators.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reviews.map((r) => (
          <figure
            key={r.id}
            className="flex flex-col rounded-2xl border bg-card p-6"
          >
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`size-4 ${i <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`} />
              ))}
            </div>
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
              &ldquo;{r.comment}&rdquo;
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white">
                {r.name.charAt(0).toUpperCase()}
              </span>
              <span className="block text-sm font-semibold">{r.name}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}