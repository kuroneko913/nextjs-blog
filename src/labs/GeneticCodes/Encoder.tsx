import { AminoAcidsObject } from './AminoAcidsObject';
import { AminoAcid } from './AminoAcid';
import { MessangerRna } from '@/src/labs/GeneticCodes/MessangerRna';
import { Dna } from '@/src/labs/GeneticCodes/Dna';
import { randomInt } from 'crypto';

export class Encoder {
    private _aminoAcidsObject: AminoAcidsObject;

    constructor(aminoAcidsObject: AminoAcidsObject) {
        this._aminoAcidsObject = aminoAcidsObject;
    }

    get aminoAcidsObject(): AminoAcidsObject {
        return this._aminoAcidsObject;
    }

    /**
     * 暗号化を実行する
     * @param plainText 暗号化する文字列
     * @returns Dna 暗号化された結果(DNA)
     */
    execute(plainText:string): Dna {
        const aminoAcids = this.messageToAminoAcids(plainText);
        return this.encode(aminoAcids);
    }

    /**
     * アミノ酸列をDNAに変換する
     * @param AminoAcid[][] messageToaminoAcids アミノ酸列
     * @return Dna
     */
    private encode = (messageToaminoAcids:AminoAcid[][]): Dna => {
        const startCodon = this.aminoAcidsObject.startCodon;
        const endCodon = this.aminoAcidsObject.endCodon;
        const aminoAcids = this.aminoAcidsObject.aminoAcids;

        // アミノ酸列をコドン列に変換
        let codonList: string[] = [];
        messageToaminoAcids.forEach((aminoAcids: AminoAcid[]) => {
            let codons = [startCodon];
            codons = codons.concat(aminoAcids.map((aminoAcid: AminoAcid) => {
                return aminoAcid.choicedCodon;
            }));
            codons.push(endCodon);
            codonList = codonList.concat(codons);
        });

        // mRNAを生成
        const mRna = new MessangerRna(
            this.padding(randomInt(100), aminoAcids) + codonList.join('') + this.padding(randomInt(100), aminoAcids)
        );

        // DNAを生成
        return mRna.reverseTranscript().replicate();
    };

    /**
     * 文字列をアミノ酸列に変換する
     * @param string plainText
     * @returns AminoAcid[][]
     */
    private messageToAminoAcids = (plainText:string): AminoAcid[][] => {
        // 文字列をASCIIコード列に変換
       const asciiCodes = this.stringToAsciiCodes(plainText);

       // ASCIIコード列をアミノ酸列に変換
       const aminoAcids = this._aminoAcidsObject.aminoAcids;
       const messageToaminoAcids = this.asciiCodesToAminoAcids(asciiCodes, aminoAcids);
       return messageToaminoAcids;
    };

    /**
     * ASCIIコード列をアミノ酸列に変換
     * @param Number[] asciiCodes ASCIIコード列
     * @param AminoAcid[] aminoAcids アミノ酸のリスト
     * @returns AminoAcid[][] アミノ酸列
     */
    private asciiCodesToAminoAcids = (asciiCodes: Number[], aminoAcids:AminoAcid[]): AminoAcid[][] => {
        return asciiCodes.map((code: Number) => {
            const asciiCode = code as number;
            const aminoIds = this.base10ToN(asciiCode, 20);
            return aminoIds.map((aminoId: Number) => {
                const id = aminoId as number;
                return this.findByAminoAcidId(id, aminoAcids);
            });
        });
    };

    /**
     * 10進数の値をN進数に変換する
     * @param number num 10進数の値
     * @param number n N進数
     * @returns number[] N進数の値の配列
     */
    private base10ToN = (num: number, n: number): number[] => {
        let result: number[] = [];
        while (num > 0) {
            result.unshift(num % n);
            num = Math.floor(num / n);
        }
        return result;
    };

    /**
     * AminoAcidのIDから該当するAminoAcidを取得する
     * @param int id AminoAcidのID
     * @param AminoAcid[] aminoAcids AminoAcidのリスト
     * @returns AminoAcid 該当するAminoAcid
     */
    private findByAminoAcidId = (id: number, aminoAcids: AminoAcid[]): AminoAcid => {
        return aminoAcids.find((aminoAcid: AminoAcid) => aminoAcid.id === id) as AminoAcid;
    };

    /**
     * 文字列をASCIIコード列に変換
     * @param string message 文字列
     * @returns Number[] ASCIIコード列
     */
    private stringToAsciiCodes = (message: string): Number[] => {
        return message.split('').map(char => char.charCodeAt(0));
    };

    /**
     * 開始コドンと終止コドン以外のコドン列をランダムに生成し難読化する
     * @param int length 生成するコドン列の長さ
     * @param AminoAcid[] AminoAcids アミノ酸のリスト
     * @returns string コドン列
     */
    private padding = (length: number = 30, AminoAcids: AminoAcid[]): string => {
        let result = '';
        for (let i = 0; i < length; i++) {
            const aminoId = randomInt(0, 19);
            const aminoAcid = this.findByAminoAcidId(aminoId, AminoAcids);
            if (aminoAcid) {
                result += aminoAcid.choicedCodon;
            }
        }
        return result;
    };
}
