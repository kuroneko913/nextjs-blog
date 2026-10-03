"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { MAX_BODY, MAX_TITLE, validId, type Note } from "@/src/notes/model";
import ShareNote from "./ShareNote";

const DRAFT_KEY = "blackcat-experiment-draft-v1";
type Draft = { id: string; body: string; title: string; tags: string };
const emptyDraft = (): Draft => ({ id: crypto.randomUUID(), body: "", title: "", tags: "" });

export default function NoteComposer() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saveStatus, setSaveStatus] = useState("読み込み中…");
  const [owner, setOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginNotice, setLoginNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);
  const [error, setError] = useState("");
  const [published, setPublished] = useState<Note | null>(null);
  const [conflict, setConflict] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let initial = emptyDraft();
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (validId(saved.id) && typeof saved.body === "string" && typeof saved.title === "string" && typeof saved.tags === "string") initial = saved;
        else throw new Error("Invalid draft");
      }
      setSaveStatus(raw ? "書きかけを復元しました" : "この端末に自動保存");
    } catch { setSaveStatus("自動保存を利用できません"); }
    setDraft(initial);
    const currentUrl = new URL(window.location.href);
    const loginResult = currentUrl.searchParams.get("login");
    const loginMessages: Record<string, string> = {
      cancelled: "ログインをキャンセルしました。書きかけはこの端末に残っています。",
      denied: "このGitHubアカウントでは投稿できません。kuroneko913のアカウントでログインしてください。",
      expired: "ログインをやり直してください。書きかけはこの端末に残っています。",
      failed: "GitHubに接続できませんでした。もう一度ログインしてください。",
      unavailable: "GitHubログインを設定中です。書きかけはこの端末に残せます。",
      production: "ログインはmyblackcat913.comで利用できます。この画面の書きかけは、移動前にコピーしてください。",
    };
    if (loginResult) {
      if (loginMessages[loginResult]) { setError(loginMessages[loginResult]); setShowLogin(true); }
      currentUrl.searchParams.delete("login");
      window.history.replaceState(window.history.state, "", currentUrl);
    }
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    const checkSession = () => fetch("/api/notes/session", { cache: "no-store" }).then(res => res.json()).then(data => {
      const loggedIn = data.authenticated === true;
      setOwner(loggedIn);
      if (loggedIn) setShowLogin(false);
      if (loggedIn && loginResult === "success") setLoginNotice("GitHubでログインしました。「公開する」を押すとノートを公開できます。");
    }).catch(() => {});
    void checkSession();
    const resume = () => { setBusy(false); void checkSession(); };
    window.addEventListener("pageshow", resume);
    return () => { window.removeEventListener("online", updateOnline); window.removeEventListener("offline", updateOnline); window.removeEventListener("pageshow", resume); };
  }, []);

  function persist(next: Draft) {
    setDraft(next);
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(next)); setSaveStatus("この端末に保存しました"); }
    catch { setSaveStatus("保存できません。本文をコピーしてください"); }
  }

  async function prepareLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Save before leaving the PWA for GitHub. Never auto-publish on return.
    try {
      if (!draft) throw new Error("Draft not ready");
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      setError("書きかけを保存できません。ログイン前に本文をコピーし、このブラウザの保存設定を確認してください。");
      return;
    }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/notes/oauth/start", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ログインを開始できませんでした。");
      window.location.assign(data.url);
    } catch (cause) {
      setBusy(false);
      setError(cause instanceof Error ? cause.message : "接続できませんでした。書きかけはこの端末に残っています。");
    }
  }

  async function publish(event: FormEvent) {
    event.preventDefault();
    if (!draft || busy) return;
    if (!owner) { setShowLogin(true); return; }
    setBusy(true); setError(""); setPublished(null); setConflict(false); setLoginNotice("");
    try {
      const tags = draft.tags.split(/[,、]/).map(tag => tag.trim()).filter(Boolean);
      const response = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...draft, tags }) });
      const data = await response.json();
      if (response.status === 401) { setOwner(false); setShowLogin(true); }
      if (response.status === 409) setConflict(true);
      if (!response.ok) throw new Error(data.error || "公開できませんでした。");
      setPublished(data.note);
      persist(emptyDraft());
      setSaveStatus("公開しました。次のノートもどうぞ");
      bodyRef.current?.focus();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "通信が途切れました。入力内容を残しています。"); }
    finally { setBusy(false); }
  }

  async function logout() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/notes/session", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "ログアウトできませんでした。");
      setOwner(false);
      setLoginNotice("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "ログアウトできませんでした。接続を確認してください。"); }
    finally { setBusy(false); }
  }

  return <>
    <Link className="notes-back" href="/notes">← ノートの一覧</Link>
    <p className="notes-eyebrow">A SMALL NOTE, A NEW DISCOVERY.</p>
    <h1 className="notes-title">いまの実験を、ひとこと。</h1>
    <p className="notes-description">試したことも、つまずいたことも。<br />結論が出ていなくても、そのまま残しておこう。</p>
    {!online && <p className="notes-message" role="status">オフラインです。書きかけはこの端末に保存できます。接続後に「公開する」を押してください。</p>}
    {loginNotice && <p className="notes-message" role="status">{loginNotice}</p>}
    {published && <div className="notes-message" role="status">ノートを公開しました。<div className="notes-saved-links"><Link href={`/notes/${published.id}`}>公開したノートを見る ↗</Link><Link href="/notes">一覧を見る</Link></div><ShareNote note={published} /></div>}
    <form onSubmit={publish}>
      <div className="notes-editor">
        <div className="notes-editor-top"><span role="status"><span className="notes-status-dot" />{saveStatus}</span><span>{draft?.body.length || 0} / {MAX_BODY}</span></div>
        <label className="sr-only" htmlFor="note-body">ノートの本文</label>
        <textarea id="note-body" ref={bodyRef} className="notes-body-input" placeholder={"今日は何を試した？\n\nうまくいったこと、気づいたこと、\n次に試したいこと。ひとつだけでも。"} value={draft?.body || ""} onChange={event => draft && persist({ ...draft, body: event.target.value })} maxLength={MAX_BODY} required disabled={!draft || busy} />
        <details className="notes-options"><summary>タイトル・タグを添える（任意）</summary>
          <label className="notes-field" htmlFor="note-title">タイトル<input id="note-title" value={draft?.title || ""} maxLength={MAX_TITLE} disabled={!draft || busy} onChange={event => draft && persist({ ...draft, title: event.target.value })} placeholder="空欄のままで大丈夫" /></label>
          <label className="notes-field" htmlFor="note-tags">タグ<input id="note-tags" value={draft?.tags || ""} maxLength={154} disabled={!draft || busy} onChange={event => draft && persist({ ...draft, tags: event.target.value })} placeholder="PWA, 音声入力" /><small>カンマで区切って5個まで</small></label>
        </details>
      </div>
      <div className="notes-compose-actions"><p className="notes-hint">公開すると、誰でも読めます。<br />タイトルなし・一文だけでもOK。</p><button className="notes-primary" type="submit" disabled={!draft?.body.trim() || busy || !online}>{busy ? "処理中…" : "公開する ↗"}</button></div>
    </form>
    {error && <div className="notes-message notes-error" role="alert">{error}{conflict && draft && <div className="notes-saved-links"><Link href={`/notes/${draft.id}`}>公開済みのノートを確認</Link><button onClick={() => { persist({ ...draft, id: crypto.randomUUID() }); setConflict(false); setError(""); }}>入力内容を新しいノートにする</button></div>}</div>}
    {showLogin && <form className="notes-login" action="/api/notes/oauth/start" method="post" onSubmit={prepareLogin}>
      <h2>GitHubで投稿用にログイン</h2><p className="notes-hint">投稿できるのはkuroneko913のアカウントだけです。<br />書きかけを保存してGitHubに移動します。この端末では30日間ログインを保持します。</p>
      <div className="notes-login-actions"><button className="notes-primary" disabled={!draft || busy || !online}>{busy ? "GitHubに移動中…" : "GitHubでログイン"}</button><button type="button" className="notes-secondary" onClick={() => setShowLogin(false)}>あとで</button></div>
    </form>}
    <div className="notes-compose-actions"><Link className="notes-hint" href="/notes">たまったノートを眺める →</Link>{owner ? <button className="notes-hint" disabled={busy} onClick={logout}>ログアウト</button> : <button className="notes-hint" disabled={busy} onClick={() => setShowLogin(true)}>投稿用にログイン</button>}</div>
    <p className="notes-hint" style={{ marginTop: 28 }}>ホーム画面に追加すると、ここからすぐ書き始められます。<br />書きかけはこのブラウザだけに保存されます。</p>
  </>;
}
