import {IconDocument, IconEditorTool} from "../IconEditor";
import {IconCanvasController} from "../IconCanvasController";
import {Color} from "../../hui/helpers/Color";

interface ColorReplace{
    document: IconDocument;
    oldColor?: Color;
    newColor?: Color;
}

export class PaletteComposerTool implements IconEditorTool{

    private replace: ColorReplace | null = null;

    constructor(readonly controller: IconCanvasController) {}

    deactivate(){
        if (this.controller.editor.currentTransaction){
            this.controller.editor.rollback();
        }
    }

    colorReplaceStart(){
        this.replace = {
            document: this.controller.editor.cloneDocument()
        };

        this.controller.editor.begin();
    }

    colorReplaceCancel(){
        this.controller.editor.rollback();
    }

    colorReplaceSelectOld(c: Color){
        if (!this.replace){
            throw new Error(`No replace operation`);
        }

        this.replace.oldColor = c;

    }

    colorReplaceSelectNew(newColor: Color){

        if (!this.replace){
            throw new Error(`No replace operation`);
        }

        if (!this.replace.oldColor){
            throw new Error(`No color to replace`);
        }

        this.replace.newColor = newColor;

        const old = this.replace.oldColor;
        const doc = this.controller.editor.cloneDocument(this.replace.document);
        const data = doc.icon.data;

        for(let i = 0; i < data.length; i+=4){

            const color = Color.fromInt8Array(data, i);

            if (color.equals(old)){
                newColor.copyToUint8(data, i);
            }
        }

        this.controller.editor.setDocument(doc);
    }

    colorReplaceConfirm(c: Color){

        this.controller.editor.commit();
    }

}