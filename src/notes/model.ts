export const MAX_BODY = 10000;
export const MAX_TITLE = 100;
export const PAGE_SIZE = 20;

export type NoteInput = { id: string; body: string; title: string; tags: string[] };
export type Note = NoteInput & { createdAt: string };

export class NoteError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function validId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function parseNote(value: unknown): NoteInput {
  if (!value || typeof value !== "object") throw new NoteError(400, "メモを入力してください。");
  const input = value as Record<string, unknown>;
  if (!validId(input.id)) throw new NoteError(400, "メモの識別子が無効です。画面を開き直してください。");
  if (typeof input.body !== "string" || !input.body.trim() || input.body.length > MAX_BODY) {
    throw new NoteError(400, `本文は1〜${MAX_BODY}文字で入力してください。`);
  }
  if (typeof input.title !== "string" || input.title.length > MAX_TITLE) throw new NoteError(400, "タイトルは100文字以内で入力してください。");
  if (!Array.isArray(input.tags) || input.tags.length > 5 || input.tags.some(tag => typeof tag !== "string" || !tag.trim() || tag.length > 30)) {
    throw new NoteError(400, "タグは各30文字以内、5個までです。");
  }
  return { id: input.id, body: input.body.trim(), title: input.title.trim(), tags: Array.from(new Set(input.tags.map(tag => tag.trim()))) };
}

export function sameNote(a: NoteInput, b: NoteInput) {
  return a.body === b.body && a.title === b.title && JSON.stringify(a.tags) === JSON.stringify(b.tags);
}

export function noteDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

export function articleDraft(notes: Note[]) {
  const ordered = [...notes].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const title = ordered.find(note => note.title)?.title || "実験メモから育てる記事";
  const tags = Array.from(new Set(ordered.flatMap(note => note.tags)));
  return `---\ntitle: ${JSON.stringify(title)}\ndate: ${JSON.stringify(new Date().toISOString())}\ndraft: true\ntags: ${JSON.stringify(tags)}\n---\n\n## 試したこと\n\n\n## わかったこと\n\n\n## 次に試すこと\n\n\n## 元の実験メモ\n\n${ordered.map(note => `### ${note.title || noteDate(note.createdAt)}\n\n${note.body}\n\n[元のメモ](https://myblackcat913.com/notes/${note.id})`).join("\n\n")}\n`;
}
