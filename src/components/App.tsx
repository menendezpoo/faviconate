import * as React from "react";
import {ToolbarView} from "../hui/layout/ToolbarView";
import {Button} from "../hui/items/Button";
import {Separator} from "../hui/items/Separator";
import {DockView} from "../hui/layout/DockView";
import {CanvasView} from "./CanvasView";
import {DownloadFormat, IconCanvasController} from "../model/IconCanvasController";
import {EraserTool} from "../model/tools/EraserTool";
import {PencilTool} from "../model/tools/PencilTool";
import {Color} from "../hui/helpers/Color";
import {ColorPicker} from "../hui/items/ColorPicker";
import {PreviewPanel} from "./PreviewPanel";
import {IconEditorTool} from "../model/IconEditor";
import {SelectionTool} from "../model/tools/SelectionTool";
import {IconService} from "../model/IconService";
import {makeSz} from "../hui/helpers/Rectangle";
import {MenuItem} from "../hui/items/MenuItem";

function changeFavicon(src: string) {
    const link = document.createElement('link'),
        oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}

export interface AppProps{}

export interface AppState{
    controller: IconCanvasController;
    selectedTool: IconEditorTool | null;
    previewCanvas: HTMLCanvasElement | null;
    undos: number;
    redos: number;
    showBackground: boolean;
    showGrid: boolean;
}

export class App extends React.Component<AppProps, AppState>{

    constructor(props: AppProps) {
        super(props);

        const controller = new IconCanvasController();
        const selectedTool = new SelectionTool(controller);

        this.state = {
            controller,
            previewCanvas: null,
            selectedTool,
            undos: 0,
            redos: 0,
            showBackground: true,
            showGrid: true,
        }

        this.usePen();
    }

    private appDragOver(e: React.DragEvent<HTMLDivElement>){
        e.preventDefault();
    }

    private appDrop(e: React.DragEvent<HTMLDivElement>){
        e.preventDefault();

        if (e.dataTransfer.items){
            for (let i = 0; i < e.dataTransfer.items.length; i++){
                const item = e.dataTransfer.items[i];
                const file = item.getAsFile();

                if (file){
                    console.log(`${file.name} -> ${file.size}`);
                    this.importFile(file);
                }else{
                    console.log(`Can't get as file`)
                }

                break;
            }
        }else{
            console.log(`No transfer items`)
        }

    }

    private copy(){
        this.state.controller.copy()
            .then(() => console.log("Copied"))
            .catch(e => console.log(`Not copied: ${e}`));
    }

    private cut(){
        this.state.controller.cut()
            .then(() => console.log("Did cut"))
            .catch(e => console.log(`Didn't cut: ${e}`));
    }

    private paste(){
        this.state.controller.paste()
            .then(r => {

                console.log(`Pasted`);

                if (r.warnings.length > 0){
                    console.log(` - Warnings: ${r.warnings.length}`);
                    r.warnings.forEach(w => console.log(`   - ${w}`))
                }

                if (r.success && r.tool){
                    this.setState({selectedTool: r.tool});
                }

            })
            .catch(e => console.log(`Not pasted: ${e}`));
    }

    private importFile(file: File){
        this.state.controller.importFile(file)
            .then(selectedTool => this.setState({selectedTool}));
    }

    private useEraser(){
        this.setState({selectedTool: new EraserTool(this.state.controller)});
    }

    private usePen(){
        const pen = new PencilTool(this.state.controller);
        this.setState({selectedTool: pen});

    }

    private useSelection(){
        this.setState({selectedTool: new SelectionTool(this.state.controller)});
    }

    private colorPick(color: Color){
        if (this.state.controller.tool instanceof PencilTool){
            const p: PencilTool = this.state.controller.tool as PencilTool;
            p.color = color;
        }
    }

    private undo(){
        this.state.controller.editor.undo();
        const undos = this.state.undos + 1;

        if (this.state.controller.editor.undoPeek?.selectionRegion && !(this.state.selectedTool instanceof SelectionTool)){
            this.setState({undos, selectedTool: new SelectionTool(this.state.controller)});
        }else{
            this.setState({undos});
        }

    }

    private redo(){
        this.state.controller.editor.redo();
        const redos = this.state.redos + 1;

        if (this.state.controller.editor.redoPeek?.selectionRegion && !(this.state.selectedTool instanceof SelectionTool)){
            this.setState({redos, selectedTool: new SelectionTool(this.state.controller)});
        }else{
            this.setState({redos});
        }
    }

    private newDocument(size: number){

        const icon = IconService.newIcon(size, size)
        const doc = {icon};
        const controller = new IconCanvasController(doc);

        this.setState({controller, previewCanvas: controller.editor.getImageCanvas()});
    }

    private download(format: DownloadFormat){
        this.state.controller.downloadAs(format)
            .then(() => console.log(`Download triggered`));
    }

    componentDidMount() {
        document.addEventListener('keydown', e => {

            const focused = document.querySelector("*:focus");

            if (focused && (focused.tagName == 'INPUT' || focused.tagName == 'TEXTAREA')){
                return;
            }

            const ctrlMeta = e.ctrlKey || e.metaKey;

            if (e.key == 'z' && ctrlMeta && e.shiftKey){
                this.redo();
                e.preventDefault();

            }else if(e.key == 'z' && ctrlMeta){
                this.undo();
                e.preventDefault();

            }else if(e.key === 'v' && !ctrlMeta){
                this.useSelection();
                e.preventDefault();

            }else if((e.key === 'p' || e.key == 'd') && !ctrlMeta){
                this.usePen();
                e.preventDefault();

            }else if(e.key === 'e' && !ctrlMeta){
                this.useEraser();
                e.preventDefault();

            }else if(e.key === 'b' && !ctrlMeta){
                this.setState({showBackground: !this.state.showBackground});
                e.preventDefault();

            }else if(e.key === 'g' && !ctrlMeta){
                this.setState({showGrid: !this.state.showGrid});
                e.preventDefault();

            }else if(e.key === 'c' && ctrlMeta){
                this.copy();
                e.preventDefault();

            }else if(e.key === 'v' && ctrlMeta){
                this.paste();
                e.preventDefault();

            }else if(e.key === 'x' && ctrlMeta){
                this.cut();
                e.preventDefault();

            }

        });
    }

    render() {

        const controller = this.state.controller;

        const mainToolbarItems = <>
            <Button text={`Faviconate`}>
                <MenuItem text={`New 16x16 Icon`} onActivate={() => this.newDocument(16)}/>
                <MenuItem text={`New 32x32 Icon`} onActivate={() => this.newDocument(32)}/>
                <MenuItem text={`New 64x64 Icon`} onActivate={() => this.newDocument(64)}/>
                <MenuItem text={`New 128x128 Icon`} onActivate={() => this.newDocument(128)}/>
                <MenuItem text={`New 256x256 Icon`} onActivate={() => this.newDocument(256)}/>
            </Button>
            <Separator/>
            <Button text={`Undo`} onClick={() => this.undo()} disabled={controller.editor.undoCount == 0}/>
            <Button text={`Redo`} onClick={() => this.redo()} disabled={controller.editor.redoCount == 0}/>
            <Button text={`Cut`} onClick={() => this.cut()}/>
            <Button text={`Copy`} onClick={() => this.copy()}/>
            <Button text={`Paste`} onClick={() => this.paste()}/>
        </>;

        const toolToolbarItems = <>
            <Button
                text={`Sel`}
                onClick={() => this.useSelection()}
                selected={this.state.selectedTool instanceof SelectionTool}
            />
            <Button
                text={`Pen`}
                onClick={() => this.usePen()}
                selected={this.state.selectedTool instanceof PencilTool && !(this.state.selectedTool instanceof EraserTool)}
            />
            <Button
                text={`Ers`}
                onClick={() => this.useEraser()}
                selected={this.state.selectedTool instanceof EraserTool}/>
            <Button
                text={`Bg`}
                onClick={() => this.setState({showBackground: !this.state.showBackground})}
                selected={this.state.showBackground}
            />
            <Button
                text={`Gr`}
                onClick={() => this.setState({showGrid: !this.state.showGrid})}
                selected={this.state.showGrid}
            />
        </>;

        const sideBar = <>
            <PreviewPanel canvas={this.state.previewCanvas}/>
            <ColorPicker colorPicked={color => this.colorPick(color) } />
            <Button text={`PNG`} onClick={() => this.download('png')}/>
        </>;

        this.state.controller.editor.documentSubmitted = () => {
            this.setState({previewCanvas: this.state.controller.editor.getImageCanvas()});
        };

        if (this.state.previewCanvas){
            changeFavicon(this.state.previewCanvas.toDataURL());
        }

        controller.tool = this.state.selectedTool;
        controller.showBackground = this.state.showBackground;
        controller.showGrid = this.state.showGrid;

        return (
            <div id={`app`}
                 onDragOver={e => this.appDragOver(e)}
                 onDrop={e => this.appDrop(e)}
            >
            <ToolbarView items={mainToolbarItems}>
                <DockView side={`right`} sideView={sideBar}>
                    <ToolbarView side={`left`} items={toolToolbarItems}>
                        <CanvasView controller={controller} />
                    </ToolbarView>
                </DockView>
            </ToolbarView>
            </div>
        );
    }

}