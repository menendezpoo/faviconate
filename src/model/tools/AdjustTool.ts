import {IconDocument, IconEditorTool} from "../IconEditor";
import {IconCanvasController} from "../IconCanvasController";
import {Color} from "../../hui/helpers/Color";
import {ImageAdjustService} from "../ImageAdjustService";
import {Palette} from "../PaletteService";

export class AdjustTool implements IconEditorTool{

    original: IconDocument | null = null;
    currentPalette: Palette | null = null;
    currentBrightness = 0;
    currentContrast = 0;
    currentKernel = 1;

    constructor(readonly controller: IconCanvasController){

    }

    activate(){
        this.controller.editor.begin();
        this.original = this.controller.editor.cloneDocument();
    }

    deactivate(){
        this.controller.editor.rollback();
    }

    updateAdjustments(){

        if (!this.original){
            throw new Error();
        }

        const doc = this.controller.editor.cloneDocument(this.original);
        const icon = doc.icon;
        const data = icon.data;

        if (this.currentBrightness !== 0){
            ImageAdjustService.brightness(data, this.currentBrightness);
        }

        if (this.currentContrast !== 0){
            ImageAdjustService.contrast(data, this.currentContrast)
        }

        if (this.currentPalette){
            ImageAdjustService.dither(data, icon.width, icon.height, this.currentPalette.colors.map(tuple => Color.fromTupleInt8(tuple)), this.currentKernel);
        }

        this.controller.editor.setDocument(doc);
    }

    setContrast(delta: number, commit: boolean = false){

        if (delta === this.currentContrast){
            return;
        }

        this.currentContrast = delta;
        this.updateAdjustments();

    }

    setBrightness(delta: number, commit: boolean = false){

        if (delta === this.currentBrightness){
            return;
        }

        this.currentBrightness = delta;
        this.updateAdjustments();

    }

    setPalette(palette: Palette | null){

        this.currentPalette = palette;
        this.updateAdjustments();

    }

}