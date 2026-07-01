"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type Slide = {
  image: string;
  alt: string;
  headline: string;
  subtitle: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
};

const slides: Slide[] = [
  {
    image: "/brand/hero-marketplace.png",
    alt: "AI & digital products marketplace",
    headline: "Discover AI Tools, Courses & Digital Resources",
    subtitle: "Learn faster with practical AI tools, premium courses, templates, prompt libraries and business resources.",
    primary: { label: "Explore Marketplace", href: "/explore" },
    secondary: { label: "Browse Categories", href: "/#categories" },
  },
  {
    image: "/brand/hero-downloads.png",
    alt: "Free digital downloads and resources",
    headline: "Start Free. Upgrade When You're Ready.",
    subtitle: "Download free AI prompts, templates, ebooks and learning resources. No payment required to begin.",
    primary: { label: "Free Resources", href: "/explore?price=free" },
    secondary: { label: "Explore Library", href: "/explore" },
  },
  {
    image: "/brand/hero-dashboard.png",
    alt: "AI tools and business automation",
    headline: "Build Faster with AI & Automation",
    subtitle: "Powerful AI tools and business automation solutions designed for students, professionals and businesses.",
    primary: { label: "Explore AI Tools", href: "/category/ai-tools" },
    secondary: { label: "View Automation", href: "/category/automation" },
  },
];

export function Hero() {
  const [index, setIndex] = React.useState(0);
  const [fade, setFade] = React.useState(true);

  React.useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % slides.length);
        setFade(true);
      }, 300);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <section className="container mx-auto px-4 pt-5">
      {/* ── MOBILE ── stacked: image on top, copy below */}
      <div className="overflow-hidden rounded-2xl border lg:hidden">
        <div className="relative h-36 w-full overflow-hidden sm:h-44">
          {slides.map((s, i) => (
            <div
              key={s.image}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              <Image
                src={s.image}
                alt={s.alt}
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority={i === 0}
              />
            </div>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0a0f1f] to-transparent" />
        </div>

        <div className="bg-[linear-gradient(160deg,#0a0f1f_0%,#1e1060_60%,#7b3dff_100%)] px-5 pb-7 pt-4 text-white">
          <div
            className="transition-opacity duration-300"
            style={{ opacity: fade ? 1 : 0 }}
          >
            <h1 className="font-heading text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
              {slide.headline}
            </h1>
            <p className="mt-2 text-sm text-white/80">{slide.subtitle}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                nativeButton={false}
                className="gap-1.5 font-semibold"
                render={<Link href={slide.primary.href} />}
              >
                {slide.primary.label} <ArrowRight className="size-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                render={<Link href={slide.secondary.href} />}
              >
                {slide.secondary.label}
              </Button>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFade(false); setTimeout(() => { setIndex(i); setFade(true); }, 300); }}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── side by side */}
      <div className="hidden overflow-hidden rounded-2xl border lg:grid lg:min-h-[260px] lg:grid-cols-2">
        <div className="relative flex flex-col justify-center bg-[linear-gradient(160deg,#0a0f1f_0%,#1e1060_60%,#7b3dff_100%)] px-8 py-8 text-white">
          <div
            className="transition-opacity duration-300"
            style={{ opacity: fade ? 1 : 0 }}
          >
            <h1 className="font-heading text-2xl font-extrabold leading-tight tracking-tight lg:text-[2rem]">
              {slide.headline}
            </h1>
            <p className="mt-2.5 max-w-md text-sm text-white/80">{slide.subtitle}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                size="lg"
                variant="secondary"
                nativeButton={false}
                className="gap-2 font-semibold"
                render={<Link href={slide.primary.href} />}
              >
                {slide.primary.label} <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                render={<Link href={slide.secondary.href} />}
              >
                {slide.secondary.label}
              </Button>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFade(false); setTimeout(() => { setIndex(i); setFade(true); }, 300); }}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-2 bg-white/40"}`}
              />
            ))}
          </div>
        </div>

        <div className="relative min-h-[240px] overflow-hidden">
          {slides.map((s, i) => (
            <div
              key={s.image}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              <Image
                src={s.image}
                alt={s.alt}
                fill
                sizes="50vw"
                className="object-cover object-center"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
