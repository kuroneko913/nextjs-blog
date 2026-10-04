import { getNotesDb } from "@/src/notes/db";

export class LikeLimitError extends Error {}
const limits = { read: { minute: 60, day: 3000 }, write: { minute: 30, day: 500 } };
// Fast rejection per worker; Firestore transactions enforce shared limits across workers.
const blockedUntil = new Map<string, number>();
export async function consumeLikeBudget(kind: "read" | "write", now = Date.now()) {
  if ((blockedUntil.get(kind) || 0) > now) throw new LikeLimitError();
  const minute = Math.floor(now / 60000);
  const day = Math.floor(now / 86400000);
  const ref = getNotesDb().collection("blog-like-private").doc(`budget-${kind}`);
  const allowed = await getNotesDb().runTransaction(async tx => {
    const data = (await tx.get(ref)).data();
    const minuteCount = data?.minute === minute ? data.minuteCount : 0;
    const dayCount = data?.day === day ? data.dayCount : 0;
    if (minuteCount >= limits[kind].minute || dayCount >= limits[kind].day) return false;
    tx.set(ref, { minute, day, minuteCount: minuteCount + 1, dayCount: dayCount + 1 });
    return true;
  });
  if (!allowed) {
    blockedUntil.set(kind, (minute + 1) * 60000);
    throw new LikeLimitError();
  }
}
