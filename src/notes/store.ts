import { getNotesDb } from "./db";
import { DiscardedNote, Note, NoteError, NoteInput, PAGE_SIZE, sameNote, validId } from "./model";

const COLLECTION = "experiment-notes";
const TRASH = "experiment-notes-trash";

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
    const discarded = await transaction.get(db.collection(TRASH).doc(input.id));
    if (discarded.exists) throw new NoteError(409, "このノートはくずかごにあります。戻す場合は、くずかごから復元してください。");
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
    let snapshot = await collection.doc(cursor).get();
    // A loaded page's last note may have been discarded before the next page is requested.
    if (!snapshot.exists) snapshot = await getNotesDb().collection(TRASH).doc(cursor).get();
    if (!snapshot.exists) throw new NoteError(400, "ページが見つかりません。一覧を再読み込みしてください。");
    query = query.startAfter(snapshot.data()!.createdAt, cursor);
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

// Moving both copies in one transaction keeps a failed request from losing the note.
export async function discardNote(id: string): Promise<DiscardedNote> {
  if (!validId(id)) throw new NoteError(400, "ノートの指定が無効です。");
  const db = getNotesDb();
  const published = db.collection(COLLECTION).doc(id);
  const trash = db.collection(TRASH).doc(id);
  return db.runTransaction(async transaction => {
    const original = await transaction.get(published);
    const previous = await transaction.get(trash);
    if (!original.exists) {
      if (previous.exists) return previous.data() as DiscardedNote; // Retrying preserves the original discard time.
      throw new NoteError(404, "ノートが見つかりません。");
    }
    if (previous.exists) throw new NoteError(409, "ノートの状態が変わりました。画面を読み込み直してください。");
    const note = { ...original.data(), discardedAt: new Date().toISOString() } as DiscardedNote;
    transaction.create(trash, note);
    transaction.delete(published);
    return note;
  });
}

export async function restoreNote(id: string): Promise<Note> {
  if (!validId(id)) throw new NoteError(400, "ノートの指定が無効です。");
  const db = getNotesDb();
  const published = db.collection(COLLECTION).doc(id);
  const trash = db.collection(TRASH).doc(id);
  return db.runTransaction(async transaction => {
    const original = await transaction.get(published);
    const discarded = await transaction.get(trash);
    if (!discarded.exists) {
      if (original.exists) return original.data() as Note;
      throw new NoteError(404, "くずかごにノートが見つかりません。");
    }
    if (original.exists) throw new NoteError(409, "ノートの状態が変わりました。画面を読み込み直してください。");
    const { discardedAt: _discardedAt, ...note } = discarded.data() as DiscardedNote;
    transaction.create(published, note);
    transaction.delete(trash);
    return note;
  });
}

export async function listDiscardedNotes(cursor?: string | null) {
  let query = getNotesDb().collection(TRASH).orderBy("discardedAt", "desc").orderBy("__name__", "desc").limit(PAGE_SIZE + 1);
  if (cursor) {
    try {
      if (cursor.length > 256) throw new Error();
      const { id, discardedAt } = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
      if (!validId(id) || typeof discardedAt !== "string" || new Date(discardedAt).toISOString() !== discardedAt) throw new Error();
      // Values remain usable after a note on the previous page has been restored.
      query = query.startAfter(discardedAt, id);
    } catch { throw new NoteError(400, "ページの指定が無効です。"); }
  }
  const snapshot = await query.get();
  const notes = snapshot.docs.slice(0, PAGE_SIZE).map(doc => doc.data() as DiscardedNote);
  const last = notes[notes.length - 1];
  const nextCursor = snapshot.size > PAGE_SIZE ? Buffer.from(JSON.stringify({ id: last.id, discardedAt: last.discardedAt })).toString("base64url") : null;
  return { notes, nextCursor };
}
