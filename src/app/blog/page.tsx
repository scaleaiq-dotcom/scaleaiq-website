import type { Metadata } from "next";
import Link from "next/link";
import { adminDb } from "@/lib/firebase/admin";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — ScaleAIQ",
  description: "Insights, tutorials, and news on AI tools, automation, and digital products.",
};

interface Post {
  id: string; title: string; slug: string; category: string;
  content?: string; publishedAt?: string; createdAt?: string;
  status: string;
}

async function getPosts(): Promise<Post[]> {
  try {
    const snap = await adminDb
      .collection("posts")
      .where("status", "==", "published")
      .limit(50)
      .get();
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title ?? "",
        slug: data.slug ?? d.id,
        category: data.category ?? "General",
        content: data.content,
        publishedAt: data.publishedAt ?? data.createdAt?.toDate?.()?.toISOString() ?? null,
        status: data.status ?? "published",
      };
    });
  } catch { return []; }
}

function readTime(content = "") {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function excerpt(content = "", max = 140) {
  const plain = content.replace(/[#*`>_~\[\]]/g, "").trim();
  return plain.length > max ? plain.slice(0, max) + "…" : plain;
}

export default async function BlogPage() {
  const posts = await getPosts();
  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category)))];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BookOpen className="size-3.5" /> Blog
          </span>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
            Insights & Tutorials
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Stay ahead with guides on AI tools, automation workflows, and digital product strategies.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <BookOpen className="size-12 text-muted-foreground/20" />
            <p className="font-heading text-xl font-bold text-muted-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground">Check back soon — we're working on great content.</p>
          </div>
        ) : (
          <>
            {/* Category pills */}
            <div className="mb-8 flex flex-wrap gap-2">
              {categories.map(c => (
                <span key={c} className="cursor-pointer rounded-full border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary">
                  {c}
                </span>
              ))}
            </div>

            {/* Featured post */}
            {posts[0] && (
              <Link href={`/blog/${posts[0].slug}`}
                className="group mb-10 flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:border-primary/40 hover:shadow-lg sm:flex-row">
                <div className="flex aspect-video shrink-0 items-center justify-center bg-gradient-to-br from-violet-600 to-cyan-500 sm:aspect-auto sm:w-72 lg:w-96">
                  <BookOpen className="size-16 text-white/40" />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-3 p-6 lg:p-8">
                  <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {posts[0].category}
                  </span>
                  <h2 className="font-heading text-2xl font-bold leading-snug transition-colors group-hover:text-primary">
                    {posts[0].title}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {excerpt(posts[0].content)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {posts[0].publishedAt ? new Date(posts[0].publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {readTime(posts[0].content)} min read
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                    Read article <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            )}

            {/* Grid */}
            {posts.length > 1 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.slice(1).map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:border-primary/40 hover:shadow-md">
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
                      <BookOpen className="size-8 text-muted-foreground/30" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2.5 p-5">
                      <span className="w-fit rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        {post.category}
                      </span>
                      <h3 className="font-heading text-base font-bold leading-snug transition-colors group-hover:text-primary line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="flex-1 text-sm text-muted-foreground line-clamp-3">
                        {excerpt(post.content)}
                      </p>
                      <div className="flex items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {readTime(post.content)} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
