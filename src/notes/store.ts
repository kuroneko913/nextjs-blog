import { getNotesDb } from "./db";
import { Note, NoteError, NoteInput, PAGE_SIZE, sameNote, validId } from "./model";

const COLLECTION = "experiment-notes";

export async function saveNote(input: NoteInput): Promise<{ note: Note; created: boolean }> {
  const db = getNotesDb();
  const ref = db.collection(COLLECTION).doc(input.id);
  return db.runTransaction(async transaction => {
    const existing = await transaction.get(ref);
    if (existing.exists) {
      const note = existing.data() as Note;
      if (!sameNote(note, input)) throw new NoteError(409, "このノートはすでに公開済みです。一覧を確認し、続きは新しいノートに残してください。");
      return { note, created: false };
    }
    const note = { ...input, createdAt: new Date().toISOString() };
    transaction.create(ref, note);
    return { note, created: true };
  });
}

export async function listNotes(cursor?: string | null): Promise<{ notes: Note[]; nextCursor: string | null }> {
  const collection = getNotesDb().collection(COLLECTION);
  let query = collection.orderBy("createdAt", "desc").orderBy("__name__", "desc").limit(PAGE_SIZE + 1);
  if (cursor) {
    if (!validId(cursor)) throw new NoteError(400, "ページの指定が無効です。");
    const snapshot = await collection.doc(cursor).get();
    if (!snapshot.exists) throw new NoteError(400, "ページが見つかりません。一覧を再読み込みしてください。");
    query = query.startAfter(snapshot);
  }
  const snapshot = await query.get();
  const notes = snapshot.docs.slice(0, PAGE_SIZE).map(doc => doc.data() as Note);
  return { notes, nextCursor: snapshot.size > PAGE_SIZE ? notes[notes.length - 1].id : null };
}

export async function getNote(id: string): Promise<Note | null> {
  if (!validId(id)) return null;
  const snapshot = await getNotesDb().collection(COLLECTION).doc(id).get();
  return snapshot.exists ? snapshot.data() as Note : null;
}
