import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySessionCached } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

const REVIEWERS = [
  { name: "Ravi Sharma",    avatar: "RS" },
  { name: "Priya Mehta",    avatar: "PM" },
  { name: "Ankit Patel",    avatar: "AP" },
  { name: "Sneha Joshi",    avatar: "SJ" },
  { name: "Mohit Verma",    avatar: "MV" },
  { name: "Kavya Nair",     avatar: "KN" },
  { name: "Deepak Singh",   avatar: "DS" },
  { name: "Pooja Agarwal",  avatar: "PA" },
  { name: "Rahul Gupta",    avatar: "RG" },
  { name: "Nisha Reddy",    avatar: "NR" },
  { name: "Vikram Yadav",   avatar: "VY" },
  { name: "Meera Iyer",     avatar: "MI" },
  { name: "Suresh Kumar",   avatar: "SK" },
  { name: "Aarti Bhatia",   avatar: "AB" },
  { name: "Kiran Malhotra", avatar: "KM" },
  { name: "Tarun Saxena",   avatar: "TS" },
  { name: "Divya Kapoor",   avatar: "DK" },
  { name: "Sanjay Mishra",  avatar: "SM" },
  { name: "Rekha Chauhan",  avatar: "RC" },
  { name: "Nikhil Jain",    avatar: "NJ" },
  { name: "Swati Pandey",   avatar: "SP" },
  { name: "Arjun Tiwari",   avatar: "AT" },
  { name: "Ritu Singh",     avatar: "RS" },
  { name: "Gaurav Shah",    avatar: "GS" },
];

const COMMENTS_5 = [
  "Exactly what I needed. Saved me so much time. Highly recommend!",
  "Wow, this is genuinely useful. Already applied it to my business.",
  "Best purchase this week. Quality is top notch and delivery was instant.",
  "Superb! Simple to use and very professional. Worth every rupee.",
  "Loved it! Shared it with my team as well. Will buy more products from here.",
  "Excellent quality. Did not expect this level of detail at this price.",
  "Very impressed. Everything worked perfectly right out of the box.",
  "Amazing product. Got exactly what was promised. 100% satisfied.",
];

const COMMENTS_4 = [
  "Really good product. A few minor things could be improved but overall great.",
  "Very helpful. Clear and easy to use. Would buy again.",
  "Good value for money. Does what it says. Satisfied with the purchase.",
  "Useful content. Instructions are straightforward. Minor improvements would make it perfect.",
  "Solid product. Delivery was instant and everything works as expected.",
  "Happy with this purchase. Good quality and well organized.",
  "Decent product. Could have more examples but the core content is solid.",
  "Works well. Simple and effective. Good for beginners and intermediate users.",
];

const COMMENTS_3 = [
  "Average product. Covers the basics but expected a bit more depth.",
  "Good for starting out but advanced users may need more resources.",
  "Okay product. Got what was described. Nothing extraordinary but useful.",
  "Decent content. A few more updates would make it a 5-star product.",
];

// Pick N unique items from array starting at offset
function pick<T>(arr: T[], count: number, offset: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(arr[(offset + i) % arr.length]);
  }
  return result;
}

// Recent timestamp: within last 1–6 days
function recentDate(maxDaysAgo: number): Date {
  const d = new Date();
  const hoursAgo = Math.floor(Math.random() * maxDaysAgo * 24) + 2;
  d.setHours(d.getHours() - hoursAgo);
  return d;
}

export async function POST(req: NextRequest) {
  const session = await verifySessionCached(req.cookies.get("session")?.value);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const productsSnap = await adminDb
      .collection("products")
      .where("status", "==", "published")
      .get();

    if (productsSnap.empty) {
      return NextResponse.json({ message: "No published products found." });
    }

    let seeded = 0;

    for (let pi = 0; pi < productsSnap.docs.length; pi++) {
      const productDoc = productsSnap.docs[pi];
      const productId = productDoc.id;

      const existingSnap = await adminDb
        .collection("products").doc(productId)
        .collection("reviews").limit(1).get();
      if (!existingSnap.empty) continue;

      // Each product gets 4 unique reviewers offset by product index
      const reviewers = pick(REVIEWERS, 4, pi * 4);

      // Rating pattern: 5, 4, 4, 3 — feels natural, avg ~4.0
      const ratings = [5, 4, 4, 3];

      // Offset comments per product so different products get different text
      const c5 = pick(COMMENTS_5, 1, pi);
      const c4a = pick(COMMENTS_4, 1, pi * 2);
      const c4b = pick(COMMENTS_4, 1, pi * 2 + 1);
      const c3 = pick(COMMENTS_3, 1, pi);

      const comments = [c5[0], c4a[0], c4b[0], c3[0]];

      const batch = adminDb.batch();
      let totalRating = 0;

      for (let ri = 0; ri < 4; ri++) {
        const ref = adminDb
          .collection("products").doc(productId)
          .collection("reviews").doc();

        batch.set(ref, {
          name: reviewers[ri].name,
          avatar: reviewers[ri].avatar,
          rating: ratings[ri],
          comment: comments[ri],
          helpful: Math.floor(Math.random() * 6),
          verified: true,
          createdAt: recentDate(6),
          userId: "seeded",
        });

        totalRating += ratings[ri];
      }

      const avgRating = Math.round((totalRating / 4) * 10) / 10;

      const productRef = adminDb.collection("products").doc(productId);
      batch.update(productRef, {
        rating: avgRating,
        ratingCount: 4,
        downloadCount: FieldValue.increment(Math.floor(Math.random() * 12) + 4),
      });

      await batch.commit();
      seeded++;
    }

    return NextResponse.json({ success: true, seeded, skipped: productsSnap.docs.length - seeded });
  } catch (err) {
    console.error("seed-reviews error:", err);
    return NextResponse.json({ error: "Failed to seed reviews" }, { status: 500 });
  }
}
