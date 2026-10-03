import Link from "next/link";
import type { Metadata } from "next";
import Wastebasket from "./Wastebasket";

export const metadata: Metadata = { title: "くずかご | Notes", robots: { index: false, follow: false } };

export default function TrashPage() {
  return <>
    <Link className="notes-back" href="/notes">← ノートの一覧</Link>
    <p className="notes-eyebrow">THE WASTEPAPER BASKET</p>
    <h1 className="notes-title">くずかご</h1>
    <p className="notes-description">いったん丸めたアイデアも、ここに残しておく。<br />自分だけが読める、考えたことの置き場。</p>
    <Wastebasket />
  </>;
}
