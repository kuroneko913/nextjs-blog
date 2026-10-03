"use client";

import Link from "next/link";
import { useState } from "react";
import type { Note } from "@/src/notes/model";

export default function DiscardNotice({ note, onRestore }: { note: Note; onRestore: (note: Note) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function restore() {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/notes/${note.id}/restore`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ノートを戻せませんでした。");
      onRestore(data.note);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "接続を確認してください。"); }
    finally { setBusy(false); }
  }
  return <div className="notes-message notes-discard-notice">
    <p role="status">ノートを丸めて、くずかごへ。公開一覧から取り下げました。</p>
    <div className="notes-saved-links"><button className="notes-secondary" disabled={busy} onClick={restore}>{busy ? "戻しています…" : "元に戻す（再公開）"}</button><Link href="/notes/trash">くずかごを見る →</Link></div>
    {error && <p role="alert">{error}</p>}
  </div>;
}
