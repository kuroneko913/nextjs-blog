import { getPostBySlug } from "@/src/fetch";
import markdownToHtml from "@/src/markdownToHtml";

export default async function BlogPage({params}) {
  const post = await getPostBySlug(params.slug);
  const articleHtml = await markdownToHtml(post.content || "");

  return (
    <main>
      <h1>くろねこ。の実験室記事</h1>
      <h2>{post.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: articleHtml}} />
    </main>
  );
}
