import { Post } from "@/src/interfaces/post";
import ArticleBox from "./ArticleBox";
import fetchBlogLike from "@/src/api/fetchBlogLike";
 
export default async function BlogList(prop: { posts: Post[] }) {
    const likes = await fetchBlogLike();
    return (
        <div className="sm:w-3/4 w-full">
            <h1 className="text-2xl pb-10 font-bold">Blog</h1>
            <div className="flex gap-8 flex-wrap justify-start items-start">
                {prop.posts.map((post) => (
                    <ArticleBox post={post} key={post.slug} likeNum={likes[post.slug] ? likes[post.slug] : 0} />
                ))}
            </div>
        </div>
    );
}
