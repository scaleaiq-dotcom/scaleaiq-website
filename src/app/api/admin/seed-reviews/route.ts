import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { verifySessionCached } from "@/lib/admin-auth";
import { FieldValue } from "firebase-admin/firestore";

const REVIEWS_PER_PRODUCT = [
  // 4 reviews per product — mixed ratings, realistic Indian names & comments
  {
    name: "Ravi Sharma",
    avatar: "RS",
    rating: 5,
    comment: "Bahut achha product hai! Mujhe bahut kaam aaya. Highly recommended for anyone starting out.",
    helpful: 3,
    daysAgo: 12,
  },
  {
    name: "Priya Mehta",
    avatar: "PM",
    rating: 4,
    comment: "Good content overall. A few things could be explained better but worth the price.",
    helpful: 1,
    daysAgo: 8,
  },
  {
    name: "Ankit Patel",
    avatar: "AP",
    rating: 5,
    comment: "Exactly what I was looking for. Downloaded and implemented within a day. Great value!",
    helpful: 5,
    daysAgo: 20,
  },
  {
    name: "Sneha Joshi",
    avatar: "SJ",
    rating: 3,
    comment: "Decent product. Could use more detailed instructions but the core material is solid.",
    helpful: 0,
    daysAgo: 5,
  },
];

// Alternate review sets for variety across products
const REVIEW_SETS = [
  [
    { name: "Mohit Verma",    avatar: "MV", rating: 5, comment: "Superb! Saved me hours of work. The quality is top notch.",                                          helpful: 4, daysAgo: 15 },
    { name: "Kavya Nair",     avatar: "KN", rating: 4, comment: "Very useful resource. Instructions are clear and easy to follow.",                                   helpful: 2, daysAgo: 9  },
    { name: "Deepak Singh",   avatar: "DS", rating: 3, comment: "Good for beginners. Advanced users may need additional resources.",                                  helpful: 1, daysAgo: 22 },
    { name: "Pooja Agarwal",  avatar: "PA", rating: 5, comment: "Excellent purchase! I've already shared it with my friends. Totally worth it.",                      helpful: 6, daysAgo: 3  },
  ],
  [
    { name: "Rahul Gupta",    avatar: "RG", rating: 4, comment: "Really helpful. Got instant access and everything worked perfectly.",                                helpful: 3, daysAgo: 18 },
    { name: "Nisha Reddy",    avatar: "NR", rating: 5, comment: "Best purchase this month! The content quality is amazing.",                                          helpful: 7, daysAgo: 6  },
    { name: "Vikram Yadav",   avatar: "VY", rating: 4, comment: "Good product. Minor improvements could make it even better but overall satisfied.",                  helpful: 2, daysAgo: 11 },
    { name: "Meera Iyer",     avatar: "MI", rating: 3, comment: "Average. Expected a bit more content but it covers the basics well.",                                helpful: 0, daysAgo: 25 },
  ],
  [
    { name: "Suresh Kumar",   avatar: "SK", rating: 5, comment: "Wow, this is exactly what I needed. Simple, clean, and professional.",                              helpful: 5, daysAgo: 7  },
    { name: "Aarti Bhatia",   avatar: "AB", rating: 4, comment: "Very good value for money. Downloaded and used it immediately.",                                    helpful: 1, daysAgo: 14 },
    { name: "Kiran Malhotra", avatar: "KM", rating: 5, comment: "Loved it! The quality exceeded my expectations. Will buy again.",                                   helpful: 8, daysAgo: 30 },
    { name: "Tarun Saxena",   avatar: "TS", rating: 4, comment: "Solid product. Does what it promises. Customer support was also responsive.",                        helpful: 2, daysAgo: 4  },
  ],
];

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

      // Check if reviews already exist — skip if so
      const existingSnap = await adminDb
        .collection("products").doc(productId)
        .collection("reviews").limit(1).get();
      if (!existingSnap.empty) continue;

      // Pick a review set (rotate through sets)
      const reviews = pi % 2 === 0 ? REVIEWS_PER_PRODUCT : REVIEW_SETS[pi % REVIEW_SETS.length];

      const batch = adminDb.batch();
      let totalRating = 0;

      for (const r of reviews) {
        const ref = adminDb
          .collection("products").doc(productId)
          .collection("reviews").doc();

        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - r.daysAgo);

        batch.set(ref, {
          name: r.name,
          avatar: r.avatar,
          rating: r.rating,
          comment: r.comment,
          helpful: r.helpful,
          verified: true,
          createdAt,
          userId: "seeded",
        });

        totalRating += r.rating;
      }

      const avgRating = Math.round((totalRating / reviews.length) * 10) / 10;

      // Update product aggregate
      const productRef = adminDb.collection("products").doc(productId);
      batch.update(productRef, {
        rating: avgRating,
        ratingCount: reviews.length,
        downloadCount: FieldValue.increment(Math.floor(Math.random() * 15) + 5),
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
