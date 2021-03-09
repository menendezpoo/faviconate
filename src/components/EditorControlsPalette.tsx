import * as React from 'react';
import {PaletteComposerTool} from "../model/tools/PaletteComposerTool";
import {Expando} from "./Expando";
import {ColorReplacer} from "./ColorReplacer";
import {PaletteExpando} from "./PaletteExpando";
import {ColorUsageReport} from "./ColorUsageReport";
import {Palette} from "../model/PaletteService";

export interface EditorControlsPaletteProps{
    tool: PaletteComposerTool;
}

interface EditorControlsPaletteState{
    composingPalette?: Palette;
}

export class EditorControlsPalette extends React.Component<EditorControlsPaletteProps, EditorControlsPaletteState>{

    constructor(props: EditorControlsPaletteProps){
        super(props);
        this.state = {};
    }

    render() {

        const {tool} = this.props;
        const icon = tool.controller.editor.document.icon;

        return (
            <>
                <Expando title={`Color Replace`}>
                    <ColorReplacer
                        onStart={() => tool.colorReplaceStart()}
                        onCancel={() => tool.colorReplaceCancel()}
                        onOldColorPicked={c => tool.colorReplaceSelectOld(c)}
                        onColorPreview={c => tool.colorReplaceSelectNew(c)}
                        onColorSelected={c => tool.colorReplaceConfirm(c)}
                    />
                </Expando>
                <PaletteExpando onPaletteChanged={composingPalette => this.setState({composingPalette})} title={`Palette Library`}/>
                <Expando title={`Color Usage`}>
                    <ColorUsageReport
                        palette={this.state.composingPalette}
                        data={icon.data}/>
                </Expando>

            </>
        );
    };
}