import { UpdatedArticleFilter } from "@/src/ArticleFilter";
import CategoryArchive from "./CategoryArchive";
import BlogList from "./BlogList";
import { getCategoryList, getArchiveList } from "@/src/fetch";

export default async function Blog(prop) {
    const { posts } = prop;
    const updatedPosts = UpdatedArticleFilter(posts, null);
    const categories = await getCategoryList();
    const archives = await getArchiveList();

    return (
        <div className="flex p-10">
            <BlogList posts={updatedPosts} />
            <CategoryArchive categories={categories} archives={archives} />
        </div>
    );
}
