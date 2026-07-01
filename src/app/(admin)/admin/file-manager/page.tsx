import type { Metadata } from "next";
export const metadata: Metadata = { title: "File Manager — Admin" };

export default function FileManagerPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">File Manager</h1>
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          + Upload File
        </button>
      </div>
      <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
        <p className="text-lg font-medium">No files uploaded</p>
        <p className="mt-1 text-sm">Upload and manage your downloadable assets here.</p>
      </div>
    </div>
  );
}
