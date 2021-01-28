import {IconDocument} from "./IconEditor";
import {makeSz, Point, Rectangle, Size} from "../hui/helpers/Rectangle";
import {Color} from "../hui/helpers/Color";
import {MemoryError} from "./errors";
import {darkModeOn} from "../hui/helpers/Utils";

const dark = darkModeOn();
const GRID_OUT = Color.fromHex(dark ? 'fff' : '000').withAlpha(0.05);
const GRID_STRONG = Color.fromHex(dark ? `#4C4A4A` : `#e0e0e0`);
const GRID_LIGHT = Color.fromHex(dark ? `fff` : `000`).withAlpha(0.05);
const CHECKER_EVEN = Color.transparent;
const CHECKER_ODD = Color.fromHex(dark ? 'fff' : '000').withAlpha(0.05);
const CHECKER_SIZE = 10;
const CORNER_RADIUS = 10;
const PLATE_BG = Color.fromHex(dark ? 'fff' : '000').withAlpha(0.05);

const CLOCK_MOD = 4;
const SAFE_CLEAR = 10;

interface Corners {
    tl: number;
    tr: number;
    br: number;
    bl: number;
}

export class IconDocumentRenderer {

    private static clock = 0;
    private static clockReminder = 0;
    private static checkerCanvas: HTMLCanvasElement | null = null;
    private static pixelsBuffer: HTMLCanvasElement | null = null;
    private static pixelsContext: CanvasRenderingContext2D | null = null;

    static getPixelsBuffer(canvasSize: Size): {canvas: HTMLCanvasElement; cx: CanvasRenderingContext2D}{
        if(
            !this.pixelsBuffer ||
            this.pixelsBuffer.width !== canvasSize.width ||
            this.pixelsBuffer.height !== canvasSize.height
        ) {
            this.pixelsBuffer = document.createElement('canvas');
            this.pixelsBuffer.width = canvasSize.width;
            this.pixelsBuffer.height = canvasSize.height;
            this.pixelsContext = this.pixelsBuffer.getContext('2d');
        }

        if(!this.pixelsContext) {
            throw new MemoryError();
        }

        return {
            canvas: this.pixelsBuffer,
            cx: this.pixelsContext,
        }
    }

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

    readonly bounds: Rectangle;

    constructor(
        readonly document: IconDocument,
        readonly context: CanvasRenderingContext2D,
        readonly plateBounds: Rectangle,
        readonly drawBackground: boolean,
        readonly drawGrid: boolean,
    ) {
        this.bounds = this.plateBounds.deflate(CORNER_RADIUS, CORNER_RADIUS);
    }

    private pathRoundRect(bounds: Rectangle, radius: number | Corners = 10) {

        const ctx = this.context;
        const {x, y} = bounds.location;
        const {width, height} = bounds.size;

        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        }

        ctx.beginPath();
        ctx.moveTo(x + radius.tl, y);
        ctx.lineTo(x + width - radius.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        ctx.lineTo(x + width, y + height - radius.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        ctx.lineTo(x + radius.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        ctx.lineTo(x, y + radius.tl);
        ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        ctx.closePath();

    }

    private pathLines(lines: [Point, Point][]){
        const c = this.context;

        c.beginPath();

        for(const line of lines){
            c.moveTo(line[0].x, line[0].y);
            c.lineTo(line[1].x, line[1].y);
        }
    }

    private rectStroke(r: Rectangle, color: Color){
        this.context.strokeStyle = color.cssRgba;
        this.context.strokeRect(...r.tuple);
    }

    private rectFill(r: Rectangle, color: Color){
        this.context.fillStyle = color.cssRgba;
        this.context.fillRect(...r.tuple);
    }

    private renderPixels_Deprecated(pixelSize: Size){

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

    private renderPixels(pixelSize: Size){
        const {canvas, cx} = IconDocumentRenderer.getPixelsBuffer(makeSz(this.document.icon.width, this.document.icon.height));

        cx.putImageData(new ImageData(this.document.icon.data, this.document.icon.width), 0, 0);

        this.context.imageSmoothingEnabled = false;
        this.context.drawImage(canvas, ...this.bounds.tuple);
        this.context.imageSmoothingEnabled = true;
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

        ctx.strokeStyle = GRID_LIGHT.cssRgba;
        ctx.stroke();

    }

    private renderFrame(){
        const r = CORNER_RADIUS;
        const p = this.plateBounds;
        this.pathLines([
            p.offset(0, r).northSegment,
            p.offset(-r, 0).eastSegment,
            p.offset(0, -r).southSegment,
            p.offset(r, 0).westSegment
        ]);
        this.context.strokeStyle = GRID_OUT.cssRgba;
        this.context.stroke();
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

    private drawPlate(){
        this.pathRoundRect(this.plateBounds, CORNER_RADIUS);
        this.context.fillStyle = PLATE_BG.cssRgba;
        this.context.fill();
    }

    render(){
        const pixelSize = makeSz(
            this.bounds.width / this.document.icon.width,
            this.bounds.height / this.document.icon.height);

        this.context.clearRect(...this.bounds.inflate(SAFE_CLEAR, SAFE_CLEAR).tuple);

        this.drawPlate();

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