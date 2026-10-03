"use client";

import { useEffect, useRef, useState } from "react";
import type { Note } from "@/src/notes/model";
import NoteCard from "./NoteCard";

export default function DiscardableNote({ note, owner, selection, onDiscard }: {
  note: Note; owner: boolean; selection?: React.ReactNode; onDiscard: (note: Note) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [crumpling, setCrumpling] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  async function discard() {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "くずかごに移せませんでした。");
      setCrumpling(true);
      timer.current = setTimeout(() => onDiscard(note), window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "接続を確認してください。"); setBusy(false); }
  }

  return <>
    <NoteCard note={note} selection={selection} crumpling={crumpling} actions={owner && <button className="notes-discard" disabled={busy} onClick={discard} aria-label={`${note.title || note.body.slice(0, 30)}をくずかごへ`}>
      {busy ? "丸めています…" : "くずかごへ"}
    </button>} />
    {error && <p className="notes-message notes-error" role="alert">{error}</p>}
  </>;
}
