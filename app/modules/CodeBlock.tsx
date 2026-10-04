'use client';

import { HTMLAttributes } from 'react';
import dynamic from 'next/dynamic';

// HTML要素を拡張するための型定義
interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
    inline?: boolean; // Make inline optional
}

// 重いライブラリを動的インポートに変更（~326 KiB削減）
const SyntaxHighlighterBlock = dynamic(
    async () => {
        const { Prism } = await import('react-syntax-highlighter');
        const { vscDarkPlus } = await import('react-syntax-highlighter/dist/cjs/styles/prism');
        const Component = ({ language, filename, children }: { language: string; filename?: string; children: string }) => (
            <div className="w-full overflow-x-auto max-w-full bg-black">
                {filename && <div className="px-4 my-1"><span className="text-white">{filename}</span></div>}
                <Prism style={vscDarkPlus} language={language} PreTag="div" showLineNumbers>
                    {children}
                </Prism>
            </div>
        );
        return Component;
    },
);

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    if (match === null || className === undefined) {
        return <code className="text">{children}</code>;
    }

    if (match[1] === "youtube") {
        const videoId = String(children).trim();
        if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return <code>{videoId}</code>;
        return <iframe className="w-full aspect-video" title="YouTube動画"
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
            allow="encrypted-media; picture-in-picture" allowFullScreen />;
    }

    if (match[1] === 'link') {
        return (
            <div className="max-w-2xl">
                <iframe className="mx-auto w-full dark:opacity-80 h-56 py-4"
                    src={`https://hatenablog-parts.com/embed?url=${children}`}
                    loading="lazy"
                />
            </div>
        );
    }

    if (match[1] === 'twitter') {
        const tweetId = String(children).trim();
        if (!/^\d+$/.test(tweetId)) return <code>{tweetId}</code>;
        return <a href={`https://x.com/i/status/${tweetId}`} target="_blank" rel="noopener noreferrer">Xで投稿を見る ↗</a>;
    }

    // コードハイライト
    const filename = className.split(':')[1];
    if (!inline && match) {
        return (
            <SyntaxHighlighterBlock language={match[1]} filename={filename}>
                {String(children).replace(/\\n$/, '')}
            </SyntaxHighlighterBlock>
        );
    }

    // インラインコード
    return <code className={className}>{children}</code>;
}

export default CodeBlock;
