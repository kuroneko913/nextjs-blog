export class Dna {
    private _sequence: string;

    constructor(sequence: string) {
        this._sequence = sequence;
    }

    get sequence(): string {
        return this._sequence;
    }
}
