import ArticleBox from './ArticleBox';
import { Post } from '@/src/interfaces/post';
import fetchBlogLike from '@/src/api/fetchBlogLike';

export default async function UpdateArticle(prop: { posts: Post[] }) {
    const likes = await fetchBlogLike();
    return (
        <div className="sm:p-10">
            <h1 className="text-2xl pb-10 font-bold">Update</h1>
            <div className="flex gap-8 flex-wrap justify-start items-start">
                {prop.posts.map((post) => (
                    <ArticleBox post={post} key={post.slug} likeNum={likes[post.slug] ? likes[post.slug] : 0} />
                ))}
            </div>
        </div>
    );
}
