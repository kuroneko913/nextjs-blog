"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { articleDraft, Note } from "@/src/notes/model";
import DiscardableNote from "./DiscardableNote";
import DiscardNotice from "./DiscardNotice";
import useOwner from "./useOwner";

export default function NotesFeed() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const requestVersion = useRef(0);
  const owner = useOwner();
  const [discarded, setDiscarded] = useState<Note | null>(null);

  const load = useCallback(async (after?: string) => {
    const version = ++requestVersion.current;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/notes${after ? `?cursor=${encodeURIComponent(after)}` : ""}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ノートを読み込めませんでした。");
      if (version !== requestVersion.current) return;
      setNotes(previous => after ? Array.from(new Map([...previous, ...data.notes].map((note: Note) => [note.id, note])).values()) : data.notes);
      setCursor(data.nextCursor);
    } catch (cause) { if (version === requestVersion.current) setError(cause instanceof Error ? cause.message : "接続を確認して、もう一度お試しください。"); }
    finally { if (version === requestVersion.current) setLoading(false); }
  }, []);

  useEffect(() => {
    void load();
    const refresh = () => { void load(); setSelected(new Set()); };
    const invalidate = () => { ++requestVersion.current; };
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("focus", refresh); invalidate(); };
  }, [load]);

  function discard(note: Note) {
    ++requestVersion.current;
    setLoading(false);
    setNotes(previous => previous.filter(item => item.id !== note.id));
    setSelected(previous => { const next = new Set(previous); next.delete(note.id); return next; });
    setDiscarded(note);
  }

  function download() {
    const markdown = articleDraft(notes.filter(note => selected.has(note.id)));
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `experiment-draft-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  return <>
    {owner && <p className="notes-owner-links"><Link href="/notes/trash">くずかご ↗</Link><span>自分だけに見えます</span></p>}
    {discarded && <DiscardNotice key={discarded.id} note={discarded} onRestore={() => { setDiscarded(null); void load(); }} />}
    <div className="notes-feed-toolbar"><span>新しいノートから</span><button className="notes-secondary" onClick={() => { setSelecting(!selecting); setSelected(new Set()); }}>{selecting ? "選択をやめる" : "ノートを記事に育てる"}</button></div>
    {selecting && <p className="notes-message">まとめたいノートを選ぶと、元の記録とリンクを含む記事の下書きをダウンロードできます。</p>}
    {notes.map(note => <DiscardableNote key={note.id} note={note} owner={owner} onDiscard={discard} selection={selecting && <label className="notes-select"><input type="checkbox" checked={selected.has(note.id)} onChange={event => setSelected(previous => { const next = new Set(previous); if (event.target.checked) next.add(note.id); else next.delete(note.id); return next; })} aria-label={`${note.title || note.body.slice(0, 30)}を記事に含める`} />記事に含める</label>} />)}
    {!loading && !error && notes.length === 0 && <div className="notes-empty"><strong>公開中のノートはありません。</strong><p className="notes-hint">いま試していることを、そのまま残してみよう。</p><Link className="notes-primary" style={{ marginTop: 20 }} href="/notes/new">ノートを書く</Link></div>}
    {error && <div role="alert" className="notes-message notes-error">{error}<br /><button className="notes-secondary" onClick={() => void load(cursor || undefined)}>もう一度読み込む</button></div>}
    {loading && <p role="status" className="notes-hint">ノートを読み込んでいます…</p>}
    {cursor && !error && <button className="notes-secondary" disabled={loading} onClick={() => void load(cursor)}>前のノートを読む</button>}
    {selecting && selected.size > 0 && <div className="notes-export"><span>{selected.size}件のノートから</span><button className="notes-primary" onClick={download}>記事の下書きを保存 ↓</button></div>}
  </>;
}
