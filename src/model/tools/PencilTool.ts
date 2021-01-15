import {IconEditorTool} from "../IconEditor";
import {PointingEvent, PointingEventResult} from "../../components/CanvasView";
import {IconCanvasController} from "../IconCanvasController";
import {NoDocumentError} from "../Editor";
import {Point} from "../../hui/helpers/Rectangle";
import {Color} from "../../hui/helpers/Color";

export class PencilTool implements IconEditorTool{

    private drawing = false;
    color: Color = new Color(0,0,0,);

    constructor(readonly controller: IconCanvasController) {}

    private drawAt(p: Point){

        const index = this.controller.pointToData(p);

        if (index < 0){
            return;
        }

        if (this.controller.editor.document){

            const newState = this.controller.editor.cloneDocument();
            const data = newState.icon.data;

            data[index    ] = this.color.r;
            data[index + 1] = this.color.g;
            data[index + 2] = this.color.b;
            data[index + 3] = Math.round(this.color.a * 255);

            this.controller.editor.setDocument(newState);

        }else{
            throw new NoDocumentError();
        }
    }

    pointingGestureStart(e: PointingEvent): PointingEventResult {

        this.drawing = true;

        if (this.controller.editor.document && !this.controller.editor.currentTransaction){
            this.controller.editor.begin();
            this.drawAt(e.point);
        }

        return {};

    }

    pointingGestureMove(e: PointingEvent): PointingEventResult {

        if (!this.drawing){
            return {cursor: 'default'};
        }

        this.drawAt(e.point);

        return { cursor: 'default' };
    }

    pointingGestureEnd(e: PointingEvent): PointingEventResult {

        this.drawing = false;

        if (this.controller.editor.document){
            this.controller.editor.commit();
        }

        return {};
    }

}