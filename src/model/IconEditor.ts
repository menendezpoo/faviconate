import {Icon} from "./Icon";
import {Editor} from "./Editor";
import {CanvasSensor} from "../components/CanvasView";
import {Rectangle} from "../hui/helpers/Rectangle";
import {IconService} from "./IconService";



declare interface ClipboardItem{
    ClipboardItem: (data: any) => ClipboardItem;
}

export interface IconDocument{
    icon: Icon;
    selectionRegion?: Rectangle;
    selectionBuffer?: Icon;
    selectionSprite?: Icon;
}

export interface IconEditorTool extends CanvasSensor{
    activate?: () => void;
    deactivate?: () => void;
}

export class IconEditor extends Editor<IconDocument>{

    cloneDocument(): IconDocument{

        const doc = this.document;

        const newDocument = {
            ...doc,
            icon: IconService.clone(this.document.icon),
        };

        return newDocument;
    }

    getImageCanvas(): HTMLCanvasElement{

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