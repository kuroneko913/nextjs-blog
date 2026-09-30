import Link from "next/link";
import { notFound } from "next/navigation";
import { getNote } from "@/src/notes/store";
import NoteCard from "../NoteCard";

export const dynamic = "force-dynamic";

export default async function NotePage({ params }: { params: { id: string } }) {
  const note = await getNote(params.id);
  if (!note) notFound();
  return <><Link className="notes-back" href="/notes">← 実験メモの一覧</Link><p className="notes-eyebrow">FIELD NOTE</p><h1 className="notes-title" style={{ marginBottom: 24 }}>実験のひとこま</h1><NoteCard note={note} /><Link className="notes-primary" href="/notes/new">＋ 次のメモを書く</Link></>;
}
