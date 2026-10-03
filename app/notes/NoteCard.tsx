import Link from "next/link";
import { Note, noteDate } from "@/src/notes/model";
import ShareNote from "./ShareNote";

export default function NoteCard({ note, selection, actions, crumpling = false }: { note: Note; selection?: React.ReactNode; actions?: React.ReactNode; crumpling?: boolean }) {
  return <article className={`notes-card${crumpling ? " notes-crumpling" : ""}`}>
    <div className="notes-card-meta"><Link href={`/notes/${note.id}`} prefetch={false}><time dateTime={note.createdAt}>{noteDate(note.createdAt)}</time> ↗</Link>{selection}</div>
    {note.title && <h2>{note.title}</h2>}
    <p className="notes-content">{note.body}</p>
    {note.tags.length > 0 && <div className="notes-tags">{note.tags.map(tag => <span className="notes-tag" key={tag}># {tag}</span>)}</div>}
    <div className="notes-card-actions">{actions}<ShareNote note={note} /></div>
  </article>;
}
