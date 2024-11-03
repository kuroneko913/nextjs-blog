import { NextRequest, NextResponse } from 'next/server';
import { Decoder } from '@/src/labs/GeneticCodes/Decoder';

export async function POST(req: NextRequest): Promise<NextResponse> {
    const reqBody = await req.json();
    const encodedMessage = reqBody.message;
    const keyData = reqBody.keyData;
    if (encodedMessage === '') {
        return NextResponse.json({ message: '暗号化された文字列を指定してください' });
    }
    if (!keyData) {
        return NextResponse.json({ message: '鍵が指定されていません。復号できませんでした' });
    }

    const decoder = new Decoder(keyData);
    const decodedMessage = decoder.execute(encodedMessage);

    return NextResponse.json({ message: decodedMessage });
}
