import * as React from "react";
import {Expando} from "./Expando";
import {Button} from "../hui/items/Button";
import {MenuItem} from "../hui/items/MenuItem";
import {BookPreviews, IconPreview} from "./BookPreviews";
import {DownloadFormat, IconCanvasController} from "../model/IconCanvasController";
import {IconEditorTool} from "../model/IconEditor";
import {SelectionTool} from "../model/tools/SelectionTool";
import {EditorControlsSelection} from "./EditorControlsSelection";
import {EraserTool} from "../model/tools/EraserTool";
import {EditorControlsEraser} from "./EditorControlsEraser";
import {PencilTool} from "../model/tools/PencilTool";
import {EditorControlsPencil} from "./EditorControlsPencil";
import {FloodFillTool} from "../model/tools/FloodFillTool";
import {EditorControlsFlood} from "./EditorControlsFlood";
import {PaletteComposerTool} from "../model/tools/PaletteComposerTool";
import {EditorControlsPalette} from "./EditorControlsPalette";
import {AdjustTool} from "../model/tools/AdjustTool";
import {EditorControlsDither} from "./EditorControlsDither";
import {Color} from "../hui/helpers/Color";

export interface EditorControlsProps{
    tool: IconEditorTool | null;
    controller: IconCanvasController;
    controllers: IconCanvasController[];
    onColorPicked: (color: Color) => void;
    previews: IconPreview[];
    onNewIcon: (size: number) => void;
    onRemoveIcon: (id: number) => void;
    onGoToIcon: (id: number) => void;
}

interface EditorControlsState{}

export class EditorControls extends React.Component<EditorControlsProps, EditorControlsState>{

    private download(format: DownloadFormat){
        this.props.controller.downloadAs(format, this.props.controllers.map(c => c.editor.document.icon))
            .then(() => console.log(`Download triggered`));
    }

    toolComponent(): React.ReactNode{
        const tool = this.props.tool;

        if (!tool){
            return <></>;
        }

        if (tool instanceof SelectionTool) {
            return <EditorControlsSelection tool={tool}/>;

        }else if(tool instanceof EraserTool) {
            return <EditorControlsEraser/>;

        }else if(tool instanceof PencilTool) {
            return <EditorControlsPencil tool={tool} onColorPicked={c => this.props.onColorPicked(c)}/>

        }else if(tool instanceof FloodFillTool){
            return <EditorControlsFlood tool={tool} onColorPicked={c => this.props.onColorPicked(c)}/>

        }else if ( tool instanceof PaletteComposerTool){
            return <EditorControlsPalette tool={tool}/>;

        }else if ( tool instanceof AdjustTool ){
            return <EditorControlsDither tool={tool}/>
        }
    }

    render() {
        const controller = this.props.controller;
        const controllers = this.props.controllers;
        const currentId = controller.id;
        const sizes = [16, 32, 48, 64, 128, 256];

        return (
            <div className="editor-sidebar">
                <Expando
                    title={`Preview`}
                    items={
                        <Button iconSize={50} icon={`plus`}>
                            {sizes.map(size =>
                                <MenuItem
                                    text={`${size}x${size}`}
                                    onActivate={() => this.props.onNewIcon(size)}
                                />)}
                        </Button>}
                >
                    <BookPreviews
                        controllers={controllers}
                        currentController={currentId}
                        previews={this.props.previews}
                        onIconSelected={id => this.props.onGoToIcon(id)}
                        onIconDelete={id => this.props.onRemoveIcon(id)}
                    />
                </Expando>
                {this.toolComponent()}
                <Button text={`PNG`} onClick={() => this.download('png')} icon={`floppy`} iconSize={50}/>
                <Button text={`ICO`} onClick={() => this.download('ico')} icon={`floppy`} iconSize={50}/>
                <div id="cue" className="cue">0.1.3</div>
            </div>
        );
    }
}