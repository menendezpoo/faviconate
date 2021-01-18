import {
    CanvasViewController,
    KeyEvent,
    KeyEventResult,
    PointingEvent,
    PointingEventResult
} from "../components/CanvasView";
import {IconDocument, IconEditor, IconEditorTool} from "./IconEditor";
import {PencilTool} from "./tools/PencilTool";
import {IconService} from "./IconService";
import {IconDocumentRenderer} from "./IconDocumentRenderer";
import {makePt, Point, Rectangle, Size} from "../hui/helpers/Rectangle";

export class IconCanvasController implements CanvasViewController{

    showBackground = false;
    showGrid = false;

    readonly editor: IconEditor;
    private _tool: IconEditorTool | null = new PencilTool(this);
    private previewBounds: Rectangle = Rectangle.empty;
    private previewPixelSize: number = 0;

    constructor(document?: IconDocument) {

        if (document){
            this.editor = new IconEditor(document);
        }else{
            this.editor = new IconEditor({
                icon: IconService.newIcon(16, 16)
            });
        }

        (window as any)._editor = this.editor;
    }

    pixelToData(pixel: Point): number{
        const icon = this.editor.document.icon;
        return icon.width * 4 * pixel.y + pixel.x * 4;
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

    pointingGestureStart(e: PointingEvent): PointingEventResult | void {
        if (this.tool?.pointingGestureStart){
            return this.tool.pointingGestureStart(e);
        }
    }

    pointingGestureMove(e: PointingEvent): PointingEventResult | void {
        if (this.tool?.pointingGestureMove){
            return this.tool.pointingGestureMove(e);
        }
    }

    pointingGestureEnd(e: PointingEvent): PointingEventResult | void {
        if (this.tool?.pointingGestureEnd){
            return this.tool.pointingGestureEnd(e);
        }
    }

    keyDown(e: KeyEvent): KeyEventResult | void{
        if (this.tool?.keyDown){
            return this.tool.keyDown(e);
        }
    }

    keyUp(e: KeyEvent): KeyEventResult | void{
        if (this.tool?.keyUp){
            return this.tool.keyUp(e);
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

        if(value === this._tool){
            return;
        }

        if (this._tool?.deactivate){
            this._tool.deactivate();
        }

        this._tool = value;

        if (this._tool?.activate){
            this._tool.activate();
        }
    }
}