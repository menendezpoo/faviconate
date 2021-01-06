import {IconEditorTool} from "./IconEditor";
import {PointingEvent, PointingEventResult} from "../components/CanvasView";
import {IconCanvasController} from "./IconCanvasController";
import {NoDocumentError} from "./Editor";

export class PencilTool implements IconEditorTool{

    private drawing = false;

    constructor(readonly controller: IconCanvasController) {}

    private drawAt(index: number){
        if (this.controller.editor.document){

            const newState = this.controller.editor.cloneDocument();
            const data = newState.icon.data;

            data[index] = 255;
            data[index + 3] = 255;

            this.controller.editor.setDocument(newState);

        }else{
            throw new NoDocumentError();
        }
    }

    pointingGestureStart(e: PointingEvent): PointingEventResult {

        this.drawing = true;

        if (this.controller.editor.document){
            this.controller.editor.begin();

        }

        this.drawAt(this.controller.pointToData(e.point));

        return {};

    }

    pointingGestureMove(e: PointingEvent): PointingEventResult {

        if (!this.drawing){
            return {};
        }

        this.drawAt(this.controller.pointToData(e.point));

        return {};
    }

    pointingGestureEnd(e: PointingEvent): PointingEventResult {

        this.drawing = false;

        if (this.controller.editor.document){
            this.controller.editor.commit();
        }

        return {};
    }

}