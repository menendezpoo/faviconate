import * as React from 'react';
import {Button} from "../hui/items/Button";
import {MenuItem} from "../hui/items/MenuItem";
import {Separator} from "../hui/items/Separator";
import {IconCanvasController} from "../model/IconCanvasController";
import {ToolCommand} from "./App";

export interface EditorMainToolbarProps{
    controller: IconCanvasController;
    showBackground: boolean;
    showGrid: boolean;
    onNewBook: (size: number) => void;
    onCommand: (cmd: ToolCommand) => void;
}

interface EditorMainToolbarState{}

export class EditorMainToolbar extends React.Component<EditorMainToolbarProps, EditorMainToolbarState>{

    constructor(props: EditorMainToolbarProps){
        super(props);
    }

    render() {
        const controller = this.props.controller;

        const newBook = (size: number) => {
           return () => this.props.onNewBook(size);
        };

        const cmd = (cmd: ToolCommand) => {
            return () => this.props.onCommand(cmd);
        };

        const undos = controller.editor.undoCount === 0;
        const redos = controller.editor.redoCount === 0;

        return (
            <>
                <Button text={`faviconate`}>
                    <MenuItem text={`New 16x16 Icon`} onActivate={newBook(16)}/>
                    <MenuItem text={`New 32x32 Icon`} onActivate={newBook(32)}/>
                    <MenuItem text={`New 64x64 Icon`} onActivate={newBook(64)}/>
                    <MenuItem text={`New 128x128 Icon`} onActivate={() => newBook(128)}/>
                    <MenuItem text={`New 256x256 Icon`} onActivate={() => newBook(256)}/>
                    <Separator/>
                    <MenuItem text={`Import File`} onActivate={cmd('IMPORT_FILE')}/>
                </Button>
                <Separator/>
                <Button icon={`undo`} iconSize={50} onClick={cmd('UNDO')} disabled={undos}/>
                <Button icon={`redo`} iconSize={50} onClick={cmd('REDO')} disabled={redos}/>
                <Separator/>
                <Button icon={`cut`} iconSize={50} onClick={cmd('CUT')}/>
                <Button icon={`copy`} iconSize={50} onClick={cmd('COPY')}/>
                <Button icon={`paste`} iconSize={50} onClick={cmd('PASTE')}/>
                <Separator/>
                <Button
                    icon={`checker`} iconSize={50}
                    onClick={cmd('SWAP_BG')}
                    selected={this.props.showBackground}
                />
                <Button
                    icon={`grid`} iconSize={50}
                    onClick={cmd('SWAP_GRID')}
                    selected={this.props.showGrid}
                />
                <Separator/>
                <Button icon={`eye`} iconSize={50} onClick={cmd('REVIEW_STUDIO')} />

            </>);
    };
}