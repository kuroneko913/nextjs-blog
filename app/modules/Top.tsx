import UpdateArticle from "./UpdateArticle";
import RecommendArticle from "./RecommendArticle";
import IntroductionBox from "./IntroductionBox";

export default function Top(prop) {
    return (
        <div className="flex p-10">
            <div>
                <UpdateArticle posts={prop.posts} />
                <RecommendArticle posts={prop.posts} />
            </div>
            <IntroductionBox />
        </div>
    );
}
