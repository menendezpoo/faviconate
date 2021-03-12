import * as React from "react";
import {CanvasView} from "./CanvasView";
import {Button} from "../hui/items/Button";
import {SelectionTool} from "../model/tools/SelectionTool";
import {Separator} from "../hui/items/Separator";
import {PencilTool} from "../model/tools/PencilTool";
import {EraserTool} from "../model/tools/EraserTool";
import {FloodFillTool} from "../model/tools/FloodFillTool";
import {PaletteComposerTool} from "../model/tools/PaletteComposerTool";
import {AdjustTool} from "../model/tools/AdjustTool";
import {IconEditorTool} from "../model/IconEditor";
import {IconCanvasController} from "../model/IconCanvasController";
import {BookCommands} from "./BookCommands";
import {ToolbarView} from "../hui/layout/ToolbarView";

export interface CanvasEditorProps{
    controller: IconCanvasController;
    tool: IconEditorTool | null;
    commands: BookCommands;
}

interface CanvasEditorState{}

export class IconEditor extends React.Component<CanvasEditorProps, CanvasEditorState>{

    private getItems(){

        const tool = this.props.tool;
        const cmd = this.props.commands;

        return (
            <>
                <Button
                    icon={`select`} iconSize={50}
                    onClick={() => cmd.commandUseSelection()}
                    selected={tool instanceof SelectionTool}
                />
                <Separator/>
                <Button
                    icon={`pencil`} iconSize={50}
                    onClick={() => cmd.commandUsePen()}
                    selected={tool instanceof PencilTool && !(tool instanceof EraserTool)}
                />
                <Button
                    icon={`bucket`} iconSize={50}
                    onClick={() => cmd.commandUseFlood()}
                    selected={tool instanceof FloodFillTool}
                />
                <Button
                    icon={`eraser`} iconSize={50}
                    onClick={() => cmd.commandUseEraser()}
                    selected={tool instanceof EraserTool}/>
                <Separator/>
                <Button
                    icon={`palette`} iconSize={50}
                    onClick={() => cmd.commandUsePaletteComposer()}
                    selected={tool instanceof PaletteComposerTool}
                />
                <Button
                    icon={`gradient`} iconSize={50}
                    onClick={() => cmd.commandUseDither()}
                    selected={tool instanceof AdjustTool}
                />
            </>
        );
    }

    render() {

        const items = this.getItems();

        return (
            <ToolbarView
                sideClassNames={`main-tools`}
                length={70}
                classNames={`canvas-main`}
                side={`left`}
                itemsCenter={items}
            >
                <CanvasView controller={this.props.controller} />
            </ToolbarView>
        );
    }
}