import fs from "fs";
import path from "path";
import matter from "gray-matter";

// 記事のディレクトリを指定
const postsDirectory = `${process.cwd()}/posts`;

// 記事の検索キーを指定
const allowedSearchKeys = {category: 'categories', tag: 'tags', archive: 'date'};

  /**
  * 記事のslugを取得する。
  * @returns array
  */
  export function getPostSlugs() {
    return fs.readdirSync(postsDirectory).map((filename) => {
      return filename.replace(/\.md$/, "");
    });
  }
  
  /**
   * slugを受けとって、記事を取得する。
   */
  export async function getPostBySlug(slug: string) {
    const decodedSlug = decodeURIComponent(slug);
    const filePath = path.join(postsDirectory, `${decodedSlug}.md`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const {data, content} = matter(fileContents);
    return {...data, slug:decodedSlug, content};
  }
  
  /**
   * 全記事を取得する。
   */
  export async function getAllPosts() {
    const slugs = getPostSlugs();
    return await Promise.all(slugs.map((slug) => getPostBySlug(slug)));
  }
  
  /**
   * 記事のキーで検索する。
   * @param array searchParams
   * @returns array 
   */
  export async function getPostsByCondition(searchParams: {}) {
    let posts = await getAllPosts();
    if (Object.keys(searchParams).length === 0) {
      return posts;
    }
    
    const key = Object.keys(searchParams)[0];
    const value = searchParams[key];
    if (!Object.keys(allowedSearchKeys).includes(key)) {
      return posts;
    }
    return posts.filter((post) => {
      const postKeyName = allowedSearchKeys[key];
      const postValues = post[postKeyName];
      if (postValues === undefined) {
        return false;
      }
      // 日付の場合は、年月のみで比較する。
      if (postKeyName === 'date') {
        const postDate = new Date(post.date).toLocaleDateString('ja-JP',{year:'numeric', month:'2-digit'});
        return postDate === value;
      }

      if (Array.isArray(postValues)) {
        return postValues.includes(value);
      }
      return postValues === value;
    });
  }

  /**
   * カテゴリーのリストを取得する。
   * @returns array
   */
  export async function getCategoryList() {
    let posts = await getAllPosts();
    let categories = {};
    posts.forEach((post) => {
      if (post.categories === undefined) {
        return;
      }
      post.categories.forEach((category) => {
        if (categories[category] === undefined) {
          categories[category] = 1;
          return;
        }
        categories[category] += 1;
      });
    });
    return categories;
  }

  /**
   * 投稿年月のリストを取得する。
   * @returns array
   */
  export async function getArchiveList() {
    let posts = await getAllPosts();
    let yearMonths = {};
    posts.forEach((post) => {
      const postDate = new Date(post.date).toLocaleDateString('ja-JP',{year:'numeric', month:'2-digit'});
      if (yearMonths[postDate] === undefined) {
        yearMonths[postDate] = 1;
        return;
      }
      yearMonths[postDate] += 1;
    });
    return yearMonths;
  }
