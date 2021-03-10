import * as React from 'react';
import {Button} from "../hui/items/Button";
import {MenuItem} from "../hui/items/MenuItem";
import {Separator} from "../hui/items/Separator";
import {IconCanvasController} from "../model/IconCanvasController";
import {makeSz, Size} from "../hui/helpers/Rectangle";
import {BookCommands} from "./BookCommands";

export interface EditorMainToolbarProps{
    iconController: IconCanvasController;
    showBackground: boolean;
    showGrid: boolean;
    commands: BookCommands;
    onNewBook: (size: Size) => void;
}

interface EditorMainToolbarState{}

export class EditorMainToolbar extends React.Component<EditorMainToolbarProps, EditorMainToolbarState>{

    constructor(props: EditorMainToolbarProps){
        super(props);
    }

    render() {
        const controller = this.props.iconController;

        const newBook = (size: number) => {
           return () => this.props.onNewBook(makeSz(size, size));
        };

        const cmd = this.props.commands;
        const undos = controller.editor.undoCount === 0;
        const redos = controller.editor.redoCount === 0;

        return (
            <>
                <Button text={`faviconate`}>
                    <MenuItem text={`New Project: 16x16`} onActivate={newBook(16)}/>
                    <MenuItem text={`New Project: 32x32`} onActivate={newBook(32)}/>
                    <MenuItem text={`New Project: 64x64`} onActivate={newBook(64)}/>
                    <MenuItem text={`New Project: 128x128`} onActivate={() => newBook(128)}/>
                    <MenuItem text={`New Project: 256x256`} onActivate={() => newBook(256)}/>
                    <Separator/>
                    <MenuItem text={`Import File`} onActivate={() => cmd.commandImportFileDialog()}/>
                </Button>
                <Separator/>
                <Button icon={`undo`} iconSize={50} onClick={() => cmd.commandUndo()} disabled={undos}/>
                <Button icon={`redo`} iconSize={50} onClick={() => cmd.commandRedo()} disabled={redos}/>
                <Separator/>
                <Button icon={`cut`} iconSize={50} onClick={() => cmd.commandCut()}/>
                <Button icon={`copy`} iconSize={50} onClick={() => cmd.commandCopy()}/>
                <Button icon={`paste`} iconSize={50} onClick={() => cmd.commandPaste()}/>
                <Separator/>
                <Button
                    icon={`checker`} iconSize={50}
                    onClick={() => cmd.commandSwapBg()}
                    selected={this.props.showBackground}
                />
                <Button
                    icon={`grid`} iconSize={50}
                    onClick={() => cmd.commandSwapGrid()}
                    selected={this.props.showGrid}
                />
                <Separator/>
                <Button icon={`eye`} iconSize={50} onClick={() => cmd.commandReview()} />

            </>);
    };
}