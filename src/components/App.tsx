import * as React from "react";
import {ToolbarView} from "../hui/layout/ToolbarView";
import {Button} from "../hui/items/Button";
import {Separator} from "../hui/items/Separator";
import {DockView} from "../hui/layout/DockView";
import {CanvasView} from "./CanvasView";
import {IconCanvasController} from "../model/IconCanvasController";
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

    private importFile(file: File){

        const controller = this.state.controller;
        const icon = controller.editor.document.icon;
        const size = makeSz(icon.width, icon.height);

        IconService.fromFile(file, size).then(sprite => {
            this.setState({selectedTool: null});

            setTimeout(() => {

                this.setState({selectedTool: new SelectionTool(controller, sprite)});

                const nodes = document.getElementsByTagName('canvas');
                if (nodes.length > 0){
                    nodes[0].focus();
                }else{
                    console.log(`no canvas found`)
                }
            });
        });

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

        console.log(`New Doc: ${size}`)

        const icon = IconService.newIcon(size, size)
        const doc = {icon};
        const controller = new IconCanvasController(doc);

        this.setState({controller, previewCanvas: controller.editor.getImageCanvas()});
    }

    componentDidMount() {
        document.addEventListener('keydown', e => {

            const focused = document.querySelector("*:focus");

            if (focused && (focused.tagName == 'INPUT' || focused.tagName == 'TEXTAREA')){
                return;
            }

            if (e.key == 'z' && e.ctrlKey && e.shiftKey){
                this.redo();
                e.preventDefault();

            }else if(e.key == 'z' && e.ctrlKey){
                this.undo();
                e.preventDefault();

            }else if(e.key === 'v' && !e.ctrlKey){
                this.useSelection();
                e.preventDefault();

            }else if((e.key === 'p' || e.key == 'd') && !e.ctrlKey){
                this.usePen();
                e.preventDefault();

            }else if(e.key === 'e' && !e.ctrlKey){
                this.useEraser();
                e.preventDefault();

            }else if(e.key === 'b' && !e.ctrlKey){
                this.setState({showBackground: !this.state.showBackground});
                e.preventDefault();

            }else if(e.key === 'g' && !e.ctrlKey){
                this.setState({showGrid: !this.state.showGrid});
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
            <Button text={`Copy`}/>
            <Button text={`Paste`}/>
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