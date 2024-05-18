import Footer from "@/app/modules/Footer";
import Header from "../../modules/Header";
import IntroductionBox from "../../modules/IntroductionBox";
import { getPostBySlug } from "@/src/fetch";
import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import { CodeBlock } from "../../modules/CodeBlock";

export default async function BlogPage({params}) {
  const post = await getPostBySlug(params.slug);
  const categories = post.categories?.join(", ") ?? 'none';

  return (
    <main>
      <Header />
      <h1 className="px-20 pt-10 pb-4 text-2xl font-bold">{post.title}</h1>
      <p className="px-20">Date: {
        new Date(post.date).toLocaleDateString("ja-jp", {year:'numeric', month:'2-digit', day: '2-digit', hour: "2-digit", minute: "2-digit"})
      }</p>
      <p className="px-20">Category: {categories}</p>
      <div className="flex p-10">
        <div className="px-10 w-3/4 markdown">
          <ReactMarkdown remarkPlugins={[gfm]} components={{ code: CodeBlock }}>{post.content}</ReactMarkdown>
        </div>
        <IntroductionBox />
      </div>
      <Footer />
    </main>
  );
}
