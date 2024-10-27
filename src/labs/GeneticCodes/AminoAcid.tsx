export class AminoAcid {
    private _codons: string[];
    private _name: string;
    private _id: number;

    constructor(codons: string[], name: string, id: number) {
        this._codons = codons;
        this._name = name;
        this._id = id;
    }

    get codons(): string[] {
        return this._codons;
    }

    get choicedCodon(): string {
        const index = Math.floor(Math.random() * this._codons.length);
        return this._codons[index];
    }

    get name(): string {
        return this._name;
    }

    get id(): number {
        return this._id;
    }
}
