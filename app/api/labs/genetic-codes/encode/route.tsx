import { AminoAcid } from '@/src/labs/GeneticCodes/AminoAcid';
import { AminoAcidsFactory } from '@/src/labs/GeneticCodes/AminoAcidsFactory';
import { AminoAcidsObject } from '@/src/labs/GeneticCodes/AminoAcidsObject';
import { Encoder } from '@/src/labs/GeneticCodes/Encoder';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest): Promise<NextResponse> {

    const generateKeyData = (): AminoAcidsObject => {
        return new AminoAcidsFactory().createAminoAcids();
    };

    const getKeyData = (keyData: any): AminoAcidsObject => {
        const AminoAcids = keyData.aminoAcids.map((aminoAcid: any) => {
            return new AminoAcid(aminoAcid._codons, aminoAcid._name, aminoAcid._id);
        });
        return new AminoAcidsObject(AminoAcids, keyData.startCodon, keyData.endCodon);
    };

    const reqBody = await req.json();
    const plainText = reqBody.message;
    const keyData = reqBody.keyData;

    if (!plainText) {
        return NextResponse.json({ message: '暗号化する文字列がありません' });
    }

    // 鍵データがない場合は新規生成、ある場合はそのデータを使う
    const aminoAcidsObject = keyData ? getKeyData(keyData) : generateKeyData();
    const encoder = new Encoder(aminoAcidsObject);
    const dna = encoder.execute(plainText);

    return NextResponse.json(
        {
            message: dna.sequence,
            keyData: {
                aminoAcids: aminoAcidsObject.aminoAcids,
                startCodon: aminoAcidsObject.startCodon,
                endCodon: aminoAcidsObject.endCodon,
            }
        }
    );
}
