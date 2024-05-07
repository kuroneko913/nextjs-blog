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
      <Top posts={posts} />
      <Footer />
    </main>
  );
}
