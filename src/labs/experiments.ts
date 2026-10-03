type ExperimentDetails = {
  id: string;
  title: string;
  category: string;
  description: string;
  action: string;
  icon: "writing" | "dna" | "notes";
};

export type Experiment = ExperimentDetails & (
  | { href: `/${string}`; external?: false }
  | { href: `https://${string}`; external: true }
);

// Add an entry here to put another experiment on the Lab page.
export const experiments: readonly Experiment[] = [
  {
    id: "toytoibox",
    title: "toy toi box",
    category: "AIと文章",
    description: "問いを立て、AIのカナデに記事を書いてもらう。人が確認しながら、文章づくりと発信の仕組みを試しています。",
    href: "https://note.com/toytoibox",
    external: true,
    action: "noteで読む",
    icon: "writing",
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
