import UpdateArticle from "./UpdateArticle";
import RecommendArticle from "./RecommendArticle";
import IntroductionBox from "./IntroductionBox";
import { RecomendedPostsFilter, UpdatedArticleFilter } from "@/src/ArticleFilter";
import { Post } from "@/src/interfaces/post";

export default function Top(prop: { posts: Post[] }) {
    const updatedPosts = UpdatedArticleFilter(prop.posts, 6);
    const RecomendedPosts = RecomendedPostsFilter(prop.posts, 10);

    return (
        <div className="flex p-10 justify-between">
            <div className="w-3/4">
                <UpdateArticle posts={updatedPosts} />
                <RecommendArticle posts={RecomendedPosts} />
            </div>
            <IntroductionBox props={{ marginTop: "100px" }} />
        </div>
    );
}
