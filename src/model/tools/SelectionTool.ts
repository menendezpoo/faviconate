import {IconEditorTool} from "../IconEditor";
import {PointingEvent, PointingEventResult} from "../../components/CanvasView";
import {makePt, Rectangle} from "../../hui/helpers/Rectangle";
import {IconCanvasController} from "../IconCanvasController";

export class SelectionTool implements IconEditorTool{

    private selecting = false;
    private selStartPixel = makePt(0,0);

    constructor(readonly controller: IconCanvasController) {
        this.controller.selection = new Rectangle(2, 2, 2, 2);
    }

    pointingGestureStart(e: PointingEvent): PointingEventResult {
        return {}
    }

    pointingGestureEnd(e: PointingEvent): PointingEventResult {
        return {}
    }

    pointingGestureMove(e: PointingEvent): PointingEventResult {
        return {cursor: 'crosshair'}
    }

}