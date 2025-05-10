import { NextResponse } from 'next/server';
import { clock } from './logic';

export async function POST(req: Request): Promise<Response> {
    const reqBody = await req.json();
    const { arguments: { timezone } } = reqBody;
    const result = await clock({ timezone });
    return NextResponse.json(result);
}
