import type { Metadata } from "next";
import Link from "next/link";
import GeneticCodes from "@/app/modules/Labs/GeneticCodes/Base";

export const metadata: Metadata = {
  title: "Genetic Code | Lab | くろねこ。の実験室",
  description: "DNAとアミノ酸の翻訳をモチーフに、文章を変換して戻す小さな暗号化ツール。",
  alternates: { canonical: "https://myblackcat913.com/lab/genetic-codes" },
  openGraph: {
    title: "Genetic Code | Lab | くろねこ。の実験室",
    description: "DNAとアミノ酸の翻訳をモチーフに、文章を変換して戻す小さな暗号化ツール。",
    url: "https://myblackcat913.com/lab/genetic-codes",
    images: ["https://myblackcat913.com/images/logo.webp"],
  },
};

export default function GeneticCodesPage() {
  return <div className="lab-detail lab-tool">
    <Link href="/lab" className="lab-back">← Labの一覧</Link>
    <p className="lab-eyebrow">TOOL / ことばとコード</p>
    <h1>Genetic Code</h1>
    <div className="markdown"><GeneticCodes /></div>
  </div>;
}
