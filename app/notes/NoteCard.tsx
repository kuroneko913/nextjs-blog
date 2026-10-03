import Link from "next/link";
import { Note, noteDate } from "@/src/notes/model";
import ShareNote from "./ShareNote";

export default function NoteCard({ note, selection }: { note: Note; selection?: React.ReactNode }) {
  return <article className="notes-card">
    <div className="notes-card-meta"><Link href={`/notes/${note.id}`}><time dateTime={note.createdAt}>{noteDate(note.createdAt)}</time> ↗</Link>{selection}</div>
    {note.title && <h2>{note.title}</h2>}
    <p className="notes-content">{note.body}</p>
    {note.tags.length > 0 && <div className="notes-tags">{note.tags.map(tag => <span className="notes-tag" key={tag}># {tag}</span>)}</div>}
    <div className="notes-card-actions"><ShareNote note={note} /></div>
  </article>;
}
