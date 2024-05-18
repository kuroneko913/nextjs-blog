import { getPostsByCondition } from "@/src/fetch";
import Header from "@/app/modules/Header";
import Hero from "@/app/modules/Hero";
import Blog from "@/app/modules/Blog";
import Footer from "@/app/modules/Footer";

export default async function Index(props) {
    // 記事を取得する。
    const posts = await getPostsByCondition(props.searchParams);
    return (
        <main>
            <Header />
            <Hero />
            <Blog posts={posts} />
            <Footer />
        </main>
  );
}
