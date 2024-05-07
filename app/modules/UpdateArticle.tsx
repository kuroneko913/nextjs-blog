import ArticleBox from './ArticleBox';

export default function UpdateArticle(prop) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return (
        <div className="py-10">
            <h1 className="text-2xl pb-10 font-bold">Update</h1>
            <div className="flex gap-8 flex-wrap justify-start items-start">
                {prop.posts.map((post) => (
                    <ArticleBox post={post} key={post.slug} />
                ))}
            </div>
        </div>
    );
}
