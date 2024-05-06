import { getAllPosts } from "@/src/fetch";
import Header from "./modules/Header";

export default async function Index() {
  // 記事を全件取得する。
  const posts = await getAllPosts();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <main>
      <Header />
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <a href={`/blog/${post.slug}`}>
              <div>
                <h2>{post.title}</h2>
                <p>{post.date.toLocaleDateString('ja-JP', options)}</p>
                <p>{post.tags?.join(',')}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
