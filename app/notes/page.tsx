import Link from "next/link";
import NotesFeed from "./NotesFeed";

export default function NotesPage() {
  return <>
    <p className="notes-eyebrow">FIELD NOTES / くろねこ。の記録</p>
    <div className="notes-heading-row"><h1 className="notes-title">Notes</h1><Link className="notes-primary" href="/notes/new">＋ ノートを書く</Link></div>
    <p className="notes-description">まだ途中のアイデアも、小さな発見も。<br />ここに残して、ときどき記事に育てる。</p>
    <NotesFeed />
  </>;
}
