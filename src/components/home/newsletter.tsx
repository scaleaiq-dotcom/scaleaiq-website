import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border bg-brand-gradient px-6 py-12 text-center text-white sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-xl">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/15">
            <Mail className="size-6" />
          </span>
          <h2 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
            Get Free AI Resources
          </h2>
          <p className="mt-2 text-white/85">
            Join thousands of learners and receive new AI tools, templates and
            free downloads.
          </p>
          <form
            action="#"
            className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
          >
            <Input
              type="email"
              required
              placeholder="Enter your email"
              aria-label="Email address"
              className="h-11 border-white/30 bg-white/15 text-white placeholder:text-white/70"
            />
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              className="h-11 shrink-0 font-semibold"
            >
              Join Free
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
