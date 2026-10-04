import ArticleBox from "./ArticleBox";
import { Post } from "@/src/interfaces/post";
import fetchBlogLike from "@/src/api/fetchBlogLike";

export default async function RecommendArticle(prop: { posts: Post[] }) {
    const likes = await fetchBlogLike();
    return (
        <div className="w-full  mt-16">
            <h1 className="text-2xl pb-10 font-bold">Recommend</h1>
            <div className="site-article-grid">
                {prop.posts.map((post) => (
                    <ArticleBox post={post} key={post.slug} likeNum={likes[post.slug] ? likes[post.slug] : 0} />
                ))}
            </div>
        </div>
    );
}
