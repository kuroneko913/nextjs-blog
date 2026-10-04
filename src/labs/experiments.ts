type ExperimentDetails = {
  id: string;
  title: string;
  category: string;
  description: string;
  action: string;
  icon: "agent" | "kernel" | "writing" | "dna" | "notes";
};

export type Experiment = ExperimentDetails & (
  | { href: `/${string}`; external?: false }
  | { href: `https://${string}`; external: true }
);

// Add an entry here to put another experiment on the Lab page.
export const experiments: readonly Experiment[] = [
  {
    id: "ai-agent-operations",
    title: "AIエージェント運用",
    category: "運用の実験",
    description: "カナデ・カモメ・カナメに、XやWebサイトの情報をランダムに渡す。気になるものをためてもらい、書けるときに記事を書く運用を試しています。",
    href: "/lab/ai-agent-operations",
    action: "実験を見る",
    icon: "agent",
  },
  {
    id: "mind-kernel",
    title: "Mind Kernel",
    category: "思考の軸の運用",
    description: "自分の価値観や思考の癖を、AIが参照できる形にする。対話や判断にどう関わるかを試す実験と、テンプレート・MCPサーバーを紹介します。",
    href: "/lab/mind-kernel",
    action: "実験を見る",
    icon: "kernel",
  },
  {
    id: "genetic-codes",
    title: "Genetic Code",
    category: "ことばとコード",
    description: "DNAとアミノ酸の翻訳をモチーフに、文章を変換して戻す。生物の仕組みから着想した、小さな暗号化ツールです。",
    href: "/lab/genetic-codes",
    action: "試してみる",
    icon: "dna",
  },
  {
    id: "notes",
    title: "Notes",
    category: "日々の記録",
    description: "試したこと、気づいたこと、まだ途中のアイデア。気軽に書き残して、あとで記事に育てるための実験ノートです。",
    href: "/notes",
    action: "ノートを見る",
    icon: "notes",
  },
];
