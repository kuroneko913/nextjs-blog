import { AminoAcidsObject } from './AminoAcidsObject';
import { AminoAcid } from './AminoAcid';
import { MessangerRna } from '@/src/labs/GeneticCodes/MessangerRna';
import { Dna } from '@/src/labs/GeneticCodes/Dna';
import { randomInt } from 'crypto';

export class Encoder {
    private startCodon: string;
    private endCodon: string;
    private aminoAcids: AminoAcid[];

    /**
     * @param {AminoAcidsObject} aminoAcidsObject 鍵として利用するアミノ酸の構成情報
     */
    constructor(aminoAcidsObject: AminoAcidsObject) {
        this.startCodon = aminoAcidsObject.startCodon;
        this.endCodon = aminoAcidsObject.endCodon;
        this.aminoAcids = aminoAcidsObject.aminoAcids;
    }

    /**
     * 暗号化を実行する
     * @param {string} plainText 暗号化する文字列
     * @returns {Dna} 暗号化された結果(DNA)
     */
    execute(plainText:string): Dna {
        const aminoAcids = this.messageToAminoAcids(plainText);
        return this.encode(aminoAcids);
    }

    /**
     * アミノ酸列をDNAに変換する
     * @param {AminoAcid[][]} messageToaminoAcids アミノ酸列
     * @returns {Dna} 変換されたDNA
     */
    private encode = (messageToaminoAcids:AminoAcid[][]): Dna => {
        // アミノ酸列をコドン列に変換
        let codonList: string[][] = [];
        messageToaminoAcids.forEach((aminoAcids: AminoAcid[]) => {
            let codons = (aminoAcids.map((aminoAcid: AminoAcid) => {
                return aminoAcid.choicedCodon;
            }));
            codonList.push(codons);
        });

        // 開始コドンと終止コドンを追加
        codonList = this.applySpecialCodons(codonList);

        // mRNAを生成
        const mRna = new MessangerRna(
            this.padding(randomInt(100), this.aminoAcids) + codonList.join('') + this.padding(randomInt(100), this.aminoAcids)
        );

        // DNAを生成
        return mRna.reverseTranscript().replicate();
    };

    /**
     * 文字列をアミノ酸列に変換する
     * @param {string} plainText
     * @returns {AminoAcid[][]} アミノ酸列のリスト
     */
    private messageToAminoAcids = (plainText:string): AminoAcid[][] => {
        // 文字列をASCIIコード列に変換
       const asciiCodes = this.stringToAsciiCodes(plainText);

       // ASCIIコード列をアミノ酸列に変換
       const messageToaminoAcids = this.asciiCodesToAminoAcids(asciiCodes);
       return messageToaminoAcids;
    };

    /**
     * ASCIIコード列をアミノ酸列に変換
     * @param {Number[]} asciiCodes ASCIIコード列
     * @returns {AminoAcid[][]} アミノ酸列のリスト
     */
    private asciiCodesToAminoAcids = (asciiCodes: Number[]): AminoAcid[][] => {
        return asciiCodes.map((code: Number) => {
            const asciiCode = code as number;
            const aminoIds = this.base10ToN(asciiCode, 20);
            return aminoIds.map((aminoId: Number) => {
                const id = aminoId as number;
                return this.findByAminoAcidId(id, this.aminoAcids);
            });
        });
    };

    /**
     * 10進数の値をN進数に変換する
     * @param {number} num 10進数の値
     * @param {number} n N進数
     * @returns {number[]} N進数の値の配列
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
     * @param {number} id AminoAcidのID
     * @param {AminoAcid[]} aminoAcids AminoAcidのリスト
     * @returns {AminoAcid} 該当するAminoAcid
     */
    private findByAminoAcidId = (id: number, aminoAcids: AminoAcid[]): AminoAcid => {
        return aminoAcids.find((aminoAcid: AminoAcid) => aminoAcid.id === id) as AminoAcid;
    };

    /**
     * 文字列をASCIIコード列に変換
     * @param {string} message 文字列
     * @returns {Number[]} ASCIIコード列
     */
    private stringToAsciiCodes = (message: string): Number[] => {
        return message.split('').map(char => char.charCodeAt(0));
    };

    /**
     * 開始コドンと終止コドン以外のコドン列をランダムに生成し難読化する
     * @param {number} length 生成するコドン列の長さ
     * @param {AminoAcid[]} AminoAcids アミノ酸のリスト
     * @returns {string} コドン列
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

    /**
     * 開始コドンと終止コドンをコドン列に適用する
     * @param {string[][]} codonList コドン列
     * @returns {string[][]} 開始コドンと終止コドンを適用したコドン列
     */
    private applySpecialCodons = (codonList: string[][]): string[][] => {
        return codonList.map((codons) => {
            return [this.startCodon].concat(codons).concat([this.endCodon]);
        });
    }
}
