import * as React from 'react';
import * as ReactDOM from "react-dom";
import {IconEditorTool} from "../model/IconEditor";
import {AdjustTool} from "../model/tools/AdjustTool";
import {EraserTool} from "../model/tools/EraserTool";
import {FloodFillTool} from "../model/tools/FloodFillTool";
import {PaletteComposerTool} from "../model/tools/PaletteComposerTool";
import {PencilTool} from "../model/tools/PencilTool";
import {SelectionTool} from "../model/tools/SelectionTool";
import {BookEditorState} from "./BookEditor";
import {ReviewStudio} from "./ReviewStudio";
import {BookController} from "../model/BookController";

export type BookEditorStateSetter = <K extends keyof BookEditorState>(state: Pick<BookEditorState, K>) => void;

export interface KeyMapping{
    command: (commands: BookCommands) => void;
    key: string;
    flat?: boolean;
    shift?: boolean;
}

export const MAPPINGS: KeyMapping[] = [
    {key: 'z', command: c => c.commandRedo(), shift: true},
    {key: 'z', command: c => c.commandUndo()},
    {key: 'v', command: c => c.commandPaste()},
    {key: 'c', command: c => c.commandCopy()},
    {key: 'x', command: c => c.commandCut()},
    {key: 'a', command: c => c.commandSelectAll()},

    {key: 'd', command: c => c.commandUsePen(), flat: true},
    {key: 'v', command: c => c.commandUseSelection(), flat: true},
    {key: 'f', command: c => c.commandUseFlood(), flat: true},
    {key: 'e', command: c => c.commandUseEraser(), flat: true},
    {key: 'b', command: c => c.commandSwapBg(), flat: true},
    {key: 'g', command: c => c.commandSwapGrid(), flat: true},
];

export class BookCommands{

    constructor(
        readonly bookController: BookController,
        readonly state: BookEditorState,
        readonly setter: BookEditorStateSetter,
    ) {}

    private setState<K extends keyof BookEditorState>(state: Pick<BookEditorState, K>){
        this.setter(state);
    }

    private useTool(tool: IconEditorTool){
        this.setState({tool});
    }

    importFile(file: File){

        if (file.name.toLowerCase().endsWith('.ico')){
            const curId = this.state.iconController.id;
            const pristine = this.state.iconController.editor.pristine;
            this.bookController.importIcoFile(file)
                .then(iconControllers => {
                    iconControllers.forEach(ctl => {
                        ctl.showBackground = this.state.showBackground;
                        ctl.showGrid = this.state.showGrid;
                    });
                    if(pristine){
                        this.bookController.removeIcon(curId);
                    }
                    this.commandGoToIcon(iconControllers[0].id);
                });

        }else{
            this.state.iconController.importFile(file)
                .then(tool => {
                    this.setState({tool});
                    this.bookController.persist();
                });
        }
    }

    commandCopy(){
        this.state.iconController.copy()
            .then(() => console.log("Copied"))
            .catch(e => console.log(`Not copied: ${e}`));
    }

    commandCut(){
        this.state.iconController.cut()
            .then(() => console.log("Did cut"))
            .catch(e => console.log(`Didn't cut: ${e}`));
    }

    commandPaste(){
        this.state.iconController.paste()
            .then(r => {

                if (r.warnings.length > 0){
                    console.log(` - Warnings: ${r.warnings.length}`);
                    r.warnings.forEach(w => console.log(`   - ${w}`))
                }

                if (r.success && r.tool){
                    this.setState({tool: r.tool});
                }

            })
            .catch(e => console.log(`Not pasted: ${e}`));
    }

    commandImportFileDialog(){
        const input: HTMLInputElement = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        input.onchange = e => {
            if (input.files && input.files.length > 0){
                this.importFile(input.files[0]);
            }
        };

        document.body.appendChild(input);

        setTimeout(() => input.click());

    }

    commandUseDither(){
        this.useTool(new AdjustTool(this.state.iconController));
    }

    commandUseEraser(){
        this.useTool(new EraserTool(this.state.iconController));
    }

    commandUseFlood(){
        this.useTool(new FloodFillTool(this.state.iconController));
    }

    commandUsePaletteComposer(){
        this.useTool(new PaletteComposerTool(this.state.iconController));
    }

    commandUsePen(){
        this.useTool(new PencilTool(this.state.iconController));
    }

    commandUseSelection(){
        this.useTool(new SelectionTool(this.state.iconController));
    }

    commandSwapBg(){
        const showBackground = !this.state.showBackground;
        this.state.iconController.showBackground = showBackground;
        this.setState({showBackground});
    }

    commandSwapGrid(){
        const showGrid = !this.state.showGrid;
        this.state.iconController.showGrid = showGrid;
        this.setState({showGrid});
    }

    commandSelectAll(){

        const {tool} = this.state;

        if (!(tool instanceof SelectionTool)){
            this.commandUseSelection();
        }
        setTimeout(() => (tool as SelectionTool).selectAll());
    }

    commandReview(){

        const {iconController} = this.state;

        const dismiss = () => {
            ReactDOM.unmountComponentAtNode(document.getElementById(`root-dialog`)!);
        };

        ReactDOM.render(
            <ReviewStudio icon={iconController.editor.document.icon} onCloseRequested={dismiss}/>,
            document.getElementById(`root-dialog`)
        );
    }

    commandUndo(){
        const {iconController, tool} = this.state;

        iconController.editor.undo();
        const undos = this.state.undos + 1;

        if (iconController.editor.undoPeek?.selectionRegion && !(tool instanceof SelectionTool)){
            this.setState({undos, tool: new SelectionTool(iconController)});
        }else{
            this.setState({undos});
        }

    }

    commandRedo(){

        const {iconController, tool} = this.state;

        iconController.editor.redo();
        const redos = this.state.redos + 1;

        if (iconController.editor.redoPeek?.selectionRegion && !(tool instanceof SelectionTool)){
            this.setState({redos, tool: new SelectionTool(iconController)});
        }else{
            this.setState({redos});
        }
    }

    commandGoToIcon(id: string){

        const iconController = this.bookController.getIconController(id);

        if(!iconController){
            throw new Error();
        }

        const tool = iconController.tool;
        const showGrid = iconController.showGrid;
        const showBackground = iconController.showBackground;

        this.setState({tool, iconController, showGrid, showBackground});
    }
}