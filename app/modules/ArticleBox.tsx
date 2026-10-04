import Image from 'next/image';
import { Post } from "@/src/interfaces/post";
import LikeNum from './LikeNum';

export default function ArticleBox(prop: { post: Post, likeNum: number }) {
    const { post, likeNum } = prop;
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  
    return (
      <div className="site-card site-article-card flex-none group" key={post.slug}>
        <a href={`/blog/${post.slug}`}>
          {/* 画像部分 */}
          <div className="site-article-image relative overflow-hidden">
            <Image
              src={post.thumbnail}
              alt="Hero"
              fill
              sizes="(max-width: 600px) 100vw, 360px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="relative mt-4">
            <h2 className="text-lg font-semibold leading-relaxed" title={post.title}>{post.title}</h2>

          </div>
        </a>
        <div className="mt-2">
            <p className="text-sm">{post.date.toLocaleDateString('ja-JP', options)}</p>
            <p className="text-sm">{post.tags?.join(', ')}</p>
            <p className="text-sm">{post.categories?.join(', ')}</p>
            <LikeNum slug={post.slug} like={likeNum} />
        </div>
      </div>
    );
}
