import Link from "next/link";
import Image from "next/image";
import type { Metadata, Viewport } from "next";
import "./notes.css";

export const metadata: Metadata = {
  manifest: "/notes/manifest.webmanifest",
  title: "実験メモ | くろねこ。の実験室",
  description: "試したこと、つまずいたこと、次にやりたいこと。実験途中の小さな記録。",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#f6f5f0" };

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return <div className="notes-app">
    <header className="notes-header">
      <Link href="/" className="notes-brand"><Image src="/images/logo-transparent.png" alt="" width={34} height={34} /><span>くろねこ。の実験室<small>LABORATORY / FIELD NOTES</small></span></Link>
      <Link href="/blog" className="notes-blog-link">ブログ ↗</Link>
    </header>
    <main className="notes-main">{children}</main>
    <footer className="notes-footer">うまくいった日も、いかなかった日も。</footer>
  </div>;
}
