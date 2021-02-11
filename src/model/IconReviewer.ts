import {Icon} from "./Icon";
import {Color} from "../hui/helpers/Color";
import {Rectangle} from "../hui/helpers/Rectangle";

const UNVISITED = new Color(0, 0, 0, 0.1);
const VISITED = new Color(0, 255, 0, 0.9);

export class IconReviewer{

    readonly current: Icon;

    constructor(readonly original: Icon) {
        this.current = {...original, data: new Uint8ClampedArray(original.data)};

        this.tintRegion(new Rectangle(5, 5, 22, 22), UNVISITED);
    }

    tintRegion(region: Rectangle, color: Color){

        const index = (x: number, y: number) => y * this.original.width * 4 + x * 4;

        for(let y = region.top; y < region.bottom; y++){
            for(let x = region.left; x < region.right; x++){
                const sIndex = index(x, y);
                const dR = this.original.data[sIndex];
                const dG = this.original.data[sIndex + 1];
                const dB = this.original.data[sIndex + 2];
                const dA = this.original.data[sIndex + 3] / 255;

                const [sR, sG, sB] = color.tupleInt8;
                const sA = color.a;

                const rR = sR * sA + dR * (1 - sA);
                const rG = sG * sA + dG * (1 - sA);
                const rB = sB * sA + dB * (1 - sA);
                const rA = dA + sA * (1 - dA);

                this.current.data[sIndex] = rR;
                this.current.data[sIndex + 1] = rG;
                this.current.data[sIndex + 2] = rB;
                this.current.data[sIndex + 3] = rA * 255;
            }
        }

    }

}