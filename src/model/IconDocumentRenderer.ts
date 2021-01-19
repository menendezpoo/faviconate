import {IconDocument} from "./IconEditor";
import {makeSz, Rectangle, Size} from "../hui/helpers/Rectangle";
import {Color} from "../hui/helpers/Color";
import {Icon} from "../hui/items/Icon";

const GRID_OUT = Color.fromHex(`#d0d0d0`);
const GRID_INT = Color.fromHex(`#e0e0e0`);
const CHECKER_EVEN = Color.transparent;
const CHECKER_ODD = Color.fromHex(`#f0f0f0`);
const CHECKER_SIZE = 20;

const CLOCK_MOD = 4;
const SAFE_CLEAR = 10;

export class IconDocumentRenderer {

    private static clock = 0;
    private static clockReminder = 0;
    private static checkerCanvas: HTMLCanvasElement | null = null

    static getPattern(context: CanvasRenderingContext2D): CanvasPattern | null{

        if(!IconDocumentRenderer.checkerCanvas){
            const canvas: HTMLCanvasElement = IconDocumentRenderer.checkerCanvas = document.createElement('canvas');
            canvas.width = canvas.height = CHECKER_SIZE;

            const localCx = canvas.getContext('2d');
            const size = CHECKER_SIZE / 2;

            if(!localCx){
                return null;
            }

            if (!CHECKER_EVEN.isTransparent){
                localCx.fillStyle = CHECKER_EVEN.cssRgba;
                localCx.fillRect(0,0, size, size);
                localCx.fillRect(size, size, size, size);
            }

            if (!CHECKER_ODD.isTransparent){
                localCx.fillStyle = CHECKER_ODD.cssRgba;
                localCx.fillRect(size, 0, size, size);
                localCx.fillRect(0, size, size, size);
            }
        }

        const canvas = IconDocumentRenderer.checkerCanvas;

        return context.createPattern(canvas, 'repeat');

    }

    constructor(
        readonly document: IconDocument,
        readonly context: CanvasRenderingContext2D,
        readonly bounds: Rectangle,
        readonly drawBackground: boolean,
        readonly drawGrid: boolean,
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

    }

    private renderFrame(){
        this.rectStroke(this.bounds, GRID_OUT);
    }

    private renderChecker(){
        const pattern = IconDocumentRenderer.getPattern(this.context);

        if(!pattern){
            return;
        }

        this.context.fillStyle = pattern;
        this.context.fillRect(...this.bounds.tuple);

    }

    private renderSelection(pixelSize: Size){

        if (!this.document.selectionRegion){
            return;
        }

        const selection = this.document.selectionRegion;

        const selBounds = new Rectangle(
            this.bounds.left + selection.left * pixelSize.width,
            this.bounds.top + selection.top * pixelSize.height,
            selection.width * pixelSize.width,
            selection.height * pixelSize.height
        ).round();

        IconDocumentRenderer.clock++;

        if(IconDocumentRenderer.clock % CLOCK_MOD === 0){
            IconDocumentRenderer.clockReminder++;

            if (IconDocumentRenderer.clockReminder === 9){
                IconDocumentRenderer.clockReminder = 0;
            }
        }

        // this.context.strokeStyle = '#000';
        // this.context.strokeRect(...selBounds.tuple);



        const fives = new Array(Math.round(selBounds.width / 5)).fill(5);

        const segmentedRect = (r: Rectangle) => {
            // Drawing the rect like this prevents weird behavior
            // of the segmented pattern
            this.context.beginPath();
            this.context.moveTo(r.left, r.top);
            this.context.lineTo(r.right, r.top);
            this.context.moveTo(r.right, r.bottom);
            this.context.lineTo(r.left, r.bottom);
            this.context.stroke();

            this.context.beginPath();
            this.context.moveTo(r.right, r.top);
            this.context.lineTo(r.right, r.bottom);
            this.context.moveTo(r.left, r.bottom);
            this.context.lineTo(r.left, r.top);
            this.context.stroke();
        }

        // =00000====
        // ==00000===
        // ===00000==
        // ====00000=
        // =====00000

        const lineWidthBuffer = this.context.lineWidth;
        this.context.lineWidth = 1.5;

        switch(IconDocumentRenderer.clockReminder){
            case 0: this.context.setLineDash([1, ...fives]); break;
            case 1: this.context.setLineDash([2, ...fives]); break;
            case 2: this.context.setLineDash([3, ...fives]); break;
            case 3: this.context.setLineDash([4, ...fives]); break;
            case 4: this.context.setLineDash([5, 5]); break;
            case 5: this.context.setLineDash([0, 1,...fives]); break;
            case 6: this.context.setLineDash([0,2,...fives]); break;
            case 7: this.context.setLineDash([0,3,...fives]); break;
            case 8: this.context.setLineDash([0,4,...fives]); break;
        }
        this.context.strokeStyle = '#fff';

        segmentedRect(selBounds);


        switch(IconDocumentRenderer.clockReminder){
            case 0: this.context.setLineDash([0, 1, ...fives]); break;
            case 1: this.context.setLineDash([0, 2, ...fives]); break;
            case 2: this.context.setLineDash([0, 3, ...fives]); break;
            case 3: this.context.setLineDash([0, 4, ...fives]); break;
            case 4: this.context.setLineDash([0, 5, ...fives]); break;
            case 5: this.context.setLineDash([1,...fives]); break;
            case 6: this.context.setLineDash([2,...fives]); break;
            case 7: this.context.setLineDash([3,...fives]); break;
            case 8: this.context.setLineDash([4,...fives]); break;
        }
        this.context.strokeStyle = '#000';
        segmentedRect(selBounds);


        this.context.setLineDash([]);
        this.context.lineWidth = lineWidthBuffer;

    }

    render(){
        const pixelSize = makeSz(
            this.bounds.width / this.document.icon.width,
            this.bounds.height / this.document.icon.height);

        this.context.clearRect(...this.bounds.inflate(SAFE_CLEAR, SAFE_CLEAR).tuple);

        if (this.drawBackground){
            this.renderChecker();
        }

        this.renderPixels(pixelSize);

        if (this.drawGrid){
            this.renderGrid(pixelSize);
        }

        this.renderFrame();

        if (this.document.selectionRegion){
            this.renderSelection(pixelSize);
        }

    }

}