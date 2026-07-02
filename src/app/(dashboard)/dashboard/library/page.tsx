import { redirect } from "next/navigation";

// "My Library" lives at /dashboard/downloads (real data: claims + purchases).
// This route only keeps older links working.
export default function LibraryRedirect() {
  redirect("/dashboard/downloads");
}
