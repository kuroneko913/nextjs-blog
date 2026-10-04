import { ZennArticle } from '@/src/interfaces/post';
import HeartNum from './HeartNum';

export default function ZennArticleBox(prop: { article: ZennArticle }) {
    const { article } = prop;
    const updatedAt = new Date(article.body_updated_at).toLocaleDateString('ja-JP');
    return (
      <div className="site-card site-article-card flex-none group" key={article.slug}>
        <a href={`https://zenn.dev${article.path}`} target="_blank" rel="noopener" className="block">
          <div className="relative w-[280px] h-[200px] flex justify-center items-center text-6xl">
            {article.emoji}
          </div>
          <div className="relative mt-4">
            <h2 className="text-xl w-[280px] truncate">{article.title}</h2>
            <div className="absolute left-0 top-0 w-full hidden group-hover:flex group-hover:bg-[var(--site-soft)] pt-2 pb-2 z-10">
              <h2 className="text-sm">{article.title}</h2>
            </div>
          </div>
        </a>
        <div className="mt-2">
            <p className="text-sm w-[280px]">{updatedAt}</p>
            <HeartNum heartNum={article.liked_count} />
          </div>
      </div>
    );
}
