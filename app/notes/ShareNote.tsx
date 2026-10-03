import type { Note } from "@/src/notes/model";
import { xShareUrl } from "@/src/notes/sharing";

export default function ShareNote({ note }: { note: Pick<Note, "id" | "title" | "body"> }) {
  return <a className="notes-share-link" href={xShareUrl(note)} target="_blank" rel="noopener noreferrer">
    X（Twitter）でシェア <span aria-hidden="true">↗</span>
    <span className="sr-only">（新しいタブで投稿画面を開きます）</span>
  </a>;
}
