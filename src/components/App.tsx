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
    selectedTool: IconEditorTool | null;
    previewCanvas: HTMLCanvasElement | null;
    undos: number;
    redos: number;
    showBackground: boolean;
    showGrid: boolean;
}

export class App extends React.Component<AppProps, AppState>{

    readonly controller = new IconCanvasController();

    constructor(props: AppProps) {
        super(props);

        this.state = {
            previewCanvas: null,
            selectedTool: null,
            undos: 0,
            redos: 0,
            showBackground: true,
            showGrid: true,
        }

        this.usePen();
    }

    private useEraser(){
        this.setState({selectedTool: new EraserTool(this.controller)});
    }

    private usePen(){
        const pen = new PencilTool(this.controller);
        pen.color = Color.fromHex(`#ff0000`);
        this.setState({selectedTool: pen});

    }

    private colorPick(color: Color){
        if (this.controller.tool instanceof PencilTool){
            const p: PencilTool = this.controller.tool as PencilTool;
            p.color = color;
            console.log(color);
            console.log(color.hexRgb);
        }
    }

    private undo(){
        this.controller.editor.undo();
        const undos = this.state.undos + 1;
        this.setState({undos});
    }

    private redo(){
        this.controller.editor.redo();
        const redos = this.state.redos + 1;
        this.setState({redos});
    }

    componentDidMount() {
        this.controller.editor.documentSubmitted = () => {
            this.setState({previewCanvas: this.controller.editor.getImageCanvas()});
        };
    }

    render() {

        const controller = this.controller;

        const mainToolbarItems = <>
            <Button text={`Faviconate`}/>
            <Separator/>
            <Button text={`Undo`} onClick={() => this.undo()} disabled={controller.editor.undoCount == 0}/>
            <Button text={`Redo`} onClick={() => this.redo()} disabled={controller.editor.redoCount == 0}/>
            <Button text={`Copy`}/>
            <Button text={`Paste`}/>
        </>;

        const toolToolbarItems = <>
            <Button
                text={`Pen`}
                onClick={() => this.usePen()}
                selected={this.state.selectedTool instanceof PencilTool && !(this.state.selectedTool instanceof EraserTool)}/>
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

        if (this.state.previewCanvas){
            changeFavicon(this.state.previewCanvas.toDataURL());
        }

        this.controller.tool = this.state.selectedTool;
        this.controller.showBackground = this.state.showBackground;
        this.controller.showGrid = this.state.showGrid;

        return (
            <ToolbarView items={mainToolbarItems}>
                <DockView side={`right`} sideView={sideBar}>
                    <ToolbarView side={`left`} items={toolToolbarItems}>
                        <CanvasView controller={controller} />
                    </ToolbarView>
                </DockView>
            </ToolbarView>
        );
    }

}