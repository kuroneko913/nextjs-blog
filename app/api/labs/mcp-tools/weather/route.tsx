import { NextResponse } from 'next/server';
import { weather } from './logic';

export async function POST(req: Request): Promise<Response> {
    const reqBody = await req.json();
    const { arguments: { location } } = reqBody;
    const result = await weather({ location });
    return NextResponse.json(result);
}
