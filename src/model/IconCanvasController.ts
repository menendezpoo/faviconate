import {
    CanvasViewController,
    KeyEvent,
    KeyEventResult,
    PointingEvent,
    PointingEventResult
} from "../components/CanvasView";
import {IconEditor, IconEditorTool} from "./IconEditor";
import {PencilTool} from "./tools/PencilTool";
import {Editor, NoDocumentError} from "./Editor";
import {IconService} from "./IconService";
import {IconDocumentRenderer} from "./IconDocumentRenderer";
import {makePt, makeSz, Point, Rectangle, Size} from "../hui/helpers/Rectangle";

export class IconCanvasController implements CanvasViewController{

    showBackground = false;
    showGrid = false;

    readonly editor: IconEditor = new IconEditor();
    private _tool: IconEditorTool | null = new PencilTool(this);
    private previewBounds: Rectangle = Rectangle.empty;
    private previewPixelSize: number = 0;

    constructor() {
        this.editor.open({
            icon: IconService.newIcon(16, 16)
        });

        (window as any)._editor = this.editor;
    }

    pixelToData(pixel: Point): number{
        if (this.editor.document){
            const icon = this.editor.document.icon;
            return icon.width * 4 * pixel.y + pixel.x * 4;

        }else{
            throw new NoDocumentError();
        }
    }

    pointToPixel(p: Point): Point | null{
        if (!this.previewBounds.contains(p)){
            return null;
        }

        const left = p.x - this.previewBounds.left;
        const top = p.y - this.previewBounds.top;

        return makePt(
            Math.floor(left / this.previewPixelSize),
            Math.floor(top / this.previewPixelSize)
        );
    }

    pointToData(p: Point): number{

        // Deflation prevents round-errors
        if (!this.previewBounds.deflate(1, 1).contains(p)){
            return - 1;
        }

        const pixel = this.pointToPixel(p);

        if (pixel){
            return this.pixelToData(pixel);
        }

        return -1;

    }

    pointingGestureStart(e: PointingEvent): PointingEventResult {
        if (this.tool?.pointingGestureStart){
            return this.tool.pointingGestureStart(e);
        }else{
            return {};
        }
    }

    pointingGestureMove(e: PointingEvent): PointingEventResult {
        if (this.tool?.pointingGestureMove){
            return this.tool.pointingGestureMove(e);
        }else{
            return {};
        }
    }

    pointingGestureEnd(e: PointingEvent): PointingEventResult {
        if (this.tool?.pointingGestureEnd){
            return this.tool.pointingGestureEnd(e);
        }else{
            return {};
        }
    }

    keyDown(e: KeyEvent): KeyEventResult {
        if (this.tool?.keyDown){
            return this.tool.keyDown(e);
        }else{
            return {};
        }
    }

    keyUp(e: KeyEvent): KeyEventResult {
        if (this.tool?.keyUp){
            return this.tool.keyUp(e);
        }else{
            return {};
        }
    }

    render(context: CanvasRenderingContext2D, size: Size){

        const cvBounds = new Rectangle(0, 0, size.width, size.height);
        const previewArea = cvBounds.deflate(10, 10);

        if (this.editor.document){

            const icon = this.editor.document.icon;
            const pixelLength = this.previewPixelSize = Math.min(previewArea.size.width, previewArea.size.height) / Math.min(icon.width, icon.height);

            this.previewBounds = new Rectangle(
                0, 0,
                icon.width * pixelLength,
                icon.height *  pixelLength)
                .centerAt(cvBounds.center);

            const renderer = new IconDocumentRenderer(
                this.editor.document,
                context,
                this.previewBounds,
                this.showBackground,
                this.showGrid,
                );

            renderer.render();
        }
    }

    get tool(): IconEditorTool | null{
        return this._tool;
    }

    set tool(value: IconEditorTool | null){
        this._tool = value;
    }
}