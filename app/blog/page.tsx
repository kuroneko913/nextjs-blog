import { getPostsByCondition } from "@/src/fetch";
import Header from "@/app/modules/Header";
import Hero from "@/app/modules/Hero";
import Blog from "@/app/modules/Blog";
import Footer from "@/app/modules/Footer";
import { SearchParams } from "@/src/interfaces/post";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "ブログ - くろねこ。の実験室",
    description: "自由気ままに書くブログサイト",
    openGraph: {
      type: "website",
      locale: "ja_JP",
      title: "ブログ - くろねこ。の実験室",
      description: "自由気ままに書くブログ",
      siteName: "くろねこ。の実験室",
      url: "https://myblackcat913.com/blog",
      images: [
        {
          url: "https://myblackcat913.com/images/logo.webp",
        },
      ],
    },
  };

export default async function Index(props: { searchParams: SearchParams }) {
    // 記事を取得する。
    const filteredPosts = await getPostsByCondition(props.searchParams);
    return (
        <main>
            <Header />
            <Hero />
            <Blog posts={filteredPosts} />
            <Footer />
        </main>
  );
}
