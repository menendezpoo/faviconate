import {PencilTool} from "./PencilTool";
import {IconCanvasController} from "../IconCanvasController";
import {Color} from "../../hui/helpers/Color";

export class EraserTool extends PencilTool{

    constructor(controller: IconCanvasController) {
        super(controller);
        this.color = Color.transparent;
    }

    useColor(color: Color) {
        // do nothing, color must be transparent
    }

}