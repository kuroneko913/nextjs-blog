import { NextResponse } from 'next/server';
import { AminoAcidsFactory } from '@/src/labs/GeneticCodes/AminoAcidsFactory';

export async function POST(): Promise<NextResponse> {
    const aminoAcidsObject = new AminoAcidsFactory().createAminoAcids();
    return NextResponse.json({
        message: '鍵の生成に成功しました',
        keyData: aminoAcidsObject.toJson()
    });
}
