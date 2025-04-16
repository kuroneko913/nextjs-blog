import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<Response> {
    const reqBody = await req.json();
    const { arguments: { location } } = reqBody;
    const description = "晴れ"; // ここではダミーの天気情報を使用しています
    const temp = "25"; // ここではダミーの気温情報を使用しています

    // ChatGPTが呼び出せるようにMCPツールのレスポンスを生成
    return NextResponse.json({
        "tool_response": {
            "name": "get_weather",
            "result":`${location}の天気は${description}で気温は${temp}℃です。`,
        },
    });
}
