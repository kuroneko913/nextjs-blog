import { AminoAcid } from './AminoAcid';

export class AminoAcidsObject {
    private _aminoAcids: AminoAcid[];
    private _startCodon: string;
    private _endCodon: string;

    constructor(aminoAcids: AminoAcid[], startCodon: string, endCodon: string) {
        this._aminoAcids = aminoAcids;
        this._startCodon = startCodon;
        this._endCodon = endCodon;
    }

    get aminoAcids(): AminoAcid[] {
        return this._aminoAcids;
    }

    get startCodon(): string {
        return this._startCodon;
    }

    get endCodon(): string {
        return this._endCodon;
    }
}
