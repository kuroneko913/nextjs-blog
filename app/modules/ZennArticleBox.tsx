import { ZennArticle } from '@/src/interfaces/post';
import HeartNum from './HeartNum';

export default function ZennArticleBox(prop: { article: ZennArticle }) {
    const { article } = prop;
    const updatedAt = new Date(article.body_updated_at).toLocaleDateString('ja-JP');
    return (
      <div className="flex-none w-[280px] group hover:bg-gray-100" key={article.slug}>
        <a href={`https://zenn.dev${article.path}`} target="_blank" rel="noopener" className="block">
          <div className="relative w-[280px] h-[200px] flex justify-center items-center text-6xl">
            {article.emoji}
          </div>
          <div className="relative mt-4">
            <h2 className="text-xl w-[280px] truncate">{article.title}</h2>
            <div className="absolute left-0 top-0 w-full hidden group-hover:flex group-hover:bg-gray-100 items-center justify-center p-2 z-10">
              <h2 className="text-xl">{article.title}</h2>
            </div>
          </div>
        </a>
        <div className="mt-2 group-hover:pt-16">
            <p className="text-sm w-[280px] group-hover:p-2">{updatedAt}</p>
            <HeartNum heartNum={article.liked_count} />
          </div>
      </div>
    );
}
