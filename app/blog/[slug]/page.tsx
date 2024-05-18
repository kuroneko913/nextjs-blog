import Footer from "@/app/modules/Footer";
import Header from "../../modules/Header";
import { getPostBySlug } from "@/src/fetch";
import markdownToHtml from "@/src/markdownToHtml";

export default async function BlogPage({params}) {
  const post = await getPostBySlug(params.slug);
  const articleHtml = await markdownToHtml(post.content || "");

  return (
    <main>
      <Header />
      <h2>{post.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: articleHtml}} />
      <Footer />
    </main>
  );
}
