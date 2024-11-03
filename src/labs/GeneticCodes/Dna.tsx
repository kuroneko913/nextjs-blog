import { MessangerRna } from './MessangerRna';
export class Dna {
    private _sequence: string;

    constructor(sequence: string) {
        this._sequence = sequence;
    }

    transcriptionRule: {[mRnaBase: string]: string} = {
        'A': 'U',
        'T': 'A',
        'G': 'C',
        'C': 'G'
    };

    complementRule: {[mRnaBase: string]: string} = {
        'A': 'T',
        'T': 'A',
        'G': 'C',
        'C': 'G'
    };

    replicate(): Dna {
        return new Dna(this._sequence.split('').map(base => {
            return this.complementRule[base];
        }).join(''));
    }

    transcript(): MessangerRna {
        return new MessangerRna(this._sequence.split('').map(base => {
            return this.transcriptionRule[base];
        }).join(''));
    }

    get sequence(): string {
        return this._sequence;
    }
}
