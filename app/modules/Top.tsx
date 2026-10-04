import UpdateArticle from "./UpdateArticle";
import RecommendArticle from "./RecommendArticle";
import IntroductionBox from "./IntroductionBox";
import { RecomendedPostsFilter, UpdatedArticleFilter } from "@/src/ArticleFilter";
import { Post } from "@/src/interfaces/post";
import TwitterTimeLine from "./TwitterTimeLine";
import SuzuriBanner from "./SuzuriBanner";

export default function Top(prop: { posts: Post[] }) {
    const updatedPosts = UpdatedArticleFilter(prop.posts, 8);
    const RecomendedPosts = RecomendedPostsFilter(prop.posts, 8);

    return (
        <div className="site-content site-home-grid">
            <div className="min-w-0">
                <UpdateArticle posts={updatedPosts} />
                <RecommendArticle posts={RecomendedPosts} />
            </div>
            <div className="min-w-0">
                <IntroductionBox />
                <TwitterTimeLine />
                <SuzuriBanner />
            </div>
        </div>
    );
}
