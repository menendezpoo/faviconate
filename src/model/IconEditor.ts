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

}