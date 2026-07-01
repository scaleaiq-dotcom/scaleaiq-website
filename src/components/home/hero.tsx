"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
    subtitle:
      "Learn faster with practical AI tools, premium courses, templates, prompt libraries and business resources.",
    primary: { label: "Explore Marketplace", href: "/explore" },
    secondary: { label: "Browse Categories", href: "/#categories" },
  },
  {
    image: "/brand/hero-downloads.png",
    alt: "Free digital downloads and resources",
    headline: "Start Free. Upgrade When You're Ready.",
    subtitle:
      "Download free AI prompts, templates, ebooks and learning resources. No payment required to begin.",
    primary: { label: "Free Resources", href: "/explore?price=free" },
    secondary: { label: "Explore Library", href: "/explore" },
  },
  {
    image: "/brand/hero-dashboard.png",
    alt: "AI tools and business automation",
    headline: "Build Faster with AI & Automation",
    subtitle:
      "Powerful AI tools and business automation solutions designed for students, professionals and businesses.",
    primary: { label: "Explore AI Tools", href: "/category/ai-tools" },
    secondary: { label: "View Automation", href: "/category/automation" },
  },
];

export function Hero() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      5500
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="container mx-auto px-4 pt-5">
      {/* ── MOBILE ── stacked: image on top, copy below */}
      <div className="overflow-hidden rounded-2xl border lg:hidden">
        {/* Image strip — all 3 images kept in DOM, crossfade via opacity */}
        <div className="relative h-48 w-full overflow-hidden sm:h-56">
          {slides.map((slide, i) => (
            <div
              key={slide.image}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              {/* Plain img tag — bypasses Next.js optimizer, serves directly from public/ */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ))}
          {/* fade into copy */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0a0f1f] to-transparent" />
        </div>

        {/* Copy */}
        <div className="bg-[linear-gradient(160deg,#0a0f1f_0%,#1e1060_60%,#7b3dff_100%)] px-5 pb-7 pt-4 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <h1 className="font-heading text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">
                {slides[index].headline}
              </h1>
              <p className="mt-2 text-sm text-white/80">
                {slides[index].subtitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  nativeButton={false}
                  className="gap-1.5 font-semibold"
                  render={<Link href={slides[index].primary.href} />}
                >
                  {slides[index].primary.label}{" "}
                  <ArrowRight className="size-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  nativeButton={false}
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  render={<Link href={slides[index].secondary.href} />}
                >
                  {slides[index].secondary.label}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── side by side */}
      <div className="hidden overflow-hidden rounded-2xl border lg:grid lg:min-h-[340px] lg:grid-cols-2">
        {/* Copy panel */}
        <div className="relative flex flex-col justify-center bg-[linear-gradient(160deg,#0a0f1f_0%,#1e1060_60%,#7b3dff_100%)] px-10 py-10 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight lg:text-[2.5rem]">
                {slides[index].headline}
              </h1>
              <p className="mt-3 max-w-md text-base text-white/80">
                {slides[index].subtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  nativeButton={false}
                  className="gap-2 font-semibold"
                  render={<Link href={slides[index].primary.href} />}
                >
                  {slides[index].primary.label}{" "}
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  nativeButton={false}
                  className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                  render={<Link href={slides[index].secondary.href} />}
                >
                  {slides[index].secondary.label}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Image panel — all 3 kept in DOM, crossfade */}
        <div className="relative min-h-[280px] overflow-hidden">
          {slides.map((slide, i) => (
            <div
              key={slide.image}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === index ? 1 : 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.alt}
                className="h-full w-full object-cover object-center"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
