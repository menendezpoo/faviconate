import * as React from "react";
import {CanvasView} from "./CanvasView";
import {ToolbarView} from "../hui/layout/ToolbarView";
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

export type ToolCommand = 'SELECTION' | 'PEN' | 'FLOOD' | 'ERASER' | 'PALETTE_COMPOSER' | 'DITHER';

export interface CanvasEditorProps{
    controller: IconCanvasController;
    tool: IconEditorTool | null;
    onCommand?: (command: ToolCommand) => void;
}

interface CanvasEditorState{}

export class CanvasEditor extends React.Component<CanvasEditorProps, CanvasEditorState>{

    private command(c: ToolCommand){
        if (this.props.onCommand){
            this.props.onCommand(c);
        }
    }

    private getItems(){

        const tool = this.props.tool;

        return (
            <>
                <Button
                    icon={`select`} iconSize={50}
                    onClick={() => this.command('SELECTION')}
                    selected={tool instanceof SelectionTool}
                />
                <Separator/>
                <Button
                    icon={`pencil`} iconSize={50}
                    onClick={() => this.command('PEN')}
                    selected={tool instanceof PencilTool && !(tool instanceof EraserTool)}
                />
                <Button
                    icon={`bucket`} iconSize={50}
                    onClick={() => this.command('FLOOD')}
                    selected={tool instanceof FloodFillTool}
                />
                <Button
                    icon={`eraser`} iconSize={50}
                    onClick={() => this.command('ERASER')}
                    selected={tool instanceof EraserTool}/>
                <Separator/>
                <Button
                    icon={`palette`} iconSize={50}
                    onClick={() => this.command('PALETTE_COMPOSER')}
                    selected={tool instanceof PaletteComposerTool}
                />
                <Button
                    icon={`gradient`} iconSize={50}
                    onClick={() => this.command('DITHER')}
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
                items={items}
            >
                <CanvasView controller={this.props.controller} />
            </ToolbarView>
        );
    }
}