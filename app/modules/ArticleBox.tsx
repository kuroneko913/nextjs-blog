import Image from 'next/image';

export default function ArticleBox(prop) {
    const { post } = prop;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return (
        <div className="flex-none w-[280px]" key={post.slug}>
            <a href={`/blog/${post.slug}`}>
                <div className="relative w-[280px] h-[200px] overflow-hidden">
                    <Image layout="fill" objectFit="cover" src="/images/hero.webp" alt="Hero"/>
                </div>
                <h2 className="text-xl mt-4 w-[280px] truncate">{post.title}</h2>
                <p className="text-sm w-[280px]">{post.date.toLocaleDateString('ja-JP', options)}</p>
                <p className="text-sm w-[280px]">{post.tags?.join(',')}</p>
            </a>
        </div>
    );
}
