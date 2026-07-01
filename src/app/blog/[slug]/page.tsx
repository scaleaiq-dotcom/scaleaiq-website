import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDb } from "@/lib/firebase/admin";
import { Calendar, Clock, ArrowLeft, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getPost(slug: string) {
  try {
    const snap = await adminDb.collection("posts").where("slug", "==", slug).limit(1).get();
    if (snap.empty) return null;
    const d = snap.docs[0];
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? "",
      slug: data.slug ?? slug,
      category: data.category ?? "General",
      content: data.content ?? "",
      publishedAt: data.publishedAt ?? data.createdAt?.toDate?.()?.toISOString() ?? null,
      status: data.status ?? "published",
    };
  } catch { return null; }
}

function readTime(content = "") {
  return Math.max(1, Math.round(content.trim().split(/\s+/).length / 200));
}

function renderMarkdown(md: string) {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="font-heading text-lg font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="font-heading text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="font-heading text-2xl font-bold mt-8 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-muted-foreground">')
    .replace(/\n/g, '<br/>');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found — ScaleAIQ" };
  return {
    title: `${post.title} — ScaleAIQ Blog`,
    description: post.content?.slice(0, 160).replace(/[#*`]/g, ""),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post || post.status !== "published") notFound();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <section className="border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 py-12">
          <Link href="/blog"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5" /> Back to Blog
          </Link>
          <div className="mx-auto max-w-2xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {post.category}
            </span>
            <h1 className="mt-3 font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {readTime(post.content)} min read
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-2xl">
          {/* Thumbnail placeholder */}
          <div className="mb-8 flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border">
            <BookOpen className="size-16 text-muted-foreground/20" />
          </div>

          <article
            className="prose-sm max-w-none leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: `<p class="mb-4 leading-relaxed text-muted-foreground">${renderMarkdown(post.content)}</p>`
            }}
          />

          {/* Footer */}
          <div className="mt-12 border-t pt-8">
            <Link href="/blog"
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
              <ArrowLeft className="size-4" /> More Articles
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
