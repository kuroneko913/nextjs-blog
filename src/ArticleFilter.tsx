import { Post } from "@/src/interfaces/post";

/**
 * 投稿を更新日時の降順でソートし、指定された件数分の投稿を返す
 * @param Post[] 投稿
 * @param int | null count 取得件数 nullの場合は全件取得
 * @returns Post[]
 */
export function UpdatedArticleFilter(posts: Post[], count : number|null = 3): Post[] {
    // 元の配列を上書きしないようにコピーを作成してそれをソートする
    const targetPosts = posts.filter((post) => {
        // aboutページは表示しない 
        if(post.slug === "about") return false;
        return true; 
    });
    const sortedPosts = targetPosts.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    });
    if (count === null) return sortedPosts;
    return sortedPosts.slice(0, count);
}

/**
 * おすすめタグのついた投稿を指定された件数分返す
 * @param Post[] posts 投稿
 * @param int count 取得件数
 * @returns Post[]
 */
export function RecomendedPostsFilter(posts: Post[], count : number = 10): Post[] {
    const targetPosts = posts.map((post) => { return post });
    const recomendedPosts = targetPosts.filter((post) => {
        if (post.slug === "about") return false;
        if (post.tags === undefined) return false;
        return post.tags.includes("オススメ");
    }).slice(0, count);
    const sortedPosts = recomendedPosts.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    });
    if (count === null) return sortedPosts;
    return sortedPosts;
};
