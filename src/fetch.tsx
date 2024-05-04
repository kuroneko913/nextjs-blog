import fs from "fs";
import path from "path";
import matter from "gray-matter";

// 記事のディレクトリを指定
const postsDirectory = `${process.cwd()}/posts`;

/**
 * 記事のslugを取得する。
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
  