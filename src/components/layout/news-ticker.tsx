"use client";

const MESSAGES = [
  "🎉 New free AI tools & templates every week — follow us on WhatsApp!",
  "🔥 Webseekho Pro is LIVE — Build your online store with zero coding",
  "✨ 100+ Lord Jagannath HD Images — Coming Soon, notify yourself!",
  "💡 AI Career Blueprint — Your step-by-step guide to getting an AI job",
  "🆓 Download free resources by signing up — no OTP required",
  "📚 AI (Artificial Intelligence) in Gujarati — Now FREE to download!",
];

const TEXT = MESSAGES.join("   •   ");

export function NewsTicker() {
  return (
    <div className="relative overflow-hidden bg-brand-gradient py-2 text-white">
      <div
        className="flex w-max animate-ticker whitespace-nowrap text-[11px] font-semibold tracking-wide sm:text-xs"
        style={{ animationDuration: "32s" }}
      >
        <span className="pr-16">{TEXT}</span>
        {/* Duplicate for seamless loop */}
        <span aria-hidden className="pr-16">{TEXT}</span>
      </div>
    </div>
  );
}
