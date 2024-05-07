/**
 * 投稿を更新日時の降順でソートし、指定された件数分の投稿を返す
 * @param posts 投稿
 * @param count 取得件数
 * @returns 
 */
export function UpdatedArticleFilter(posts: [], count : number = 3) {
    // 元の配列を上書きしないようにコピーを作成してそれをソートする
    const targetPosts = posts.map((post) => { return post });
    const sortedPosts = targetPosts.sort((a, b) => {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return 0;
    });
    return sortedPosts.slice(0, count);
}

/**
 * おすすめタグのついた投稿を指定された件数分返す
 * @param posts 投稿
 * @param count 取得件数
 */
export function RecomendedPostsFilter(posts: [], count : number = 10) {
    const targetPosts = posts.map((post) => { return post });
    return targetPosts.filter((post) => {
        if (post.tags === undefined) return false;
        return post.tags.includes("オススメ");
    }).slice(0, count);
};
