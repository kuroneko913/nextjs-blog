import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post } from "@/src/interfaces/post";

// 記事のディレクトリを指定
const postsDirectory = `${process.cwd()}/about`;
const filename = "about.md";

/**
 * aboutページを取得する。
 * @returns Post
 */
export function getPost() {
  const fileContents = fs.readFileSync(path.join(postsDirectory, filename), "utf8");
  const {data, content} = matter(fileContents);
  return {...data, content} as Post;
}
