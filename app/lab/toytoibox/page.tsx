import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "toy toi box — AIエージェントの運用 | Lab | くろねこ。の実験室",
  description: "AIエージェントに仕事を任せ、継続して動かす仕組みを試す運用実験。noteへの発信は、その活動のひとつです。",
  alternates: { canonical: "https://myblackcat913.com/lab/toytoibox" },
  openGraph: {
    title: "toy toi box — AIエージェントの運用 | Lab",
    description: "AIエージェントに仕事を任せ、継続して動かす仕組みを試す運用実験。",
    url: "https://myblackcat913.com/lab/toytoibox",
    images: ["https://myblackcat913.com/images/logo.webp"],
  },
};

export default function ToyToiBoxPage() {
  return <div className="lab-detail">
    <Link href="/lab" className="lab-back">← Labの一覧</Link>
    <p className="lab-eyebrow">AGENT OPERATIONS / AIエージェントの運用</p>
    <h1>toy toi box</h1>
    <p className="lab-project-lead">AIエージェントを、継続して運用する。</p>
    <p className="lab-project-description">AIエージェントに仕事を任せ、続けて動かすための仕組みを試しています。<br />日々の動きや結果を見ながら、任せる仕事や運用の仕組みを少しずつ整えていく実験です。</p>
    <section className="lab-project-section" aria-labelledby="toytoibox-experiments">
      <h2 id="toytoibox-experiments">試していること</h2>
      <ul className="lab-project-topics">
        <li><h3>仕事を任せる</h3><p>どんな仕事を、どこまでAIエージェントに任せられるかを考え、試す。</p></li>
        <li><h3>継続して動かす</h3><p>日々の活動を続けられるよう、実行と運用の仕組みを整える。</p></li>
        <li><h3>結果を見て整える</h3><p>動きや成果を見ながら、うまくいったことも、つまずきも次の改善につなげる。</p></li>
      </ul>
    </section>
    <section className="lab-project-output" aria-labelledby="toytoibox-output">
      <h2 id="toytoibox-output">活動のひとつ：noteへの発信</h2>
      <p>AIのカナデによる文章づくりとnoteへの発信も、この運用実験のひとつです。公開された記事から、活動の出力を読むことができます。</p>
      <a className="lab-output-link" href="https://note.com/toytoibox" target="_blank" rel="noopener noreferrer" aria-label="noteで活動を見る（新しいタブで開きます）">noteで活動を見る<span aria-hidden="true">↗</span></a>
    </section>
  </div>;
}
