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

const YoutubeEmbed = dynamic(
    async () => {
        const { default: Youtube } = await import('react-youtube');
        const Component = ({ videoId }: { videoId: string }) => (
            <div className="youtube-wrap">
                <Youtube videoId={videoId} />
            </div>
        );
        return Component;
    },
    { ssr: false }
);

const TweetEmbed = dynamic(
    async () => {
        const { Tweet } = await import('react-twitter-widgets');
        const Component = ({ tweetId }: { tweetId: string }) => <Tweet tweetId={tweetId} />;
        return Component;
    },
    { ssr: false }
);

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    if (match === null || className === undefined) {
        return <code className="text">{children}</code>;
    }

    if (match[1] === "youtube") {
        return <YoutubeEmbed videoId={String(children).replace(/\n$/, '')} />;
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
        return <TweetEmbed tweetId={String(children).replace(/\n$/, '')} />;
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
