"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { DiscardedNote, noteDate } from "@/src/notes/model";

export default function Wastebasket() {
  const [notes, setNotes] = useState<DiscardedNote[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [restored, setRestored] = useState<string | null>(null);
  const version = useRef(0);

  const load = useCallback(async (after?: string) => {
    const current = ++version.current;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/notes/trash${after ? `?cursor=${encodeURIComponent(after)}` : ""}`, { cache: "no-store" });
      const data = await response.json();
      if (current !== version.current) return;
      if (response.status === 401) { setLocked(true); setNotes([]); setCursor(null); return; }
      if (!response.ok) throw new Error(data.error || "くずかごを開けませんでした。");
      setLocked(false);
      setNotes(previous => after ? Array.from(new Map([...previous, ...data.notes].map((note: DiscardedNote) => [note.id, note])).values()) : data.notes);
      setCursor(data.nextCursor);
    } catch (cause) { if (current === version.current) setError(cause instanceof Error ? cause.message : "接続を確認してください。"); }
    finally { if (current === version.current) setLoading(false); }
  }, []);

  useEffect(() => {
    void load();
    const refresh = () => { void load(); };
    const invalidate = () => { ++version.current; };
    window.addEventListener("focus", refresh);
    return () => { invalidate(); window.removeEventListener("focus", refresh); };
  }, [load]);

  async function restore(note: DiscardedNote) {
    if (busy) return;
    setBusy(note.id); setError("");
    try {
      const response = await fetch(`/api/notes/${note.id}/restore`, { method: "POST" });
      const data = await response.json();
      if (response.status === 401) { setLocked(true); setNotes([]); setCursor(null); }
      if (!response.ok) throw new Error(data.error || "ノートを戻せませんでした。");
      ++version.current; setLoading(false);
      setNotes(previous => previous.filter(item => item.id !== note.id));
      setRestored(note.id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "接続を確認してください。"); }
    finally { setBusy(null); }
  }

  return <>
    {locked && <div className="notes-message"><p>くずかごを見るには、投稿用のログインが必要です。</p><Link href="/notes/new">投稿画面でログインする →</Link></div>}
    {restored && <div className="notes-message" role="status">ノートを広げて、公開一覧に戻しました。<br /><Link href={`/notes/${restored}`} prefetch={false}>戻したノートを見る ↗</Link></div>}
    {!locked && notes.map(note => <article className="notes-trash-card" key={note.id}>
      <div className="notes-paper-ball" aria-hidden="true" />
      <div className="notes-trash-record">
        <p className="notes-trash-date"><time dateTime={note.discardedAt}>{noteDate(note.discardedAt)}</time> に丸めた</p>
        <details><summary>{note.title || note.body.replace(/\s+/g, " ").slice(0, 65)}<span>紙を広げて読む</span></summary>
          <p className="notes-content">{note.body}</p>
          <p className="notes-hint">最初に書いた日：{noteDate(note.createdAt)}</p>
          {note.tags.length > 0 && <p className="notes-hint">{note.tags.map(tag => `#${tag}`).join(" ")}</p>}
        </details>
        <div className="notes-trash-restore"><button className="notes-secondary" disabled={busy !== null} onClick={() => void restore(note)}>{busy === note.id ? "戻しています…" : "広げて戻す"}</button><small>戻すと、再び公開されます。</small></div>
      </div>
    </article>)}
    {!locked && !loading && !error && notes.length === 0 && <div className="notes-empty"><div className="notes-basket-icon" aria-hidden="true">⌑</div><strong>くずかごは空っぽ。</strong><p className="notes-hint">丸めたノートはここに残ります。<br />また使いたくなったら、いつでも広げて。</p></div>}
    {loading && <p className="notes-hint" role="status">くずかごを開いています…</p>}
    {error && <div className="notes-message notes-error" role="alert">{error}<br /><button className="notes-secondary" onClick={() => void load()}>もう一度読み込む</button></div>}
    {cursor && !locked && <button className="notes-secondary" disabled={loading || busy !== null} onClick={() => void load(cursor)}>前に丸めたノートを見る</button>}
  </>;
}
