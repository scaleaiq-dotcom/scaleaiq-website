import Link from "next/link";
import { WhatsAppIcon } from "@/components/icons/social";

const WHATSAPP_GROUP = "https://chat.whatsapp.com/BcQlNPZ5Wkg0FyO5fLcQxH";

export function WhatsAppButton() {
  return (
    <Link
      href={WHATSAPP_GROUP}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join WhatsApp Community"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-lg shadow-green-500/40 transition-all hover:scale-110 hover:shadow-xl hover:shadow-green-500/50"
    >
      <WhatsAppIcon className="size-7" />
    </Link>
  );
}
