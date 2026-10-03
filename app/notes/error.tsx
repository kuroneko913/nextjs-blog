"use client";

export default function NotesError({ reset }: { reset: () => void }) {
  return <div className="notes-message notes-error" role="alert"><h1>ノートを読み込めませんでした。</h1><p>しばらくしてから、もう一度お試しください。</p><button className="notes-secondary" onClick={reset}>もう一度読み込む</button></div>;
}
