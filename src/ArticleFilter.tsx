/**
 * 投稿を更新日時の降順でソートし、指定された件数分の投稿を返す
 * @param array posts 投稿
 * @param int | null count 取得件数 nullの場合は全件取得
 * @returns array
 */
export function UpdatedArticleFilter(posts: [], count : number|null = 3) {
    // 元の配列を上書きしないようにコピーを作成してそれをソートする
    const targetPosts = posts.map((post) => { return post });
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
 * @param array posts 投稿
 * @param int count 取得件数
 * @returns array
 */
export function RecomendedPostsFilter(posts: [], count : number = 10) {
    const targetPosts = posts.map((post) => { return post });
    return targetPosts.filter((post) => {
        if (post.tags === undefined) return false;
        return post.tags.includes("オススメ");
    }).slice(0, count);
};
