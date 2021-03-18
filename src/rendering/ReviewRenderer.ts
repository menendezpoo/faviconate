import {IconReviewer} from "../model/IconReviewer";
import {makePt, makeSz, Rect, Rectangle, scaleToContain, Size} from "../hui/helpers/Rectangle";
import {MarchingAnts} from "./MarchingAnts";
import {IconService} from "../model/IconService";
import {Color} from "../hui/helpers/Color";
import {Palette} from "../model/PaletteService";

export function marchingAntsMarker(cx: CanvasRenderingContext2D, contentBounds: Rectangle, focusRegion: Rectangle){
    // N
    const na = makePt(contentBounds.left, focusRegion.top);
    const nb = makePt(contentBounds.right, focusRegion.top);

    // S
    const sa = makePt(contentBounds.left, focusRegion.bottom);
    const sb = makePt(contentBounds.right, focusRegion.bottom);

    // W
    const wa = makePt(focusRegion.left, contentBounds.top);
    const wb = makePt(focusRegion.left, contentBounds.bottom);

    // E
    const ea = makePt(focusRegion.right, contentBounds.top);
    const eb = makePt(focusRegion.right, contentBounds.bottom);


    MarchingAnts.line(cx, na, nb);
    MarchingAnts.line(cx, sa, sb);
    MarchingAnts.line(cx, wa, wb);
    MarchingAnts.line(cx, ea, eb);
}

export class ReviewRenderer{

    constructor(
        readonly reviewer: IconReviewer,
        readonly palette?: Palette,
    ) {}

    private colorName(color: Color){
        if (this.palette){
            for(const palColor of this.palette.colors){
                if (palColor.hex === color.hexRgb){
                    if (palColor.name){
                        return palColor.name;
                    }else{
                        break;
                    }
                }
            }
        }

        return color.isTransparent ? 'Nothing' :  color.hexRgb.toUpperCase();
    }

    private drawCode(cx: CanvasRenderingContext2D, color: Color, region: Rectangle){

        const txt = this.colorName(color);
        const measure = cx.measureText(txt);
        const txtSize = makeSz(measure.width, measure.actualBoundingBoxDescent);
        const txtBounds = Rectangle.fromSize(txtSize).centerAt(region.center)
            .offset(0, 9);

        cx.fillStyle = color.relativeLuminance > 0.5 ? 'black' : 'white';
        cx.font = `18px 'Mukta Mahee', 'San Francisco', 'Helvetica', sans-serif`;
        cx.fillText(txt, txtBounds.left, txtBounds.top, region.width);
    }

    private drawColorCodes(cx: CanvasRenderingContext2D, data: Uint8ClampedArray, region: Rectangle, sample: Size){

        const pixel = makeSz(region.width / sample.width, region.height / sample.height);

        for(let row = 0; row < sample.height; row++){
            for(let col = 0; col < sample.width; col++){
                const index = sample.width * row * 4 + col * 4;
                const color = Color.fromTupleInt8([
                    data[index], data[index + 1], data[index + 2], data[index + 3]
                ]);
                const pixelBounds = new Rectangle(
                    region.left + col * pixel.width,
                    region.top + row * pixel.height,
                    pixel.width, pixel.height
                );

                this.drawCode(cx, color, pixelBounds);
            }
        }

    }

    renderPreview(context: CanvasRenderingContext2D, canvasSize: Size){

        const sourceCanvas = IconService.asCanvas(this.reviewer.current);

        const srcW = sourceCanvas.width;
        const srcH = sourceCanvas.height;
        const w = canvasSize.width;
        const h = canvasSize.height;



        context.clearRect(0, 0, w, h);
        context.imageSmoothingEnabled = false;
        context.drawImage(sourceCanvas, 0,0, w, h);

        const sampleW = this.reviewer.sample.width;
        const sampleH = this.reviewer.sample.height;
        const contentBounds = new Rectangle(0, 0, w, h);
        const pixelSize = makeSz(w/srcW, h/srcH);
        const focusSize = makeSz(sampleW * pixelSize.width, sampleH * pixelSize.height);
        const focusLocation = makePt(pixelSize.width * this.reviewer.currentHotspot.left, pixelSize.height * this.reviewer.currentHotspot.top);
        const focusRegion = Rectangle.fromPoint(focusLocation).withSize(focusSize);

        marchingAntsMarker(context, contentBounds, focusRegion);

    }

    renderReview(context: CanvasRenderingContext2D, canvasSize: Size){

        const source = this.reviewer.reviewImage();
        const cx = context;
        const sample = this.reviewer.sample;
        const graphicSize = makeSz(source.width, source.height);

        const contentBounds = Rectangle
            .fromSize(scaleToContain(canvasSize, graphicSize))
            .centerAt(Rectangle.fromSize(canvasSize).center);

        cx.clearRect(0,0, canvasSize.width, canvasSize.height);
        cx.imageSmoothingEnabled = false;
        cx.drawImage(source, ...contentBounds.tuple);

        const pixelSize = makeSz(contentBounds.width / source.width, contentBounds.height / source.height);

        const focusRegion = new Rectangle(
            contentBounds.left + pixelSize.width * sample.width,
            contentBounds.top + pixelSize.height * sample.height,
            pixelSize.width * sample.width,
            pixelSize.height * sample.height);

        marchingAntsMarker(cx, contentBounds, focusRegion);

        // Labels
        this.drawColorCodes(cx, this.reviewer.sampleSprite, focusRegion, sample);

    }

}