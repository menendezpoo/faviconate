import {Icon} from "./Icon";
import {Editor, NoDocumentError} from "./Editor";
import {CanvasSensor} from "../components/CanvasView";
import {Rectangle} from "../hui/helpers/Rectangle";
import {IconService} from "./IconService";

export interface IconDocument{
    icon: Icon;
    selectionRegion?: Rectangle;
    selectionBuffer?: Icon;
    selectionSprite?: Icon;
}

export interface IconEditorTool extends CanvasSensor{

}

export class NoSelectionError extends Error{}

export class IconEditor extends Editor<IconDocument>{

    cloneDocument(): IconDocument{

        if (!this.document){
            throw new NoDocumentError();
        }

        const doc = this.document;

        const newDocument = {
            ...doc,
            icon: IconService.clone(this.document.icon),
        };

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