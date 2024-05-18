'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Youtube from 'react-youtube';
import { Tweet } from 'react-twitter-widgets';

export const CodeBlock = ({ inline, className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
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
            <>
                <div className="filename">{filename}</div>
                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" children={String(children).replace(/\\n$/, '')} />
            </>   
        );
    }

    // インラインコード
    return <code className={className}>{children}</code>;
}
