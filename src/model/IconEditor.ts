import {Icon} from "./Icon";
import {Editor, NoDocumentError} from "./Editor";
import {CanvasSensor} from "../components/CanvasView";

export interface IconDocument{
    icon: Icon;
}

export interface IconEditorTool extends CanvasSensor{

}

export class IconEditor extends Editor<IconDocument>{

    cloneDocument(): IconDocument{

        if (!this.document){
            throw new NoDocumentError();
        }

        const newDocument = {...this.document};

        // Create Uint8Array
        const newData = new Uint8ClampedArray(this.document.icon.data.length);

        // Copy data
        this.document.icon.data.forEach((value, i) => newData[i] = value);

        // Assign new data
        newDocument.icon = {...newDocument.icon, data: newData};

        return newDocument;

    }

    getImageCanvas(): HTMLCanvasElement{

        if (!this.document){
            throw new NoDocumentError();
        }

        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const icon = this.document.icon;
        canvas.width = this.document.icon.width;
        canvas.height = this.document.icon.height;

        const ctx = canvas.getContext('2d');

        if (ctx){
            ctx.putImageData(new ImageData(icon.data, icon.width, icon.height), 0, 0);
        }

        return canvas;

    }

}