export function uuid(): string{
    return Uuid.random().stringValue;
}

export class Uuid{

    static random(): Uuid{
        return new Uuid(new Uint8ClampedArray([
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
            Math.random() * 255,
        ]))
    }

    readonly stringValue: string;

    constructor(readonly value: Uint8ClampedArray){
        if(value.length != 16){
            throw new Error();
        }

        this.stringValue = '';

        const pad = (value: string): string => value.length < 2 ? '0' + value : value;

        for(let i = 0; i < value.length; i++){
            this.stringValue += pad(value[i].toString(16));
        }
    }

    toString(): string{
        return this.stringValue;
    }
}