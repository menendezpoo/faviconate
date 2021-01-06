
export class InvalidColorFormatError extends Error{}

export class Color{

    static fromHex(hexColor: string): Color{

        // Remove #
        if(hexColor.charAt(0) == '#') hexColor = hexColor.substr(1);

        // Check length
        if(!(hexColor.length == 3 || hexColor.length == 6 || hexColor.length == 8)){
            throw new InvalidColorFormatError(hexColor);
        }

        let toDecimal = function(hex: any){ return parseInt(hex, 16); };

        let r = 0;
        let g = 0;
        let b = 0;
        let a = 1;

        // If three digits
        if(hexColor.length == 3){
            r = (toDecimal(hexColor.charAt(0) + hexColor.charAt(0)));
            g = (toDecimal(hexColor.charAt(1) + hexColor.charAt(1)));
            b = (toDecimal(hexColor.charAt(2) + hexColor.charAt(2)));
        }else{
            r = (toDecimal(hexColor.charAt(0) + hexColor.charAt(1)));
            g = (toDecimal(hexColor.charAt(2) + hexColor.charAt(3)));
            b = (toDecimal(hexColor.charAt(4) + hexColor.charAt(5)));

            if(hexColor.length == 8)
                a = (toDecimal(hexColor.charAt(6) + hexColor.charAt(7)));
        }

        return new Color(r, g, b, a);

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