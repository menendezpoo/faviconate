import {IconDocument, IconEditor, IconEditorTool} from "../IconEditor";
import {KeyEvent, KeyEventResult, PointingEvent, PointingEventResult} from "../../components/CanvasView";
import {makePt, Point, Rectangle} from "../../hui/helpers/Rectangle";
import {IconCanvasController} from "../IconCanvasController";
import {Icon} from "../Icon";
import {IconService} from "../IconService";
import {NoSelectionError} from "../errors";

export class SelectionTool implements IconEditorTool{

    static id = 0;

    private selecting = false;
    private dragging = false;
    private dragOffset: Point = makePt(0, 0);
    private startPixel = makePt(0,0);
    private _id: number;

    readonly editor: IconEditor;

    constructor(readonly controller: IconCanvasController, sprite?: Icon) {
        this.editor = controller.editor;
        this._id = ++SelectionTool.id;
        console.log(`Created ${this._id}`);

        if (sprite){
            this.pasteSprite(sprite);
        }
    }

    private clipOutSelection(): {buffer: Icon, sprite: Icon}{

        if (!this.document.selectionRegion){
            throw new Error();
        }

        const buffer = IconService.clone(this.document.icon);
        const sprite = IconService.fromIcon(buffer, this.document.selectionRegion);

        IconService.region32(buffer, this.document.selectionRegion,
            (index, current) => {
                buffer.data[index] = 0
                buffer.data[index + 1] = 0
                buffer.data[index + 2] = 0
                buffer.data[index + 3] = 0
        });

        return {buffer, sprite};
    }

    private updateSel(a: Point, b: Point){
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
        const newDoc = this.editor.cloneDocument();
        const {buffer, sprite} = this.clipOutSelection();
        newDoc.selectionBuffer = buffer;
        newDoc.selectionSprite = sprite;
        this.editor.setDocument(newDoc);
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

        if(
            !this.document.selectionRegion ||
            !this.document.selectionSprite ||
            !this.document.selectionBuffer
        ){
            throw new NoSelectionError();
        }

        const region = new Rectangle(
            p.x - this.dragOffset.x, p.y - this.dragOffset.y,
            this.document.selectionSprite.width, this.document.selectionSprite.height);

        const base = this.document.icon;
        const newDoc = this.editor.cloneDocument();
        const spriteOffset = makePt(
           region.left < 0 ? Math.abs(region.left) : 0,
           region.top < 0 ? Math.abs(region.top) : 0
        );

        newDoc.selectionRegion = Rectangle.fromLTRB(
            region.left < 0 ? 0 : region.left,
            region.top < 0 ? 0 : region.top,
            region.right > base.width ? base.width : region.right,
            region.bottom > base.height ? base.height : region.bottom
        );

        newDoc.icon = IconService.blend(
            newDoc.selectionBuffer!, newDoc.selectionSprite!, newDoc.selectionRegion, spriteOffset);

        this.editor.setDocument(newDoc);

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

    activate(){
        SelectionTool.id++;
    }

    clearSelection(){
        const newDoc = this.editor.cloneDocument();

        newDoc.selectionRegion = newDoc.selectionSprite = newDoc.selectionBuffer = undefined;

        this.editor.begin();
        this.editor.setDocument(newDoc);
        this.editor.commit();

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

    pasteSprite(sprite: Icon){

        const newDoc = this.editor.cloneDocument();
        const containerRec = new Rectangle(0 ,0, newDoc.icon.width, newDoc.icon.height);
        const spriteRect = new Rectangle(0, 0, sprite.width, sprite.height)
                                    .centerAt(containerRec.center).round();

        newDoc.selectionRegion = spriteRect;
        newDoc.selectionSprite = sprite;
        newDoc.selectionBuffer = newDoc.icon;
        newDoc.icon = IconService.blend(newDoc.selectionBuffer, newDoc.selectionSprite, newDoc.selectionRegion);

        this.controller.editor.begin();
        this.controller.editor.setDocument(newDoc);
        this.controller.editor.commit();
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

        this.editor.commit();

        if (this.pixelIsInsideSelection(p)){
            return {cursor: 'move'};
        }

    }

    pointingGestureMove(e: PointingEvent): PointingEventResult | void {

        const p = this.controller.pointToPixel(e.point);

        if (p){

            if (this.selecting) {
                this.updateSel(this.startPixel, p);

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
        }

    }

    get document(): IconDocument{
        return this.editor.document;
    }

}