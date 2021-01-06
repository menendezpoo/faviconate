import {IconDocument} from "./IconEditor";
import {makeSz, Rectangle, Size} from "../hui/helpers/Rectangle";
import {Color} from "../hui/helpers/Color";

const GRID_OUT = Color.fromHex(`#d0d0d0`);
const GRID_INT = Color.fromHex(`#f0f0f0`);

export class IconDocumentRenderer {

    constructor(
        readonly document: IconDocument,
        readonly context: CanvasRenderingContext2D,
        readonly bounds: Rectangle,
    ) {}

    private rectStroke(r: Rectangle, color: Color){
        this.context.strokeStyle = color.cssRgba;
        this.context.strokeRect(...r.tuple);
    }

    private rectFill(r: Rectangle, color: Color){
        this.context.fillStyle = color.cssRgba;
        this.context.fillRect(...r.tuple);
    }

    private renderPixels(pixelSize: Size){

        const data = this.document.icon.data;
        let x = this.bounds.left;
        let y = this.bounds.top;
        let drawn = 0;


        for(let i = 0; i < data.length; i += 4){
            const color = new Color(data[i], data[i + 1], data[i + 2], data[i + 3] / 255);
            const r = new Rectangle(x, y, pixelSize.width, pixelSize.height);
            this.rectFill(r, color);

            drawn++;
            x += pixelSize.width;

            if ((drawn % this.document.icon.width) === 0){
                y += pixelSize.height;
                x = this.bounds.left;
            }

        }

    }

    private renderGrid(pixelSize: Size){

        const ctx = this.context;
        const icon = this.document.icon;
        const bounds = this.bounds;

        ctx.beginPath();

        let x = this.bounds.left;
        let y = this.bounds.top;

        for(let i = 0; i < icon.width; i++){
            ctx.moveTo(x, bounds.top);
            ctx.lineTo(x, bounds.bottom);
            x += pixelSize.width;
        }

        for(let i = 0; i < icon.height; i++){
            ctx.moveTo(bounds.left, y);
            ctx.lineTo(bounds.right, y);
            y += pixelSize.height;
        }

        ctx.strokeStyle = GRID_INT.cssRgba;
        ctx.stroke();

        this.rectStroke(this.bounds, GRID_OUT);

    }

    render(){
        const pixelSize = makeSz(
            this.bounds.width / this.document.icon.width,
            this.bounds.height / this.document.icon.height);

        this.context.clearRect(...this.bounds.tuple);

        this.renderPixels(pixelSize);
        this.renderGrid(pixelSize);

    }

}