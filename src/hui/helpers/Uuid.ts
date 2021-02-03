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

        for(let i = 0; i < value.length; i++){
            const hex = value[i].toString(16);
            this.stringValue += hex.length < 2 ? '0' + hex : hex;
            if(i % 2 == 1 && i > 1 && i < 10){
                this.stringValue += '-';
            }
        }
    }

    toString(): string{
        return this.stringValue;
    }
}
