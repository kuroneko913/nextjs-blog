import UpdateArticle from "./UpdateArticle";
import RecommendArticle from "./RecommendArticle";
import IntroductionBox from "./IntroductionBox";
import { RecomendedPostsFilter, UpdatedArticleFilter } from "@/src/ArticleFilter";
import { Post } from "@/src/interfaces/post";

export default function Top(prop: { posts: Post[] }) {
    const updatedPosts = UpdatedArticleFilter(prop.posts, 6);
    const RecomendedPosts = RecomendedPostsFilter(prop.posts, 10);

    return (
        <div className="flex p-10 justify-between flex-wrap">
            <div className="w-full sm:w-3/4">
                <UpdateArticle posts={updatedPosts} />
                <RecommendArticle posts={RecomendedPosts} />
            </div>
            <div className="w-full sm:w-1/4 sm:mt-0 mt-10">
                <IntroductionBox props={{ marginTop: "100px" }} />
            </div>
        </div>
    );
}
