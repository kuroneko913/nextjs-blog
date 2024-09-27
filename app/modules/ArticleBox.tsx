import Image from 'next/image';
import { Post } from "@/src/interfaces/post";
import LikeNum from './LikeNum';

export default function ArticleBox(prop: { post: Post }) {
    const { post } = prop;
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  
    return (
      <div className="flex-none w-[280px] group hover:bg-gray-100" key={post.slug}>
        <a href={`/blog/${post.slug}`}>
          {/* 画像部分 */}
          <div className="relative w-[280px] h-[200px] overflow-hidden">
            <Image
              src="/images/hero.webp"
              alt="Hero"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="relative mt-4">
            <h2 className="text-xl w-[280px] truncate">{post.title}</h2>
            <div className="absolute left-0 top-0 w-full group-hover:bg-gray-100 p-2 z-10 hidden group-hover:flex">
              <h2 className="text-xl">{post.title}</h2>
            </div>
          </div>
        </a>
        <div className="mt-2 group-hover:pt-16">
            <p className="text-sm w-[280px] group-hover:p-2">{post.date.toLocaleDateString('ja-JP', options)}</p>
            <p className="text-sm w-[280px] group-hover:p-2">{post.tags?.join(', ')}</p>
            <p className="text-sm w-[280px] group-hover:p-2">{post.categories?.join(', ')}</p>
            <LikeNum slug={post.slug} />
        </div>
      </div>
    );
}
