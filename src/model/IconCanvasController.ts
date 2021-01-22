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
import {makePt, makeSz, Point, Rectangle, Size} from "../hui/helpers/Rectangle";
import {SelectionTool} from "./tools/SelectionTool";
import {Icon} from "./Icon";
import {ClipboardEmptyError, ClipboardService} from "./ClipboardService";
import {NoSelectionError} from "./errors";

const MIME_PNG = "image/png";

export interface PasteResult{
    tool?: IconEditorTool;
    success: boolean;
    warnings: string[];
}

export type DownloadFormat = 'png' | 'ico';

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

    async copy(): Promise<void>{

        if (!this.editor.document.selectionSprite){
            return Promise.resolve();
        }

        const blob = await IconService.asBlobWithMime(this.editor.document.selectionSprite, MIME_PNG);

        return ClipboardService.copyBlob(blob, MIME_PNG);

    }

    async cut(): Promise<void>{

        if (!this.editor.document.selectionBuffer){
            throw new NoSelectionError();
        }

        try{
            await this.copy();

            this.editor.transact({
                ...this.editor.cloneDocument(),
                icon: this.editor.document.selectionBuffer,
                selectionRegion: undefined,
                selectionSprite: undefined,
                selectionBuffer: undefined,
            });

        }catch(e){
            return Promise.reject(e);
        }

    }

    async paste(): Promise<PasteResult>{

        let success = false;
        let tool: IconEditorTool | undefined;
        let warnings: string[] = [];

        try{
            const blob = await ClipboardService.pasteBlob();
            tool = await this.importFile(blob);
            success = true;

        }catch(e){
            if (e instanceof ClipboardEmptyError){
              return Promise.reject(e);

            }else if(e instanceof Array){
                warnings = [...e];
            }
        }


        return {success, tool, warnings};
    }

    async downloadAs(format: DownloadFormat, icons: Icon[] | null = null): Promise<void>{

        let blob: Blob;
        let name: string;

        if (format == 'png'){
            blob = await IconService.asBlobWithMime(this.editor.document.icon, MIME_PNG);
            name = `favicon.png`;
        }else{
            blob = await IconService.asIcoBlob(icons || [this.editor.document.icon]);
            name = 'favicon.ico'
        }

        const a = document.createElement('a');

        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();

    }

    async importFile(file: Blob): Promise<SelectionTool>{
        const icon = this.editor.document.icon;
        const size = makeSz(icon.width, icon.height);
        const sprite = await IconService.fromFile(file, size);

        this.pasteSprite(sprite);

        if (this.tool instanceof SelectionTool){
            return this.tool;
        }

        const tool = new SelectionTool(this);
        this.tool = tool;
        return tool;
    }

    pasteSprite(sprite: Icon){

        const newDoc = this.editor.cloneDocument();
        const containerRec = new Rectangle(0 ,0, newDoc.icon.width, newDoc.icon.height);
        const spriteRect = new Rectangle(0, 0, sprite.width, sprite.height)
            .centerAt(containerRec.center).round();

        newDoc.selectionRegion = spriteRect;
        newDoc.selectionSprite = sprite;
        newDoc.selectionBuffer = newDoc.icon;
        newDoc.icon = IconService.blend(newDoc.selectionBuffer, newDoc.selectionSprite, newDoc.selectionRegion);

        this.editor.begin();
        this.editor.setDocument(newDoc);
        this.editor.commit();
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
                .centerAt(makePt(cvBounds.center.x, (icon.height * pixelLength)/2));

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