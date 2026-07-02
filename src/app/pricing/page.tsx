import { redirect } from "next/navigation";

// Subscription plans are not offered yet — the pricing page is retired.
// Old links land on the marketplace instead.
export default function PricingRedirect() {
  redirect("/explore");
}
