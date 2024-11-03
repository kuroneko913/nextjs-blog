import { AminoAcid } from '@/src/labs/GeneticCodes/AminoAcid';
import { Dna } from '@/src/labs/GeneticCodes/Dna';
import { NextRequest, NextResponse } from 'next/server';

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

    let decodedMessage = '';
    // DNAをmRNAに変換
    const dna = new Dna(encodedMessage);
    const mRna = dna.replicate().transcript();
    // スプライシング処理を行う
    const startCodon:string = keyData.startCodon;
    const endCodon:string = keyData.endCodon;
    const aminoAcids:AminoAcid[] = keyData.aminoAcids.map((acid: {codons:string[], name:string, id:number}) => {
        return new AminoAcid(acid.codons, acid.name, acid.id);
    });
    // mRNAをコドン列に変換
    const codonList = mRna.sequence.split(startCodon).map((codon) => {
        return codon.split(endCodon)[0];
    }).map((codons)=>{
        return codons.match(/.{3}/g);
    });
    // コドン列をアミノ酸列に変換
    const aminoAcidLists = codonList.map((codons) => {
        return codons?.map((codon) => {
            for (const idx in aminoAcids) {
                const aminoAcid = aminoAcids[idx];
                if (aminoAcid.codons.includes(codon)) {
                    return aminoAcid;
                }
            }
        });
    });

    // アミノ酸列を20進数の数字列に変換
    const aminoAcidIds = aminoAcidLists.map((aminoAcids) => {
        return aminoAcids?.map((aminoAcid) => {
            return aminoAcid?.id || 0;
        });
    });

    // 20進数の数字列を10進数に変換
    const asciiCodes = aminoAcidIds.map((aminoAcidIds) => {
        return aminoAcidIds?.reduce((acc:number, id) => {
            return acc * 20 + id;
        }, 0);
    });

    // 10進数の数字列を文字列に変換
    decodedMessage = asciiCodes.map((asciiCode) => {
        return String.fromCharCode(Number(asciiCode));
    }).join('');

    return NextResponse.json({ message: decodedMessage });
}
