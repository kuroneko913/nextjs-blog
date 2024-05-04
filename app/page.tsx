import { getAllPosts } from "@/src/fetch";

export default async function Index() {
  // 記事を全件取得する。
  const posts = await getAllPosts();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  return (
    <main>
      <h1>くろねこ。の実験室</h1>
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
