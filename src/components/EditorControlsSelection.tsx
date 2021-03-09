import * as React from "react";
import {Expando} from "./Expando";
import {Label} from "../hui/items/Label";
import {ItemGroup} from "../hui/items/ItemGroup";
import {Button} from "../hui/items/Button";
import {SelectionDragMode, SelectionTool} from "../model/tools/SelectionTool";

export interface EditorControlsSelectionProps{
    tool: SelectionTool;
}

interface EditorControlsSelectionState{
    selectionMove: SelectionDragMode;
}

export class EditorControlsSelection extends React.Component<EditorControlsSelectionProps, EditorControlsSelectionState>{

    constructor(props: EditorControlsSelectionProps) {
        super(props);

        this.state = {selectionMove: 'sprite'}
    }

    private commandSelectAll(){
        this.props.tool.selectAll();
    }

    private commandSelectionMove(selectionMove: SelectionDragMode){
        this.props.tool.dragMode= selectionMove;
        this.setState({selectionMove});
    }

    private commandClearSelection(){
        this.props.tool.clearSelection();
    }

    private commandDeleteSelection(){
        this.props.tool.deleteSelection();
    }

    private commandCrop(){
        this.props.tool.cropToSelection();
    }

    render() {

        const {tool} = this.props;
        const {selectionMove} = this.state;
        const doc = tool.controller.editor.document;
        const size = doc.selectionRegion ? `${doc.selectionRegion.width} x ${doc.selectionRegion.height}` : `Nothing Selected`;

        return (
            <Expando title={`Selection`} items={<Label text={size}/>}>
                <ItemGroup selectedIndex={selectionMove === 'area' ? 1 : 0}>
                    <Button text={`Move Sprite`} onClick={() => this.commandSelectionMove('sprite')}/>
                    <Button text={`Move Selection`} onClick={() => this.commandSelectionMove('area')}/>
                </ItemGroup>
                <Button text={`Select All`} iconSize={20} icon={`full-frame`} onClick={() => this.commandSelectAll()}/>
                <Button text={`Clear Selection`} iconSize={20} icon={`corners`} onClick={() => this.commandClearSelection()}/>
                <Button text={`Delete Selection`}  iconSize={20} icon={`grid-crossed`} onClick={() => this.commandDeleteSelection()}/>
                <Button text={`Crop`} iconSize={20} icon={`crop`} onClick={() => this.commandCrop()}/>
            </Expando>
        );
    }
}