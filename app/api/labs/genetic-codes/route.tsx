import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    //TODO: Implement POST method 
    return NextResponse.json({ message: 'Hello, World!' });
}
