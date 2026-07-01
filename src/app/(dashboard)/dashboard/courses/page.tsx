import type { Metadata } from "next";
export const metadata: Metadata = { title: "My Courses — ScaleAIQ" };

export default function CoursesPage() {
  return (
    <div className="rounded-xl border bg-card p-12 text-center">
      <p className="text-4xl">🎓</p>
      <p className="mt-3 font-heading text-lg font-semibold">No courses yet</p>
      <p className="mt-1 text-sm text-muted-foreground">Enroll in a course and track your progress here</p>
      <a href="/category/courses" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Browse Courses</a>
    </div>
  );
}
