import Header from "@/app/modules/Header";
import Footer from "@/app/modules/Footer";
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
    <Header />
    <main className="notes-main">{children}</main>
    <Footer />
  </div>;
}
