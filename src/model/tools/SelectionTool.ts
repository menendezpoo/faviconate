import {IconEditorTool} from "../IconEditor";
import {PointingEvent, PointingEventResult} from "../../components/CanvasView";
import {makePt, Point, Rectangle} from "../../hui/helpers/Rectangle";
import {IconCanvasController} from "../IconCanvasController";
import {Icon} from "../Icon";
import {IconService} from "../IconService";
import {NoDocumentError} from "../Editor";

export class SelectionTool implements IconEditorTool{

    private selecting = false;
    private selStartPixel = makePt(0,0);
    private selection: Icon | null = null;

    constructor(readonly controller: IconCanvasController) {}

    private clipOutSelection(): Icon{

        if (!this.controller.editor.document){
            throw new NoDocumentError();
        }

        const icon = this.controller.editor.document.icon;
        const clip = IconService.fromIcon(icon, this.controller.selection);

        IconService.region32(icon, this.controller.selection,
            (index, current) => {
                icon.data[index] = 0
                icon.data[index + 1] = 0
                icon.data[index + 2] = 0
                icon.data[index + 3] = 0
        });

        return clip;
    }

    private updateSel(a: Point, b: Point){
        this.controller.selection = Rectangle.fromLTRB(
            Math.round(Math.min(a.x, b.x)),
            Math.round(Math.min(a.y, b.y)),
            Math.round(Math.max(a.x, b.x)) + 1,
            Math.round(Math.max(a.y, b.y)) + 1
        );
    }

    pointingGestureStart(e: PointingEvent): PointingEventResult {

        const p = this.controller.pointToPixel(e.point);

        if (p && this.controller.selection.contains(p)){
            // start moving

        }else if (p) {
            this.selStartPixel = p;
            this.controller.selection = Rectangle.empty;
            this.selecting = true;
        }

        return {}
    }

    pointingGestureEnd(e: PointingEvent): PointingEventResult {

        const p = this.controller.pointToPixel(e.point);

        if (this.selecting){
            this.selection = this.clipOutSelection(); // TODO HERE I LEFT!
            this.selecting = false;
        }


        if (p && this.controller.selection.contains(p)){
            return {cursor: 'move'};
        }

        return {}
    }

    pointingGestureMove(e: PointingEvent): PointingEventResult {

        const p = this.controller.pointToPixel(e.point);

        if (p && this.selecting){
            this.updateSel(this.selStartPixel, p);

        }else if (p && this.controller.selection.contains(p)){
            return {cursor: 'move'};

        }

        return {cursor: 'crosshair'};
    }

}