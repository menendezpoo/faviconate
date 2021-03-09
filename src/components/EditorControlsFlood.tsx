import * as React from 'react';
import {FloodFillTool} from "../model/tools/FloodFillTool";
import {Color} from "../hui/helpers/Color";
import {ColorPicker} from "../hui/items/ColorPicker";
import {Expando} from "./Expando";

export interface EditorControlsFloodProps{
    tool: FloodFillTool;
    onColorPicked: (c: Color) => void;
}

interface EditorControlsFloodState{}

export class EditorControlsFlood extends React.Component<EditorControlsFloodProps, EditorControlsFloodState>{

    constructor(props: EditorControlsFloodProps){
        super(props);
    }

    render() {
        return (
            <Expando title={`Fill Color`}>
                <ColorPicker colorPicked={color => this.props.onColorPicked(color)}/>
            </Expando>
        );
    };
}