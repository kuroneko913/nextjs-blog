import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post, SearchParams, AllowedSearchKeys, Categories, ArchiveDates, Archives } from "@/src/interfaces/post";

// 記事のディレクトリを指定
const postsDirectory = `${process.cwd()}/posts`;

// 記事の検索キーを指定
const allowedSearchKeys:AllowedSearchKeys = {category: 'categories', tag: 'tags', archive: 'date'};

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
  export async function getPostBySlug(slug: string): Promise<Post> {
    const decodedSlug = decodeURIComponent(slug);
    const filePath = path.join(postsDirectory, `${decodedSlug}.md`);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const {data, content} = matter(fileContents);
    return {...data, slug:decodedSlug, content} as Post;
  }
  
  /**
   * 全記事を取得する。
   * @returns Promise<Post[]>
   */
  export async function getAllPosts(): Promise<Post[]> {
    const slugs = getPostSlugs();
    return await Promise.all(slugs.map((slug) => getPostBySlug(slug)));
  }
  
  /**
   * 記事のキーで検索する。
   * @param array searchParams
   * @returns array 
   */
  export async function getPostsByCondition(searchParams:SearchParams): Promise<Post[]> {
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
      const postValues = post[postKeyName as keyof Post];
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
  export async function getCategoryList(): Promise<{}> {
    let posts = await getAllPosts();
    let categories:Categories = {};
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
    let yearMonths:ArchiveDates = {};
    let years:Archives = {};
    posts.forEach((post) => {
      const postDate = new Date(post.date).toLocaleDateString('ja-JP',{year:'numeric', month:'2-digit'});
      if (yearMonths[postDate] === undefined) {
        yearMonths[postDate] = 1;
        return;
      }
      yearMonths[postDate] += 1;
    });
    for (const yearMonth in yearMonths) {
      const year = yearMonth.split('/')[0];
      years[year][yearMonth] = yearMonths[yearMonth];
    }

    return years;
  }
