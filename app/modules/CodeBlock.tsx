'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Youtube from 'react-youtube';
import { Tweet } from 'react-twitter-widgets';
import { HTMLAttributes } from 'react';

// HTML要素を拡張するための型定義
interface CodeBlockProps extends HTMLAttributes<HTMLElement> {
    inline?: boolean; // Make inline optional
}

const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    if (match === null || className === undefined) {
        return <code className="text">{children}</code>;
    }

    if (match[1] === "youtube") {
        return (
            <div className="youtube-wrap">
                <Youtube videoId={String(children).replace(/\n$/, '')} />
            </div>
        );
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
        return (
            <Tweet tweetId={String(children).replace(/\n$/, '')} />
        );
    }

    // コードハイライト
    const filename = className.split(':')[1];
    if (!inline && match) {
        return (
            <div className="w-full overflow-x-auto max-w-full bg-black">
                {filename && <div className="px-4 my-1"><span className="text-white">{filename}</span></div>}
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    showLineNumbers={true}
                >
                    {String(children).replace(/\\n$/, '')}
                </SyntaxHighlighter>
            </div>
        );
    }

    // インラインコード
    return <code className={className}>{children}</code>;
}

export default CodeBlock;
