import Footer from "@/app/modules/Footer";
import Header from "../../modules/Header";
import IntroductionBox from "../../modules/IntroductionBox";
import { getPostBySlug } from "@/src/fetch";
import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import breaks from 'remark-breaks';
import CodeBlock from "../../modules/CodeBlock";
import LikeButton from "@/app/modules/LikeButton";
import type { Metadata } from "next";
import ArticleThumbnail from "@/app/modules/ArticleThumbnail";

export async function generateMetadata({ params } : { params: {slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  const images = post.hero ? [
    {
      url: `https://myblackcat913.com${post.hero}`,
      width: 1200,
      height: 630,
    },
  ] : [
    {
      url: "https://myblackcat913.com/images/logo.webp",
      width: 1200,
      height: 630,
    },
  ];
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "website",
      locale: "ja_JP",
      title: post.title,
      description: post.description,
      siteName: "くろねこ。の実験室",
      url: `https://myblackcat913.com/blog/${post.slug}`,
      images: images,
    },
  };
}

export default async function BlogPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const categories = post.categories?.join(", ") ?? 'none';

  if (!post) {
    return (
      <div>
        <p className="m-auto">Not Found</p>
      </div>
    );
  }

  return (
    <main>
      <Header />
      <ArticleThumbnail src={post.hero} />
      <h1 className="px-4 sm:px-20 pt-10 pb-4 text-2xl font-bold">{post.title}</h1>
      <p className="px-4 sm:px-20">Date: {
        new Date(post.date).toLocaleDateString("ja-jp", { year:'numeric', month:'2-digit', day: '2-digit', hour: "2-digit", minute: "2-digit" })
      }</p>
      <p className="px-4 sm:px-20">Category: {categories}</p>
      <div className="flex p-4 sm:p-10 flex-col sm:flex-row max-auto">
        <div className="w-full sm:w-3/4 markdown mb-16">
          <div className="sm:px-10 markdown overflow-x-auto">
            <ReactMarkdown 
              remarkPlugins={[gfm, breaks]} 
              components={{ code: CodeBlock as any }} 
              className="w-full leading-relaxed whitespace-pre-wrap">
              {post.content}
            </ReactMarkdown>
            <LikeButton slug={params.slug} />
          </div>
        </div>
        <IntroductionBox />
      </div>
      <Footer />
    </main>
  );
}
