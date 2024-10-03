import Footer from "@/app/modules/Footer";
import Header from "../modules/Header";
import Hero from "../modules/Hero";
import { getPost } from "@/src/fetchForAbout";
import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import breaks from 'remark-breaks';
import CodeBlock from "../modules/CodeBlock";

export default async function About() {
    const post = await getPost();
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
      <Hero />
      <div className="flex p-4 sm:p-10 flex-col sm:flex-row max-auto">
        <div className="w-full sm:w-3/4 markdown mb-16">
          <div className="sm:px-10 markdown overflow-x-auto">
            <ReactMarkdown 
              remarkPlugins={[gfm, breaks]} 
              components={{ 
                code: CodeBlock as any,
              }} 
              className="w-full leading-relaxed whitespace-pre-wrap">
                {post.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
