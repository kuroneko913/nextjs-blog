import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
    //TODO: Implement POST method 
    console.log(req.body);
    return NextResponse.json({ message: 'ATGCCCCAAGGAA' });
}
