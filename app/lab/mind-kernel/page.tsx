import type { Metadata } from "next";
import Link from "next/link";

const description = "自分の価値観や思考の癖をAIが参照できる形にし、対話や判断にどう関わるかを試すMind Kernelの運用実験。Mind Kernelそのもの、公開テンプレート、MCPサーバーを紹介します。";

export const metadata: Metadata = {
  title: "Mind Kernel | Lab | くろねこ。の実験室",
  description,
  alternates: { canonical: "https://myblackcat913.com/lab/mind-kernel" },
  openGraph: {
    title: "Mind Kernel | Lab",
    description,
    url: "https://myblackcat913.com/lab/mind-kernel",
    images: ["https://myblackcat913.com/images/logo.webp"],
  },
};

export default function MindKernelPage() {
  return <div className="lab-detail">
    <Link href="/lab" className="lab-back">← Labの一覧</Link>
    <p className="lab-eyebrow">MIND KERNEL / 思考の軸の運用</p>
    <h1>Mind Kernel</h1>
    <p className="lab-project-lead">自分の判断の軸を、AIとの対話に持ち込む。</p>
    <p className="lab-project-description">価値観や思考の癖、経験から得たパターン、いま取り組んでいる課題。<br />それらを言葉にして持ち続け、AIとの対話や判断にどう関わるかを試しています。</p>
    <section className="lab-project-section" aria-labelledby="kernel-about">
      <h2 id="kernel-about">Mind Kernelそのもの</h2>
      <p className="lab-project-description">Mind Kernelは、自分の思考や価値観を構造化した「思考の核」です。AIが相談の背景や判断基準を参照し、その人の文脈に沿って対話するための土台にします。</p>
      <p className="lab-project-description">一度作って終わりではなく、対話や経験を通じて課題やパターンを見直し、育てながら使う実験です。個人のKernelは非公開で管理し、ここでは考え方と公開ツールを紹介しています。</p>
    </section>
    <section className="lab-project-output" aria-labelledby="kernel-template">
      <h2 id="kernel-template">mind-kernel-template</h2>
      <p>自分のMind Kernelを作るための公開テンプレートです。価値観やプロフィール（identity）、経験から得たパターン（patterns）、現在の課題（backlog）、設計・運用の方針（meta）を4つのモジュールに分けて整理します。</p>
      <div className="lab-output-links">
        <a className="lab-output-link" href="https://github.com/kuroneko913/mind-kernel-template" target="_blank" rel="noopener noreferrer" aria-label="テンプレートを見る（新しいタブで開きます）">テンプレートを見る<span aria-hidden="true">↗</span></a>
      </div>
    </section>
    <section className="lab-project-output" aria-labelledby="kernel-mcp">
      <h2 id="kernel-mcp">mind-kernel-mcp</h2>
      <p>AIからMind Kernelを参照し、更新を提案するためのMCPサーバーです。Kernelの中身と、それをAIへ届ける接続部分を分けて運用します。</p>
      <p>AIによる変更はPull Requestとして提案し、人間が確認してから反映する仕組みです。AIとの対話を続けながら、判断の軸をどう見直していくかも試しています。</p>
      <div className="lab-output-links">
        <a className="lab-output-link" href="https://github.com/kuroneko913/mind-kernel-mcp" target="_blank" rel="noopener noreferrer" aria-label="MCPサーバーの実装を見る（新しいタブで開きます）">MCPサーバーの実装を見る<span aria-hidden="true">↗</span></a>
      </div>
    </section>
    <section className="lab-project-output" aria-labelledby="kernel-agent-operations">
      <h2 id="kernel-agent-operations">AIエージェント運用との関係</h2>
      <p>Mind Kernelで試すのは、AIが参照する判断の軸。AIエージェント運用で試すのは、情報を集め、気になるものをためて、記事にする日々の活動です。</p>
      <p>2つの実験をつなげて、判断の軸が情報の選び方や書く内容にどう関わるかを見ていきます。</p>
      <div className="lab-output-links"><Link href="/lab/ai-agent-operations" className="lab-output-link">AIエージェント運用を見る<span aria-hidden="true">→</span></Link></div>
    </section>
  </div>;
}
