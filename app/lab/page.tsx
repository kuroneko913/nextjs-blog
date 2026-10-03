import Lab from "@/app/modules/Lab";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://myblackcat913.com/lab" },
  openGraph: {
    title: "Lab | くろねこ。の実験室",
    description: "AIエージェントの運用、小さなツール、日々の記録。つくって、試して、記録する実験の入口。",
    url: "https://myblackcat913.com/lab",
    images: ["https://myblackcat913.com/images/logo.webp"],
  },
};

export default function LabPage() {
  return <Lab />;
}
