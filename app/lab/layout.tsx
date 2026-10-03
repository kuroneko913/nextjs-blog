import type { Metadata } from "next";
import Header from "@/app/modules/Header";
import Footer from "@/app/modules/Footer";
import "./lab.css";

export const metadata: Metadata = {
  title: "Lab | くろねこ。の実験室",
  description: "AIと文章、小さなツール、日々の記録。くろねこ。がつくって試している実験の入口。",
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className="lab-app">
    <Header />
    <main className="lab-main">{children}</main>
    <Footer />
  </div>;
}
