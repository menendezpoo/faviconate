
export class InvalidColorFormatError extends Error{}

export class Color{

    static hexParsable(hexColor: string): boolean{
        return hexColor.match(/#?[0-9a-fA-F]{3}([0-9a-fA-F]{3})?/) !== null;
    }

    static fromHex(hexColor: string): Color{

        if (!Color.hexParsable(hexColor)){
            throw new InvalidColorFormatError(hexColor);
        }

        hexColor = hexColor.replace('#', '');

        let toDecimal = function(hex: any){ return parseInt(hex, 16) };

        let r = 0;
        let g = 0;
        let b = 0;
        let a = 1;

        // If three digits
        if(hexColor.length == 3){
            r = toDecimal(hexColor[0] + hexColor[0]);
            g = toDecimal(hexColor[1] + hexColor[1]);
            b = toDecimal(hexColor[2] + hexColor[2]);
        }else{
            r = toDecimal(hexColor[0] + hexColor[1]);
            g = toDecimal(hexColor[2] + hexColor[3]);
            b = toDecimal(hexColor[4] + hexColor[5]);

            if(hexColor.length == 8) {
                a = toDecimal(hexColor[6] + hexColor[7]);
            }
        }

        return new Color(r, g, b, a);

    }

    static get transparent(): Color{
        return new Color(0, 0, 0, 0);
    }

    constructor(
        readonly r: number,     //  0 - 255
        readonly g: number,     //  0 - 255
        readonly b: number,     //  0 - 255
        readonly a: number = 1, //  0 - 1
    ) {}

    get cssRgb(): string{
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    get cssRgba(): string{
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    get hexRgb(): string{

        const hex = (n: number) => {
            const result = n.toString(16);
            return result.length == 1 ? `0${result}` : result;
        }

        return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`
    }

    get hexRgba(): string{

        const hex = (n: number) => {
            const result = n.toString(16);
            return result.length == 1 ? `0${result}` : result;
        }

        return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex(Math.round(this.a * 255))}`
    }

}