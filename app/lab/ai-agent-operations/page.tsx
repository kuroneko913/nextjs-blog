import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AIエージェント運用 | Lab | くろねこ。の実験室",
  description: "AIエージェントに仕事を任せ、日々の活動を続ける運用実験。「問いのおもちゃ箱」toy toi boxの活動などを通じて、仕組みを試しています。",
  alternates: { canonical: "https://myblackcat913.com/lab/ai-agent-operations" },
  openGraph: {
    title: "AIエージェント運用 | Lab",
    description: "AIエージェントに仕事を任せ、日々の活動を続ける運用実験。「問いのおもちゃ箱」toy toi boxは、運用している活動のひとつです。",
    url: "https://myblackcat913.com/lab/ai-agent-operations",
    images: ["https://myblackcat913.com/images/logo.webp"],
  },
};

export default function AgentOperationsPage() {
  return <div className="lab-detail">
    <Link href="/lab" className="lab-back">← Labの一覧</Link>
    <p className="lab-eyebrow">AGENT OPERATIONS / 運用の実験</p>
    <h1>AIエージェント運用</h1>
    <p className="lab-project-lead">AIエージェントと、日々の活動を続ける。</p>
    <p className="lab-project-description">AIエージェントに仕事を任せ、続けて動かすための仕組みを試しています。<br />日々の動きや結果を見ながら、任せる仕事や運用の仕組みを少しずつ整えていく実験です。</p>
    <section className="lab-project-section" aria-labelledby="agent-experiments">
      <h2 id="agent-experiments">試していること</h2>
      <ul className="lab-project-topics">
        <li><h3>仕事を任せる</h3><p>どんな仕事を、どこまでAIエージェントに任せられるかを考え、試す。</p></li>
        <li><h3>継続して動かす</h3><p>日々の活動を続けられるよう、実行と運用の仕組みを整える。</p></li>
        <li><h3>結果を見て整える</h3><p>動きや成果を見ながら、うまくいったことも、つまずきも次の改善につなげる。</p></li>
      </ul>
    </section>
    <section className="lab-project-output" aria-labelledby="toytoibox-activity">
      <p className="lab-eyebrow">運用している活動のひとつ</p>
      <h2 id="toytoibox-activity">toy toi box</h2>
      <p><strong>世の中にいろんな問いを渡す、「問いのおもちゃ箱」。</strong></p>
      <p>toy toi boxは、問いを通じて考えるきっかけを届ける活動です。AIのカナデによる文章づくりとnoteへの発信も、そのひとつ。noteは問いを届ける場として使っています。</p>
      <a className="lab-output-link" href="https://note.com/toytoibox" target="_blank" rel="noopener noreferrer" aria-label="toy toi boxのnoteへ（新しいタブで開きます）">toy toi boxのnoteへ<span aria-hidden="true">↗</span></a>
    </section>
  </div>;
}
