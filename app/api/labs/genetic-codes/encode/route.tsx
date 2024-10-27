import { AminoAcid } from '@/src/labs/GeneticCodes/AminoAcid';
import { AminoAcidsFactory } from '@/src/labs/GeneticCodes/AminoAcidsFactory';
import { MessangerRna } from '@/src/labs/GeneticCodes/MessangerRna';
import { randomInt } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {

    const initialize = (): [AminoAcid[], string, string] => {
        const aminoAcidsFactory = new AminoAcidsFactory();
        let AminoAcids: AminoAcid[] = [];
        let startCodon: string = '';
        let endCodon: string = '';
        [AminoAcids, startCodon, endCodon] = aminoAcidsFactory.createAminoAcids();
        return [AminoAcids, startCodon, endCodon];
    };

    const stringToAsciiCodes = (message: string): Number[] => {
        return message.split('').map(char => char.charCodeAt(0));
    };

    const base10ToN = (num: number, n: number): Number[] => {
        let result: Number[] = [];
        while (num > 0) {
            result.push(num % n);
            num = Math.floor(num / n);
        }
        return result.reverse();
    };

    const findByAminoAcidId = (id: number, aminoAcids: AminoAcid[]): AminoAcid => {
        return aminoAcids.find((aminoAcid: AminoAcid) => aminoAcid.id === id) as AminoAcid;
    };

    // ASCIIコード列をアミノ酸列に変換
    const asciiCodesToAminoAcids = (asciiCodes: Number[], aminoAcids:AminoAcid[]): AminoAcid[][] => {
        return asciiCodes.map((code: Number) => {
            const asciiCode = code as number;
            const aminoIds = base10ToN(asciiCode, 20);
            return aminoIds.map((aminoId: Number) => {
                const id = aminoId as number;
                return findByAminoAcidId(id, aminoAcids);
            });
        });
    };

    // 開始コドンと終止コドン以外のコドン列をランダムに生成し難読化する
    const padding = (length: number = 30): string => {
        let result = '';
        for (let i = 0; i < length; i++) {
            const aminoId = randomInt(0, 19);
            const aminoAcid = findByAminoAcidId(aminoId, AminoAcids);
            if (aminoAcid) {
                result += aminoAcid.choicedCodon;
            }
        }
        return result;
    };

    const reqBody = await req.json();
    const plainText = reqBody.message;

    if (!plainText) {
        return NextResponse.json({ message: '暗号化する文字列がありません' });
    }

    let AminoAcids: AminoAcid[] = [];
    let startCodon: string = '';
    let endCodon: string = '';
    [AminoAcids, startCodon, endCodon] = initialize();

    // 文字列 -> ASCIIコード -> アミノ酸列 -> コドン列(mRNA) -> DNA 
    const asciiCodes = stringToAsciiCodes(plainText);
    const messageToaminoAcids = asciiCodesToAminoAcids(asciiCodes, AminoAcids);
    console.log(messageToaminoAcids);
    let codonList: string[] = [];
    messageToaminoAcids.forEach((aminoAcids: AminoAcid[]) => {
        let codons = [startCodon];
        codons = codons.concat(aminoAcids.map((aminoAcid: AminoAcid) => {
            return aminoAcid.choicedCodon;
        }));
        codons.push(endCodon);
        codonList = codonList.concat(codons);
    });
    const mRna = new MessangerRna(padding(randomInt(100)) + codonList.join('') + padding(randomInt(100)));
    console.log(mRna.complementaryDna);
    return NextResponse.json({ message: mRna.complementaryDna.sequence });
}
