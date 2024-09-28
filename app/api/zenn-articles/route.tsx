import axios from 'axios';
import { NextResponse } from 'next/server';

// GETリクエストの処理
export async function GET(): Promise<NextResponse> {
    try {
        // Zenn APIへのリクエストを行う
        const username = 'kuroneko913';
        const res = await axios.get(`https://zenn.dev/api/articles?username=${username}`);

        // APIレスポンスをクライアントに返す
        return NextResponse.json({articles: res.data.articles}, { status: 200 });
    } catch (error) {
        // エラーが発生した場合の処理
        console.error('Error fetching articles:', error);

        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}
