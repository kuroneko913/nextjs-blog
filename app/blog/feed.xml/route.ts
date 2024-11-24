import { NextRequest, NextResponse } from 'next/server';
import { Feed } from 'feed';
import { marked } from 'marked';
import { getPostsByCondition } from '@/src/fetch';

export async function GET(req: NextRequest): Promise<NextResponse> {
    const baseUrl = 'https://myblackcat913.com';

    const rssFeed = new Feed({
        id: `${baseUrl}/blog/feed.xml`,
        title: 'くろねこ。の実験室',
        description: '自由気ままに書くブログサイト',
        updated: new Date(),
        link: baseUrl,
        generator: 'Feed Generator',
        copyright: '© くろねこ。の実験室',
        language: 'ja',
    });

    try {
        const posts = await getPostsByCondition({});
        for (const post of posts) {
            const postUrl = `${baseUrl}/blog/${encodeURIComponent(post.slug)}`;
            let htmlContent = await marked(cleanString(post.content));
            htmlContent = convertRelativeToAbsolute(htmlContent, baseUrl); // 相対URLを絶対URLに変換
            htmlContent = escapeHtmlEntities(htmlContent); // HTMLエスケープ

            rssFeed.addItem({
                title: cleanString(post.title),
                id: postUrl,
                link: postUrl,
                description: cleanString(post.description),
                date: new Date(post.date),
                guid: postUrl,
                content: `${htmlContent}`,
            });
        }

        // RSS XMLを生成
        let rssXml = rssFeed.rss2();

        // atom:link を挿入
        const atomLink = `<atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom" />`;
        rssXml = rssXml.replace(
            '</channel>',
            `${atomLink}\n</channel>` // <channel> 内に atom:link を追加
        );

        return new NextResponse(rssXml, {
            headers: {
                'Content-Type': 'application/xml; charset=utf-8',
            },
            status: 200,
        });
    } catch (error) {
        console.error('Failed to generate RSS feed:', error);
        return new NextResponse('Failed to generate RSS feed', {
            status: 500,
        });
    }
}

function cleanString(input: string): string {
    return input
        .replace(/[\u0000-\u001F\u007F]/g, '') // 制御文字を削除
        .trim(); // 不要な空白を削除
}

function convertRelativeToAbsolute(content: string, baseUrl: string): string {
    return content.replace(/src="\/([^"]+)"/g, (match, path) => {
        return `src="${baseUrl}/${path}"`;
    });
}

function escapeHtmlEntities(input: string): string {
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
