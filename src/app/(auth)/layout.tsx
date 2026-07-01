import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-background via-accent/20 to-background px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(123,61,255,0.08),transparent_60%)]" />
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <div className="relative size-9 overflow-hidden rounded-xl shadow-md ring-1 ring-white/10">
          <Image src="/brand/logo-mark.png" alt="ScaleAIQ" width={36} height={36} className="size-full object-cover" />
        </div>
        <span className="font-heading text-xl font-extrabold tracking-tight">
          Scale<span className="text-brand-gradient">AIQ</span>
        </span>
      </Link>
      {children}
    </div>
  );
}
