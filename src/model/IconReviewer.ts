import {Icon} from "./Icon";
import {Color} from "../hui/helpers/Color";
import {BasicCardinalPoint, Rectangle, Size} from "../hui/helpers/Rectangle";
import {MemoryError} from "./errors";
import {GraphicsMemoryError} from "../hui/helpers/errors";

export type StartCorner = 'ne' | 'nw' | 'se' | 'sw';

const UNVISITED = new Color(0, 0, 0, 0.9);
const VISITED = new Color(0, 255, 0, 0.7);

export class IconReviewer{

    readonly current: Icon;

    private hotspot: Rectangle;

    constructor(
        readonly original: Icon,
        readonly sample: Size,
        readonly startCorner: StartCorner) {

        this.current = {...original, data: new Uint8ClampedArray(original.data)};

        const w = sample.width;
        const h = sample.height;
        const wh: [number, number]= [sample.width, sample.height];

        if (startCorner == "nw"){
            this.hotspot = new Rectangle(0, 0, ...wh);

        }else if(startCorner === 'ne'){
            this.hotspot = new Rectangle(original.width  - w, 0, ...wh);

        }else if(startCorner === 'se'){
            this.hotspot = new Rectangle(original.width  - w, original.height - h, ...wh);

        }else if(startCorner === 'sw'){
            this.hotspot = new Rectangle(0, original.height - h, ...wh);

        }

        this.tintRegion(new Rectangle(0,0,original.width, original.height), UNVISITED);
        this.tintRegion(this.hotspot, Color.transparent);
    }

    tintRegion(region: Rectangle, color: Color){

        const index = (x: number, y: number) => y * this.original.width * 4 + x * 4;

        for(let y = region.top; y < region.bottom; y++){

            if(y < 0 || y >= this.original.height){
                continue;
            }

            for(let x = region.left; x < region.right; x++){

                if(x < 0 || x >= this.original.width){
                    continue;
                }

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

    move(cardinalPoint: BasicCardinalPoint){
        this.tintRegion(this.hotspot, VISITED);

        if (cardinalPoint === 'n'){
            this.hotspot = this.hotspot.offset(0, -this.sample.height);

        }else if(cardinalPoint === 's'){
            this.hotspot = this.hotspot.offset(0, this.sample.height);

        }else if(cardinalPoint === 'e'){
            this.hotspot = this.hotspot.offset(this.sample.width, 0);

        }else if(cardinalPoint === 'w'){
            this.hotspot = this.hotspot.offset(-this.sample.width, 0);

        }

        // TODO: Bound checking

        this.tintRegion(this.hotspot, Color.transparent);

    }

    reviewImage(): HTMLCanvasElement{

        const index = (x: number, y: number, w: number) => y * w * 4 + x * 4;
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const superSample = this.hotspot.inflate(this.sample.width, this.sample.height);
        const current = this.current;

        canvas.width = superSample.width;
        canvas.height = superSample.height;

        let [imgX, imgY, imgR, imgB] = superSample.tupleLTRB;
        let offsetX = 0;
        let offsetY = 0;

        if (imgX < 0){
            offsetX = Math.abs(imgX);
            imgX = 0;
        }

        if(imgY < 0){
            offsetY = Math.abs(imgY);
            imgY = 0;
        }

        if(imgR > current.width){
            imgR = current.width;
        }

        if(imgB > current.height){
            imgB = current.height;
        }

        const cx = canvas.getContext('2d');

        if(!cx){
            throw new GraphicsMemoryError();
        }

        const arr = new Uint8ClampedArray(superSample.width * superSample.height * 4);

        let curImgX = superSample.left;
        let curImgY = superSample.top;

        for(let y = 0; y < superSample.height; y++){

            if(curImgY < 0 || curImgY >= this.current.height){
                curImgY++;
                continue;
            }

            for(let x = 0; x < superSample.width; x++) {

                if(curImgX < 0 || curImgX >= this.current.width){
                    curImgX++;
                    continue;
                }

                const arrIndex = index(x, y, superSample.width);
                const curIndex = index(curImgX, curImgY, current.width);

                for(let i = 0; i <=3; i++){
                    arr[arrIndex + i] = current.data[curIndex + i];
                }

                curImgX++;
            }

            curImgX = superSample.left;
            curImgY++;
        }

        cx.putImageData(new ImageData(arr, superSample.width), 0,0);

        return canvas;
    }

}