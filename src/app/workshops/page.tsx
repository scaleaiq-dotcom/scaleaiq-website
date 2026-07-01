import type { Metadata } from "next";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Calendar, Clock, Users, Video, ArrowRight } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Workshops — ScaleAIQ",
  description: "Live and recorded workshops on AI tools, automation, and digital skills.",
};

interface Workshop {
  id: string; title: string; slug?: string; description: string;
  instructor: string; date?: string; duration?: string; seats?: number;
  price: number; status: "upcoming" | "live" | "recorded" | "draft";
  thumbnailUrl?: string; tags?: string[];
}

async function getWorkshops(): Promise<Workshop[]> {
  try {
    const snap = await adminDb.collection("workshops").get();
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Workshop))
      .filter(w => w.status !== "draft")
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  } catch { return []; }
}

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-amber-500/10 text-amber-600",
  live:     "bg-rose-500/10 text-rose-500",
  recorded: "bg-emerald-500/10 text-emerald-600",
};

export default async function WorkshopsPage() {
  const workshops = await getWorkshops();
  const upcoming  = workshops.filter(w => w.status === "upcoming" || w.status === "live");
  const recorded  = workshops.filter(w => w.status === "recorded");

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Video className="size-3.5" /> Workshops
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Learn Live. Build Faster.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Expert-led live workshops and on-demand recordings on AI automation, prompt engineering, and digital skills.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-14">
        {workshops.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Video className="size-12 text-muted-foreground/20" />
            <p className="font-heading text-xl font-bold text-muted-foreground">No workshops yet</p>
            <p className="text-sm text-muted-foreground">Check back soon — exciting workshops are being planned.</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section>
                <h2 className="mb-6 font-heading text-2xl font-bold">Upcoming & Live</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map(w => <WorkshopCard key={w.id} workshop={w} />)}
                </div>
              </section>
            )}
            {recorded.length > 0 && (
              <section>
                <h2 className="mb-6 font-heading text-2xl font-bold">On-Demand Recordings</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {recorded.map(w => <WorkshopCard key={w.id} workshop={w} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function WorkshopCard({ workshop: w }: { workshop: Workshop }) {
  const href = w.slug ? `/workshops/${w.slug}` : `/workshops/${w.id}`;
  return (
    <Link href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:border-primary/40 hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-violet-600/20 to-cyan-500/20">
        <Video className="size-10 text-muted-foreground/30" />
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${STATUS_STYLE[w.status] ?? "bg-muted text-muted-foreground"}`}>
          {w.status}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-heading text-base font-bold leading-snug transition-colors group-hover:text-primary line-clamp-2">
          {w.title}
        </h3>
        <p className="flex-1 text-sm text-muted-foreground line-clamp-2">{w.description}</p>

        <div className="space-y-1.5 text-xs text-muted-foreground">
          {w.instructor && (
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 shrink-0" /> {w.instructor}
            </div>
          )}
          {w.date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" />
              {new Date(w.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}
          {w.duration && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" /> {w.duration}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="font-heading text-lg font-extrabold">
            {w.price === 0 ? <span className="text-emerald-600">FREE</span> : `₹${w.price.toLocaleString("en-IN")}`}
          </span>
          <span className="flex items-center gap-1 text-sm font-semibold text-primary">
            {w.status === "recorded" ? "Watch now" : "Register"} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
