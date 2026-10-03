import { getAllPosts } from "@/src/fetch";
import Header from "./modules/Header";
import Hero from "./modules/Hero";
import Top from "./modules/Top";
import Footer from "./modules/Footer";

export default async function Index() {
  // 記事を全件取得する。
  const posts = await getAllPosts();

  return (
    <main>
      <Header />
      <Hero />
      <section className="mx-auto my-6 max-w-5xl px-5">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-green-100 bg-green-50 p-5 text-gray-800">
          <a href="/notes"><strong className="block">Notes</strong><span className="text-sm">試したこと、つまずいたこと。途中の記録はこちら。</span></a>
          <a className="rounded-lg bg-green-800 px-4 py-3 text-sm font-bold text-white" href="/notes/new">＋ ノートを書く</a>
        </div>
      </section>
      <Top posts={posts} />
      <Footer />
    </main>
  );
}
