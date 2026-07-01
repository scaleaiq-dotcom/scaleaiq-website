import type { Metadata } from "next";
export const metadata: Metadata = { title: "Achievements — ScaleAIQ" };

const badges = [
  { icon: "🎯", title: "First Purchase",   desc: "Make your first purchase",     locked: true },
  { icon: "🎓", title: "Course Completer", desc: "Complete your first course",    locked: true },
  { icon: "⭐", title: "Reviewer",         desc: "Leave your first review",       locked: true },
  { icon: "🔥", title: "Power Learner",    desc: "Complete 5 courses",            locked: true },
  { icon: "💎", title: "Premium Member",   desc: "Subscribe to a tool",           locked: true },
  { icon: "🚀", title: "Early Adopter",    desc: "Join ScaleAIQ in the first 100", locked: true },
];

export default function AchievementsPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-heading text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="font-heading text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Badges</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="font-heading text-3xl font-bold">1</p>
            <p className="text-xs text-muted-foreground">Level</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map(badge => (
          <div key={badge.title} className={`rounded-xl border p-4 text-center ${badge.locked ? "opacity-40 grayscale" : ""}`}>
            <p className="text-3xl">{badge.icon}</p>
            <p className="mt-2 text-sm font-semibold">{badge.title}</p>
            <p className="text-xs text-muted-foreground">{badge.desc}</p>
            {badge.locked && <p className="mt-1 text-[10px] text-muted-foreground">🔒 Locked</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
