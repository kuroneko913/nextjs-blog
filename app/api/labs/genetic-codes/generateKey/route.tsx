import { NextResponse } from 'next/server';
import { AminoAcid } from '@/src/labs/GeneticCodes/AminoAcid';
import { AminoAcidsFactory } from '@/src/labs/GeneticCodes/AminoAcidsFactory';

export async function POST(): Promise<NextResponse> {
    const toJson = (aminoAcids: AminoAcid[]): any => {
        return {
            aminoAcids: aminoAcids.map((aminoAcid: AminoAcid) => {
                return {
                    id: aminoAcid.id,
                    name: aminoAcid.name,
                    codons: aminoAcid.codons,
                };
            }),
        };
    };

    const aminoAcidsObject = new AminoAcidsFactory().createAminoAcids();
    return NextResponse.json({
        message: '鍵の生成に成功しました',
        keyData: toJson(aminoAcidsObject.aminoAcids)
    });
}
