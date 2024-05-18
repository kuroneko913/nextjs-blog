import { UpdatedArticleFilter } from "@/src/ArticleFilter";
import CategoryArchive from "./CategoryArchive";
import BlogList from "./BlogList";

export default function Blog(prop) {
    const updatedPosts = UpdatedArticleFilter(prop.posts, null);

    return (
        <div className="flex p-10">
            <BlogList posts={updatedPosts} />
            <CategoryArchive />
        </div>
    );
}
