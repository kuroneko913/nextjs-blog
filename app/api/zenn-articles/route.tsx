import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// GETリクエストの処理
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // クエリパラメータからusernameを取得
        const username = req.nextUrl.searchParams.get('username');
        
        // ユーザー名がない場合、400 Bad Requestを返す
        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        // Zenn APIへのリクエストを行う
        const res = await axios.get(`https://zenn.dev/api/articles?username=${username}`);

        // APIレスポンスをクライアントに返す
        return NextResponse.json({articles: res.data.articles}, { status: 200 });
    } catch (error) {
        // エラーが発生した場合の処理
        console.error('Error fetching articles:', error);

        return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
    }
}
