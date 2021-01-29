import {IconDocument, IconEditor, IconEditorTool} from "../IconEditor";
import {KeyEvent, KeyEventResult, PointingEvent, PointingEventResult} from "../../components/CanvasView";
import {makePt, makeSz, Point, Rectangle} from "../../hui/helpers/Rectangle";
import {IconCanvasController} from "../IconCanvasController";
import {Icon} from "../Icon";
import {IconService} from "../IconService";
import {NoSelectionError} from "../errors";

export class SelectionTool implements IconEditorTool{

    private selecting = false;
    private dragging = false;
    private dragOffset: Point = makePt(0, 0);
    private startPixel = makePt(0,0);

    readonly editor: IconEditor;

    constructor(readonly controller: IconCanvasController) {
        this.editor = controller.editor;
    }

    private clipOutSelection(document?: IconDocument): {buffer: Icon, sprite: Icon}{

        if(!document){
            document = this.document;
        }

        if (!document.selectionRegion){
            throw new Error();
        }

        const buffer = IconService.clone(document.icon);
        const sprite = IconService.fromIcon(buffer, document.selectionRegion);

        IconService.region32(buffer, document.selectionRegion,
            (index, current) => {
                buffer.data[index] = 0
                buffer.data[index + 1] = 0
                buffer.data[index + 2] = 0
                buffer.data[index + 3] = 0
        });

        return {buffer, sprite};
    }

    private updateSelRegion(a: Point, b: Point){
        const newDoc = this.editor.cloneDocument();

        newDoc.selectionRegion = Rectangle.fromLTRB(
            Math.round(Math.min(a.x, b.x)),
            Math.round(Math.min(a.y, b.y)),
            Math.round(Math.max(a.x, b.x)) + 1,
            Math.round(Math.max(a.y, b.y)) + 1
        );

        this.editor.setDocument(newDoc);
    }

    private selectionEnded(){

        if (!this.document.selectionRegion || this.document.selectionRegion.isEmpty){
            return;
        }

        const {buffer, sprite} = this.clipOutSelection();

        this.editor.setDocument({
            ...this.editor.cloneDocument(),
            selectionBuffer: buffer,
            selectionSprite: sprite,
        });

        this.selecting = false;
    }

    private pixelIsInsideSelection(p: Point | null){
        return p && this.document.selectionRegion && this.document.selectionRegion.contains(p);
    }

    private dragEnded(){
        this.dragging = false;
        this.dragOffset = makePt(0,0);
    }

    private updateDrag(p: Point){

        this.moveSelection(p.x - this.dragOffset.x, p.y - this.dragOffset.y);

    }

    private moveSelection(x: number, y: number){

        if(
            !this.document.selectionRegion ||
            !this.document.selectionSprite ||
            !this.document.selectionBuffer
        ){
            throw new NoSelectionError();
        }

        const base = this.document.icon;
        const buffer: Icon = this.document.selectionBuffer;
        const sprite: Icon = this.document.selectionSprite;

        x = Math.max(-sprite.width, x);
        x = Math.min(base.width, x);
        y = Math.max(-sprite.height, y);
        y = Math.min(base.height, y);

        const region = new Rectangle(x, y, sprite.width, sprite.height);
        const offset = makePt(
            region.left < 0 ? Math.abs(region.left) : 0,
            region.top < 0 ? Math.abs(region.top) : 0
        );
        const selectionRegion = Rectangle.fromLTRB(
            region.left < 0 ? 0 : region.left,
            region.top < 0 ? 0 : region.top,
            region.right > base.width ? base.width : region.right,
            region.bottom > base.height ? base.height : region.bottom
        );
        const icon = IconService.blend(buffer, sprite, selectionRegion, offset);
        const newDoc: IconDocument = {
            ...this.editor.cloneDocument(),
            selectionRegion,
            icon
        };

        if (this.editor.currentTransaction){
            this.editor.setDocument(newDoc);
        }else{
            this.editor.transact(newDoc);
        }

    }

    private offsetSelection(x: number, y: number){
        if(
            !this.document.selectionRegion ||
            !this.document.selectionSprite
        ){
            throw new NoSelectionError();
        }

        const sprite: Icon = this.document.selectionSprite;
        const current: Rectangle = this.document.selectionRegion;

        let implicitX = current.right - sprite.width;
        let implicitY = current.bottom - sprite.height;

        implicitX = implicitX < 0 ? implicitX : 0;
        implicitY = implicitY < 0 ? implicitY : 0;

        this.moveSelection(current.left + x + implicitX, current.top + y + implicitY);

    }

    private saveDragOffset(p: Point){

        if (!this.document.selectionRegion){
            throw new NoSelectionError();
        }

        this.dragOffset = makePt(
            p.x - this.document.selectionRegion.left,
            p.y - this.document.selectionRegion.top
        );
    }

    selectRegion(selectionRegion: Rectangle){
        const icon = this.document.icon;
        const doc: IconDocument = {
            ...this.editor.cloneDocument(),
            selectionRegion: Rectangle.fromSize(makeSz(icon.width, icon.height))
        };

        const {buffer, sprite} = this.clipOutSelection(doc);

        this.editor.transact({
            ...doc,
            selectionBuffer: buffer,
            selectionSprite: sprite,
        });
    }

    selectAll(){
        const icon = this.document.icon;
        this.selectRegion(Rectangle.fromSize(makeSz(icon.width, icon.height)));
    }

    clearSelection(){
        const newDoc = this.editor.cloneDocument();

        newDoc.selectionRegion = newDoc.selectionSprite = newDoc.selectionBuffer = undefined;

        this.editor.begin();
        this.editor.setDocument(newDoc);
        this.editor.commit();

    }

    cropToSelection(){

        const sprite = this.editor.document.selectionSprite;

        if (sprite){
            this.editor.transact({icon: sprite});
        }else{
            throw new NoSelectionError();
        }
    }

    deactivate(){
        if (this.document.selectionRegion){
            this.clearSelection();
        }
    }

    deleteSelection(){

        const newDoc = this.editor.cloneDocument();

        newDoc.icon = newDoc.selectionBuffer!;
        newDoc.selectionSprite = newDoc.selectionBuffer = newDoc.selectionRegion = undefined;

        this.editor.begin();
        this.editor.setDocument(newDoc);
        this.editor.commit();
    }

    pointingGestureStart(e: PointingEvent): PointingEventResult | void{

        const p = this.controller.pointToPixel(e.point);

        if (p){
            this.startPixel = p;
            this.editor.begin();

            if (this.pixelIsInsideSelection(p)){
                this.dragging = true;
                this.saveDragOffset(p);

            }else{
                this.selecting = true;

            }
        }

    }

    pointingGestureEnd(e: PointingEvent): PointingEventResult | void {

        const p = this.controller.pointToPixel(e.point);

        if (this.selecting){
            this.selectionEnded();
        }

        if (this.dragging){
            this.dragEnded();
        }

        if (this.editor.currentTransaction){
            this.editor.commit();
        }

        if (this.pixelIsInsideSelection(p)){
            return {cursor: 'move'};
        }

    }

    pointingGestureMove(e: PointingEvent): PointingEventResult | void {

        const p = this.controller.pointToPixel(e.point);

        if (p){

            if (this.selecting) {
                this.updateSelRegion(this.startPixel, p);

            }else if(this.dragging){
                this.updateDrag(p);

            }else if(this.pixelIsInsideSelection(p)){
                return {cursor: 'move'};
            }

        }

        return {cursor: 'crosshair'};
    }

    keyDown(e: KeyEvent): KeyEventResult | void {

        if (e.key == 'Escape'){
            this.clearSelection();

        }else if (e.key == 'Delete' || e.key == 'Backspace'){
            this.deleteSelection();

        }else if (e.key == 'ArrowLeft'){
            this.offsetSelection(-1, 0);

        }else if (e.key == 'ArrowRight'){
            this.offsetSelection(1, 0);

        }else if (e.key == 'ArrowUp'){
            this.offsetSelection(0, -1);

        }else if (e.key == 'ArrowDown'){
            this.offsetSelection(0, 1);

        }

    }

    get document(): IconDocument{
        return this.editor.document;
    }

}