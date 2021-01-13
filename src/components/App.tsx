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

export class App extends React.Component{

    readonly controller = new IconCanvasController();

    private useEraser(){
        this.controller.tool = new EraserTool(this.controller);
    }

    private usePen(){
        const pen = new PencilTool(this.controller);
        pen.color = Color.fromHex(`#ff0000`);
        this.controller.tool = pen;

    }

    private colorPick(color: Color){
        if (this.controller.tool instanceof PencilTool){
            const p: PencilTool = this.controller.tool as PencilTool;
            p.color = color;
            console.log(color);
            console.log(color.hexRgb);
        }
    }

    componentDidMount() {
        this.controller.editor.documentSubmitted = () => {
            changeFavicon(this.controller.editor.getImage());
        };
    }

    render() {

        const controller = this.controller;

        const mainToolbarItems = <>
            <Button text={`Faviconate`}/>
            <Separator/>
            <Button text={`Undo`} onClick={() => controller.editor.undo()}/>
            <Button text={`Redo`} onClick={() => controller.editor.redo()}/>
            <Button text={`Copy`}/>
            <Button text={`Paste`}/>
        </>;

        const toolToolbarItems = <>
            <Button text={`Pen`} onClick={() => this.usePen()}/>
            <Button text={`Ers`} onClick={() => this.useEraser()}/>
            <Button text={`C`}/>
        </>;

        const sideBar = <>
            <ColorPicker colorPicked={color => this.colorPick(color) } />
        </>;

        this.usePen();

        return (
            <ToolbarView items={mainToolbarItems}>
                <DockView side={`right`} sideView={sideBar}>
                    <ToolbarView side={`left`} items={toolToolbarItems}>
                        <CanvasView controller={controller}  />
                    </ToolbarView>
                </DockView>
            </ToolbarView>
        );
    }

}