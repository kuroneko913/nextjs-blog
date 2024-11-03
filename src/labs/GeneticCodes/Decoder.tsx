import { Dna } from './Dna';
import { AminoAcid } from './AminoAcid';

export class Decoder {
    private startCodon: string;
    private endCodon: string;
    private aminoAcids: AminoAcid[];

    constructor(private keyData: any) {
        this.startCodon = keyData.startCodon;
        this.endCodon = keyData.endCodon;
        this.aminoAcids = keyData.aminoAcids.map((acid: {codons:string[], name:string, id:number}) => {
            return new AminoAcid(acid.codons, acid.name, acid.id);
        });
    }

    execute(encodedMessage: string):string {
        // DNAをmRNAに変換
        const dna = new Dna(encodedMessage);
        const aminoAcidList = this.decode(dna);    
        return this.aminoToMessage(aminoAcidList);
    }

    decode(dna: Dna):AminoAcid[][] {
        const mRna = dna.replicate().transcript();
        // スプライシング処理を行う
        // mRNAをコドン列に変換
        const codonList = mRna.sequence.split(this.startCodon).map((codon) => {
            return codon.split(this.endCodon)[0];
        }).map((codons)=>{
            return codons.match(/.{3}/g) ?? [];
        });
        // コドン列をアミノ酸列に変換
        return codonList.map((codons) => {
            return codons.map((codon) => {
                for (const idx in this.aminoAcids) {
                    const aminoAcid = this.aminoAcids[idx];
                    if (aminoAcid.codons.includes(codon)) {
                        return aminoAcid;
                    }
                }
                return new AminoAcid([], 'unknown', 1000);
            });
        });
    }

    aminoToMessage(aminoAcids: AminoAcid[][]):string {
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
