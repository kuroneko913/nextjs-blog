import { createHash } from "node:crypto";
import { getAllPosts } from "@/src/fetch";
import { getNotesDb } from "@/src/notes/db";
import { consumeLikeBudget } from "@/src/security/likeBudget";

let cached: { result: Record<string, number>; until: number } | undefined;
export function publicSlugs() { return new Set(getAllPosts().map(post => post.slug)); }
export function validLikeSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 300 && publicSlugs().has(value);
}

export async function getLikeCounts() {
  if (cached && cached.until > Date.now()) return cached.result;
  await consumeLikeBudget("read");
  const collection = getNotesDb().collection("blog-likes");
  // Aggregate only known public articles; never download the entire likes collection.
  const entries = await Promise.all(Array.from(publicSlugs()).map(async slug => {
    const snapshot = await collection.where("article-slug", "==", slug).count().get();
    return [slug, snapshot.data().count] as const;
  }));
  const result = Object.fromEntries(entries);
  cached = { result, until: Date.now() + 60000 };
  return result;
}

export async function toggleLike(slug: string, identity: string) {
  await consumeLikeBudget("write");
  const db = getNotesDb();
  const collection = db.collection("blog-likes");
  const ref = collection.doc(createHash("sha256").update(JSON.stringify([slug, identity])).digest("hex"));
  const liked = await db.runTransaction(async tx => {
    const existing = await tx.get(ref);
    // Preserve old votes without exposing or importing the legacy IP data.
    const legacy = await tx.get(collection.where("article-slug", "==", slug).where("ip", "==", identity).limit(1));
    if (existing.exists || !legacy.empty) {
      if (existing.exists) tx.delete(ref);
      if (!legacy.empty) tx.delete(legacy.docs[0].ref);
      return false;
    }
    tx.set(ref, { "article-slug": slug });
    return true;
  });
  cached = undefined;
  return liked;
}
