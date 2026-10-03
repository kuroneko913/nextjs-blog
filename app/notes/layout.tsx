import Link from "next/link";
import Image from "next/image";
import type { Metadata, Viewport } from "next";
import "./notes.css";

export const metadata: Metadata = {
  manifest: "/notes/manifest.webmanifest",
  title: "Notes | くろねこ。の実験室",
  description: "試したこと、つまずいたこと、次にやりたいこと。実験途中の小さな記録。",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f6f5f0" };

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <div className="notes-app">
    <header className="notes-header">
      <Link href="/" className="notes-brand"><Image src="/images/logo-transparent.png" alt="" width={34} height={34} /><span>くろねこ。の実験室<small>LABORATORY / FIELD NOTES</small></span></Link>
      <nav className="notes-nav" aria-label="メインナビゲーション">
        <Link href="/">Home</Link>
        <Link href="/blog">Blog</Link>
        <Link href="/notes" aria-current="location">Notes</Link>
      </nav>
    </header>
    <main className="notes-main">{children}</main>
    <footer className="notes-footer">うまくいった日も、いかなかった日も。</footer>
  </div>;
}
