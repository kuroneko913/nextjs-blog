import { Post } from "@/src/interfaces/post";
import ArticleBox from "./ArticleBox";

export default function BlogList(prop: { posts: Post[] }) {
    return (
        <div className="sm:w-3/4 w-full">
            <h1 className="text-2xl pb-10 font-bold">Blog</h1>
            <div className="flex gap-8 flex-wrap justify-start items-start">
                {prop.posts.map((post) => (
                    <ArticleBox post={post} key={post.slug} />
                ))}
            </div>
        </div>
    );
}
