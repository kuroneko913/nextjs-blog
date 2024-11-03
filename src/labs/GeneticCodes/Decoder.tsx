import { Dna } from './Dna';
import { AminoAcid } from './AminoAcid';
import { MessangerRna } from './MessangerRna';

export class Decoder {
    private startCodon: string;
    private endCodon: string;
    private aminoAcids: AminoAcid[];

    /**
     * @param {{startCodon: string, endCodon: string, aminoAcids: {codons:string[], name:string, id:number}[]}} keyData 鍵として利用するアミノ酸の構成情報
     */
    constructor(keyData: {startCodon: string, endCodon: string, aminoAcids: {codons:string[], name:string, id:number}[]}) {
        this.startCodon = keyData.startCodon;
        this.endCodon = keyData.endCodon;
        this.aminoAcids = keyData.aminoAcids.map((acid: {codons:string[], name:string, id:number}) => {
            return new AminoAcid(acid.codons, acid.name, acid.id);
        });
    }

    /**
     * デコードを実行する
     * @param {string} encodedMessage
     * @return {string}
     */
    public execute(encodedMessage: string):string {
        const dna = new Dna(encodedMessage);
        const aminoAcidList = this.decode(dna);    
        return this.aminoToMessage(aminoAcidList);
    }

    /**
     * DNAをデコードしてアミノ酸列に変換する
     * @param {Dna} dna
     * @return {AminoAcid[][]}
     */
    private decode(dna: Dna):AminoAcid[][] {
        const mRna = dna.replicate().transcript();
        // スプライシング処理を行う
        const codonList = this.splicing(mRna);
        // コドン列をアミノ酸列に変換
        return codonList.map((codons) => {
            return codons.map((codon) => {
                for (const idx in this.aminoAcids) {
                    const aminoAcid = this.aminoAcids[idx];
                    if (aminoAcid.codons.includes(codon)) {
                        return aminoAcid;
                    }
                }
                // 存在しないコドンの場合はunknownを返す
                return new AminoAcid([], 'unknown', 1000);
            });
        });
    }

    /**
     * mRNAをスプライシングして意味のあるコドン列に変換する
     * @param {mRna} mRna
     * @return {string[][]}
     */
    private splicing(mRna: MessangerRna):string[][] {
        const codonSequences = mRna.sequence.match(/.{3}/g) ?? [];

        let collectFlag = false;
        let splicedCodons:string[] = [];
        let splicedCodonSequences:string[][] = [];
        codonSequences.forEach((codonSequence) => {
            if (codonSequence === this.startCodon && !collectFlag) {
                collectFlag = true;
                splicedCodons = [];
                return;
            }
            if (codonSequence === this.endCodon && collectFlag) {
                collectFlag = false;
                splicedCodonSequences.push(splicedCodons);
                splicedCodons = [];
                return;
            }
            if (!collectFlag) {
                return;
            }
            splicedCodons.push(codonSequence);
        });
        return splicedCodonSequences;
    }

    /**
     * アミノ酸列を文字列に変換する
     * @param {AminoAcid[][]} aminoAcids
     * @return {string}
     */
    private aminoToMessage(aminoAcids: AminoAcid[][]):string {
        // 20進数の数字列を10進数に変換
        const asciiCodes = aminoAcids.map((aminoAcids) => {
            return aminoAcids.map((aminoAcid) => {
                return aminoAcid.id;
            }).reduce((acc:number, id) => {
                return acc * 20 + id;
            }, 0);
        });
    
        // 10進数の数字列を文字列に変換
        return asciiCodes.map((asciiCode) => {
            return String.fromCharCode(Number(asciiCode));
        }).join('');
    }
}
