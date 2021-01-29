import {Icon} from "./Icon";
import {Editor} from "./Editor";
import {CanvasSensor} from "../components/CanvasView";
import {Rectangle} from "../hui/helpers/Rectangle";
import {IconService} from "./IconService";
import {Color} from "../hui/helpers/Color";



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
    useColor?: (color: Color) => void;
}

export class IconEditor extends Editor<IconDocument>{

    cloneDocument(doc?: IconDocument): IconDocument{

        if (typeof doc === "undefined"){
            doc = this.document;
        }

        const newDocument = {
            ...doc,
            icon: IconService.clone(doc.icon),
        };

        return newDocument;
    }

}