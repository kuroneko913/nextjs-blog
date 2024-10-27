import { Dna } from './Dna';
export class MessangerRna {
    private _sequence: string;

    constructor(sequence: string) {
        this._sequence = sequence;
    }

    complementRule: {[mRnaBase: string]: string} = {
        'A': 'T',
        'U': 'A',
        'G': 'C',
        'C': 'G'
    };

    get sequence(): string {
        return this._sequence;
    }

    get length(): number {
        return this._sequence.length;
    }

    get complementaryDna(): Dna {
        return new Dna(this._sequence.split('').map(base => {
            return this.complementRule[base];
        }).join(''));
    }
}
