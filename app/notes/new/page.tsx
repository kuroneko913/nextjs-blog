import type { Metadata } from "next";
import NoteComposer from "../NoteComposer";

export const metadata: Metadata = { title: "ノートを書く | くろねこ。の実験室", robots: { index: false, follow: false } };
export default function NewNotePage() { return <NoteComposer />; }
