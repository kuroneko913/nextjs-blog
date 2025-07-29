import axios from 'axios';
import { NextResponse } from 'next/server';

// キャッシュ用のインメモリストレージ
let cachedData: { articles: any[], timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15分

// GETリクエストの処理
export async function GET(): Promise<NextResponse> {
    try {
        const now = Date.now();
        
        // キャッシュが有効かチェック
        if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
            return NextResponse.json(
                { articles: cachedData.articles, cached: true }, 
                { 
                    status: 200,
                    headers: {
                        'Cache-Control': 'public, max-age=900', // 15分のブラウザキャッシュ
                        'X-Cache-Status': 'HIT'
                    }
                }
            );
        }

        // Zenn APIへのリクエストを行う
        const username = 'kuroneko913';
        const res = await axios.get(`https://zenn.dev/api/articles?username=${username}`, {
            timeout: 10000, // 10秒のタイムアウト
        });

        // キャッシュを更新
        cachedData = {
            articles: res.data.articles,
            timestamp: now
        };

        // APIレスポンスをクライアントに返す
        return NextResponse.json(
            { articles: res.data.articles, cached: false }, 
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'public, max-age=900', // 15分のブラウザキャッシュ
                    'X-Cache-Status': 'MISS'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching articles:', error);

        // エラー時は古いキャッシュがあれば返す
        if (cachedData) {
            return NextResponse.json(
                { articles: cachedData.articles, cached: true, stale: true }, 
                { 
                    status: 200,
                    headers: {
                        'Cache-Control': 'public, max-age=300', // 5分の短いキャッシュ
                        'X-Cache-Status': 'STALE'
                    }
                }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch articles', details: error instanceof Error ? error.message : 'Unknown error' }, 
            { status: 500 }
        );
    }
}
