import {IconDocument} from "../model/IconEditor";
import {makeSz, Point, Rectangle, Size} from "../hui/helpers/Rectangle";
import {Color} from "../hui/helpers/Color";
import {MemoryError} from "../model/errors";
import {darkModeOn} from "../hui/helpers/Utils";
import {MarchingAnts} from "./MarchingAnts";

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

        MarchingAnts.rectangle(this.context, selBounds, Color.black, Color.white, IconDocumentRenderer.clockReminder);

        return;

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

        this.context.clearRect(...this.plateBounds.inflate(SAFE_CLEAR, SAFE_CLEAR).tuple);

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