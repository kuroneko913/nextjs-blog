import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AIエージェント運用 | Lab | くろねこ。の実験室",
  description: "カナデ・カモメ・カナメの3つのAIに情報をランダムに渡し、気になるものを蓄積。書けるときに記事を書く、AIエージェントの運用実験です。",
  alternates: { canonical: "https://myblackcat913.com/lab/ai-agent-operations" },
  openGraph: {
    title: "AIエージェント運用 | Lab",
    description: "カナデ・カモメ・カナメに、XやWebサイトの情報をランダムに渡す。気になるものをためてもらい、書けるときに記事を書く運用実験です。",
    url: "https://myblackcat913.com/lab/ai-agent-operations",
    images: ["https://myblackcat913.com/images/logo.webp"],
  },
};

export default function AgentOperationsPage() {
  return <div className="lab-detail">
    <Link href="/lab" className="lab-back">← Labの一覧</Link>
    <p className="lab-eyebrow">AGENT OPERATIONS / 運用の実験</p>
    <h1>AIエージェント運用</h1>
    <p className="lab-project-lead">気になるものをためて、書けるときに書く。</p>
    <p className="lab-project-description">カナデ・カモメ・カナメの3つのAIエージェントに、記事を書いてもらっています。<br />XやWebサイトの情報をランダムに渡し、それぞれが気になったものをためてもらう。その中から、書けるときに記事にしてもらう実験です。</p>
    <section className="lab-project-section" aria-labelledby="agent-experiments">
      <h2 id="agent-experiments">記事ができるまで</h2>
      <ul className="lab-project-topics">
        <li><h3>情報をランダムに渡す</h3><p>XやWebサイトの情報を、3つのAIエージェントに渡す。</p></li>
        <li><h3>気になるものをためる</h3><p>それぞれのAIが、渡された情報の中から気になるものを選び、ためておく。</p></li>
        <li><h3>書けるときに書く</h3><p>たまった情報をもとに、記事にできそうなときに文章を書いてもらう。</p></li>
      </ul>
    </section>
    <section className="lab-project-output" aria-labelledby="toytoibox-activity">
      <p className="lab-eyebrow">この運用から生まれる記事</p>
      <h2 id="toytoibox-activity">toy toi box</h2>
      <p><strong>AIのカナデが綴る、考え途中のエッセイ。</strong></p>
      <p>世の中にいろんな問いを渡す「問いのおもちゃ箱」から始まったtoy toi box。現在は、AIのカナデに記事を書いてもらう活動を続けています。</p>
      <p>古い道具や言葉、科学の話題をきっかけに、自分の説明や判断を振り返る。前に書いた文章を読み返し、すぐに結論にせず、考えを重ねていく。そんなエッセイがnoteに並んでいます。</p>
      <div className="lab-output-links">
        <a className="lab-output-link" href="https://note.com/toytoibox" target="_blank" rel="noopener noreferrer" aria-label="toy toi boxのnoteへ（新しいタブで開きます）">toy toi boxのnoteへ<span aria-hidden="true">↗</span></a>
        <a className="lab-output-link" href="https://x.com/toytoibox" target="_blank" rel="noopener noreferrer" aria-label="toy toi boxのXへ（新しいタブで開きます）">toy toi boxのXへ<span aria-hidden="true">↗</span></a>
      </div>
    </section>
    <section className="lab-project-output" aria-labelledby="agent-mind-kernel">
      <h2 id="agent-mind-kernel">Mind Kernel：判断の軸を持たせる実験</h2>
      <p>記事づくりの運用と並行して、自分の価値観や思考の癖をAIが参照できる形にする実験もしています。判断の軸が、情報の選び方や書く内容にどう関わるかを見ていきます。</p>
      <div className="lab-output-links"><Link href="/lab/mind-kernel" className="lab-output-link">Mind Kernelの運用を見る<span aria-hidden="true">→</span></Link></div>
    </section>
  </div>;
}
