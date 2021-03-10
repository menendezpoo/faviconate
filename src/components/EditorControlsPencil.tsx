import * as React from 'react';
import {PencilTool} from "../model/tools/PencilTool";
import {Color} from "../hui/helpers/Color";
import {ColorPicker} from "../hui/items/ColorPicker";
import {Expando} from "./Expando";

export interface EditorControlsPencilProps{
    tool: PencilTool;
}

interface EditorControlsPencilState{}

export class EditorControlsPencil extends React.Component<EditorControlsPencilProps, EditorControlsPencilState>{

    constructor(props: EditorControlsPencilProps){
        super(props);
    }

    private colorPicked(c: Color){
        this.props.tool.color = c;
    }

    render() {
        return (
            <Expando title={`Pencil Color`}>
                <ColorPicker colorPicked={color => this.colorPicked(color)}/>
            </Expando>
        );
    };
}