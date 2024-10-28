import { AminoAcid } from "./AminoAcid";
import { AminoAcidsObject } from "./AminoAcidsObject";

export class AminoAcidsFactory {
    createAminoAcids(): AminoAcidsObject {
        // アミノ酸に割り当てる番号をランダムに生成する
        const aminoNums = this.shuffleArray((new Array(20)).fill(0).map((_, i) => i));
        let AminoAcids = aminoNums.map((num: number) => {
            const name = this.aminoAcidNames[num];
            return new AminoAcid([], name, num);
        });
        // コドンを生成して割り当て
        const codonPatterns = this.createCodonPattern();
        // Fisher-Yates shuffleを適用してコドンをシャッフル
        this.shuffleArray(codonPatterns);
        // 開始コドンと終了コドンを取得
        const startCodon = codonPatterns.length > 0 ? codonPatterns.pop() : '';
        const endCodon = codonPatterns.length > 0 ? codonPatterns.pop() : '';
        // それぞれのアミノ酸に1つだけコドンを割り当てる
        AminoAcids.forEach(AminoAcid => {
            const codon = codonPatterns.pop();
            if (!codon) {
                return;
            }
            AminoAcid.codons.push(codon);
        });
        // それぞれのアミノ酸にランダムに残りのコドンを割り当てる
        codonPatterns.forEach(pattern => {
            const index = Math.floor(Math.random() * 20);
            AminoAcids[index].codons.push(pattern);
        });
        // 開始コドンと終了コドンを持つアミノ酸(実在しない)を追加
        AminoAcids.push(new AminoAcid([startCodon ?? ''], 'Start', 20));
        AminoAcids.push(new AminoAcid([endCodon ?? ''], 'End', 21));
        return new AminoAcidsObject(AminoAcids, startCodon ?? '', endCodon ?? '');
    }

    generateAminoAcidNumbers() {
        return this.shuffleArray(this.aminoAcidNames);
    }

    createCodonPattern() {
        const codonpatterns: string[] = [];
        ['U', 'A', 'G', 'C'].forEach((base1) => {
            ['U', 'A', 'G', 'C'].forEach((base2) => {
                ['U', 'A', 'G', 'C'].forEach((base3) => {
                    codonpatterns.push(base1 + base2 + base3);
                });
            });
        });
        return codonpatterns;
    }

    aminoAcidNames = [
        'Ala', 'Arg', 'Asn', 'Asp', 'Cys', 'Gln', 'Glu', 'Gly', 'His', 'Ile',
        'Leu', 'Lys', 'Met', 'Phe', 'Pro', 'Ser', 'Thr', 'Trp', 'Tyr', 'Val', 
        'Start','End',
    ];

    // Fisher-Yates shuffle
    shuffleArray = (array: any[]) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };
}
