import {IconDocument, IconEditorTool} from "../IconEditor";
import {IconCanvasController} from "../IconCanvasController";

export class AdjustTool implements IconEditorTool{

    original: IconDocument | null = null;

    private lastBrightnessDelta: number = 0;
    private lastContrastDelta: number = 0;

    constructor(readonly controller: IconCanvasController){
        this.original = controller.editor.cloneDocument();
    }

    activate(){
        this.controller.editor.begin();
    }

    deactivate(){
        this.controller.editor.rollback();
    }

    setContrast(delta: number, commit: boolean = false){

        if (!this.original){
            throw new Error();
        }

        if (delta === this.lastContrastDelta){
            return;
        }

        const doc = this.controller.editor.cloneDocument(this.original);
        const data = doc.icon.data;
        const factor = (259 * (delta + 255)) / (255 * (259 - delta));
        const limit = 128;

        for(let i = 0; i < data.length; i+=4){
            data[i] = Math.max(Math.min(factor * (data[i] - limit) + limit, 255), 0);
            data[i + 1] = Math.max(Math.min(factor * (data[i + 1] - limit) + limit, 255), 0);
            data[i + 2] = Math.max(Math.min(factor * (data[i + 2] - limit) + limit, 255), 0);
        }

        this.controller.editor.setDocument(doc);
        this.lastContrastDelta = delta;

    }

    setBrightness(delta: number, commit: boolean = false){

        if (!this.original){
            throw new Error();
        }

        if (delta === this.lastBrightnessDelta){
            return;
        }

        console.log(`Setting brightness: ${delta}`);

        const doc = this.controller.editor.cloneDocument(this.original);
        const data = doc.icon.data;

        for(let i = 0; i < data.length; i+=4){
            data[i] = Math.max(Math.min(data[i] + delta, 255), 0);
            data[i + 1] = Math.max(Math.min(data[i + 1] + delta, 255), 0);
            data[i + 2] = Math.max(Math.min(data[i + 2] + delta, 255), 0);
        }

        this.controller.editor.setDocument(doc);
        this.lastBrightnessDelta = delta;

    }

}