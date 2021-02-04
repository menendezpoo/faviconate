import * as React from "react";
import {ToolbarView} from "../hui/layout/ToolbarView";
import {Button} from "../hui/items/Button";
import {Range} from "../hui/items/Range";
import {Separator} from "../hui/items/Separator";
import {DockView} from "../hui/layout/DockView";
import {CanvasView} from "./CanvasView";
import {DownloadFormat, IconCanvasController} from "../model/IconCanvasController";
import {EraserTool} from "../model/tools/EraserTool";
import {PencilTool} from "../model/tools/PencilTool";
import {Color} from "../hui/helpers/Color";
import {ColorPicker} from "../hui/items/ColorPicker";
import {PreviewPanel} from "./PreviewPanel";
import {IconDocument, IconEditorTool} from "../model/IconEditor";
import {SelectionTool} from "../model/tools/SelectionTool";
import {IconDirectory, IconService} from "../model/IconService";
import {MenuItem} from "../hui/items/MenuItem";
import {compareSize, makeSz, Size} from "../hui/helpers/Rectangle";
import {InvalidImageError} from "../model/errors";
import {FloodFillTool} from "../model/tools/FloodFillTool";
import {darkModeOn} from "../hui/helpers/Utils";
import {Expando} from "./Expando";
import {iconSz} from "../model/Icon";
import {Label} from "../hui/items/Label";
import {AdjustTool} from "../model/tools/AdjustTool";
import {PaletteManager} from "./PaletteManager";
import {Palette, PaletteService} from "../model/PaletteService";

const DEFAULT_ICON = makeSz(32, 32);

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

export function cue(m: string){
    const e = document.getElementById('cue');

    if (e){
        e.innerHTML = m + '<br>' + e.innerHTML;
    }
}

export interface AppProps{}

interface IconPreview{
    id: number;
    data: string;
}

export interface AppState{
    controller: IconCanvasController;
    controllers: IconCanvasController[];
    previews: IconPreview[];
    selectedTool: IconEditorTool | null;
    undos: number;
    redos: number;
    showBackground: boolean;
    showGrid: boolean;
    colorA: Color;
}

export class App extends React.Component<AppProps, AppState>{

    constructor(props: AppProps) {
        super(props);

        this.state = this.newDocumentState(DEFAULT_ICON);
        const icon = this.state.controller.editor.document.icon;
        const id = this.state.controller.id;
        IconService.asBlobUrl(icon).then(data => this.setState({previews: [{id, data}]}));

    }

    private newDocumentState(size: Size): AppState{
        const icon = IconService.newIcon(size.width, size.height);
        const controller = this.createController({icon});
        const selectedTool = new PencilTool(controller);

        return {
            controller,
            selectedTool,
            controllers: [controller],
            previews: [],
            undos: 0,
            redos: 0,
            showBackground: true,
            showGrid: true,
            colorA: darkModeOn() ? Color.white : Color.black,
        }
    }

    private newDocument(size: number){

        const icon = IconService.newIcon(size, size)
        const doc = {icon};
        const controller = this.createController(doc);

        this.setState({
            controller,
            controllers: [controller],
            previews: [],
            selectedTool: new SelectionTool(controller)
        });
    }

    private async newIconEntry(size: number){

        const blob = await IconService.asBlobWithMime(this.state.controller.editor.document.icon );
        const icon = await IconService.fromFile(blob, makeSz(size, size), true);
        const doc = {icon};
        const controller = this.createController(doc);
        const selectedTool = new SelectionTool(controller);
        const controllers = [...this.state.controllers, controller];

        (selectedTool as SelectionTool).selectAll();

        IconService.asBlobUrl(icon).then(data => {

            const previews = [...this.state.previews, {id: controller.id, data, size: iconSz(icon)}];
            this.setState({
                controller,
                controllers,
                selectedTool,
                previews
            });
        })
    }

    private setIcons(dir: IconDirectory){

        if (dir.icons.length == 0){
            throw new InvalidImageError();
        }

        const controllers = dir.icons.map(icon => this.createController({icon}));
        const controller = controllers[0];
        const currentIcon = controller.id;
        const selectedTool = new SelectionTool(controller);

        Promise.all(controllers.map(c => IconService.asBlobUrl(c.editor.document.icon)))
            .then(dataArr => {
                this.setState({
                    controller,
                    controllers,
                    selectedTool,
                    previews: dataArr.map((data, i) => ({id: controller.id, data, size: controllers[i].iconSize}))
                });
            });
    }

    private removeIconEntry(){

        const id = this.state.controller.id;
        let controllers = this.state.controllers.filter((item) => item.id !== id);
        let previews = this.state.previews.filter((item, i) => item.id !== id);
        let controller: IconCanvasController;
        let currentIcon = 0;

        if (controllers.length == 0){
            controller =this.createController({icon: IconService.newIcon(DEFAULT_ICON.width, DEFAULT_ICON.height)});
            controllers = [controller];
            const selectedTool = new SelectionTool(controller)
            IconService.asBlobUrl(controller.editor.document.icon)
                .then(data => {
                    this.setState({
                        controllers, controller, selectedTool, previews: [{id: controller.id, data}]
                    })
                });

        }else{

            controller = controllers[currentIcon];

            this.setState({
                controllers, controller, previews, selectedTool: controller.tool
            });
        }


    }

    private appDragOver(e: React.DragEvent<HTMLDivElement>){
        e.preventDefault();
    }

    private appDrop(e: React.DragEvent<HTMLDivElement>){
        e.preventDefault();

        if (e.dataTransfer.items){
            for (let i = 0; i < e.dataTransfer.items.length; i++){
                const item = e.dataTransfer.items[i];
                const file = item.getAsFile();

                if (file){
                    this.importFile(file);
                }else{
                    console.log(`Can't get as file`)
                }

                break;
            }
        }else{
            console.log(`No transfer items`)
        }

    }

    private copy(){
        this.state.controller.copy()
            .then(() => console.log("Copied"))
            .catch(e => console.log(`Not copied: ${e}`));
    }

    private cut(){
        this.state.controller.cut()
            .then(() => console.log("Did cut"))
            .catch(e => console.log(`Didn't cut: ${e}`));
    }

    private paste(){
        this.state.controller.paste()
            .then(r => {

                console.log(`Pasted`);

                if (r.warnings.length > 0){
                    console.log(` - Warnings: ${r.warnings.length}`);
                    r.warnings.forEach(w => console.log(`   - ${w}`))
                }

                if (r.success && r.tool){
                    this.setState({selectedTool: r.tool});
                }

            })
            .catch(e => console.log(`Not pasted: ${e}`));
    }

    private importFileDialog(){
        const input: HTMLInputElement = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        input.onchange = e => {
            if (input.files && input.files.length > 0){
                this.importFile(input.files[0]);
            }
        };

        document.body.appendChild(input);

        setTimeout(() => input.click());

    }

    private importFile(file: File){

        if (file.name.toLowerCase().endsWith('.ico')){
            IconService.fromIcoBlob(file)
                .then(dir => this.setIcons(dir))
                .catch(e => console.log(`Can't open ico file: ${e}`));
        }else{
            this.state.controller.importFile(file)
                .then(selectedTool => this.setState({selectedTool}));
        }
    }

    private useAdjustments(){
        this.useTool(new AdjustTool(this.state.controller));
    }

    private useEraser(){
        this.useTool(new EraserTool(this.state.controller));
    }

    private useFlood(){
        this.useTool(new FloodFillTool(this.state.controller));
    }

    private usePen(){
        this.useTool(new PencilTool(this.state.controller));
    }

    private useSelection(){
        this.useTool(new SelectionTool(this.state.controller));
    }

    private colorPick(color: Color){

        this.state.controllers.forEach(c => {
            if (c.tool && c.tool.useColor){
                c.tool.useColor(color);
            }
        });

        this.setState({colorA: color});
    }

    private useTool(tool: IconEditorTool){
        // if (tool.useColor){
        //     tool.useColor(this.state.colorA);
        // }
        this.setState({selectedTool: tool});
    }

    private undo(){
        this.state.controller.editor.undo();
        const undos = this.state.undos + 1;

        if (this.state.controller.editor.undoPeek?.selectionRegion && !(this.state.selectedTool instanceof SelectionTool)){
            this.setState({undos, selectedTool: new SelectionTool(this.state.controller)});
        }else{
            this.setState({undos});
        }

    }

    private redo(){
        this.state.controller.editor.redo();
        const redos = this.state.redos + 1;

        if (this.state.controller.editor.redoPeek?.selectionRegion && !(this.state.selectedTool instanceof SelectionTool)){
            this.setState({redos, selectedTool: new SelectionTool(this.state.controller)});
        }else{
            this.setState({redos});
        }
    }

    private createController(doc: IconDocument): IconCanvasController{

        const controller = new IconCanvasController(doc);

        controller.editor.documentChanged = () => {

            const icon = this.state.controller.editor.document.icon;
            const id = this.state.controller.id;

            IconService.asBlobUrl(icon).then(data => this.setPreviewData(id, data));
        };

        return controller;
    }

    private setPreviewData(id: number, data: string){
        const previews = this.state.previews;
        const p = previews.find(p => p.id === id);

        if(p){
            p.data = data;
            this.setState({previews});
        }else{
            const c = this.state.controllers.find(c => c.id === id);

            if(!c){
                throw new Error();
            }

            this.setState({previews: [...previews, {id, data}]});
        }
    }

    private goToIcon(currentIcon: number){

        const controller = this.state.controllers.find(c => c.id === currentIcon);

        if(!controller){
            throw new Error();
        }

        const selectedTool = controller.tool;

        this.setState({controller, selectedTool});
    }

    private download(format: DownloadFormat){
        this.state.controller.downloadAs(format, this.state.controllers.map(c => c.editor.document.icon))
            .then(() => console.log(`Download triggered`));
    }

    componentDidMount() {
        document.addEventListener('keydown', e => {

            const focused = document.querySelector("*:focus");

            if (focused && (focused.tagName == 'INPUT' || focused.tagName == 'TEXTAREA')){
                return;
            }

            const ctrlMeta = e.ctrlKey || e.metaKey;

            if (e.key == 'z' && ctrlMeta && e.shiftKey){
                this.redo();
                e.preventDefault();

            }else if(e.key == 'z' && ctrlMeta){
                this.undo();
                e.preventDefault();

            }else if(e.key === 'v' && !ctrlMeta){
                this.useSelection();
                e.preventDefault();

            }else if((e.key === 'p' || e.key == 'd') && !ctrlMeta){
                this.usePen();
                e.preventDefault();

            }else if((e.key === 'f') && !ctrlMeta){
                this.useFlood();
                e.preventDefault();

            }else if(e.key === 'e' && !ctrlMeta){
                this.useEraser();
                e.preventDefault();

            }else if(e.key === 'b' && !ctrlMeta){
                this.setState({showBackground: !this.state.showBackground});
                e.preventDefault();

            }else if(e.key === 'g' && !ctrlMeta){
                this.setState({showGrid: !this.state.showGrid});
                e.preventDefault();

            }else if(e.key === 'c' && ctrlMeta){
                this.copy();
                e.preventDefault();

            }else if(e.key === 'v' && ctrlMeta){
                this.paste();
                e.preventDefault();

            }else if(e.key === 'x' && ctrlMeta){
                this.cut();
                e.preventDefault();

            }else if(e.key === 'a' && ctrlMeta){
                if (!(this.state.selectedTool instanceof SelectionTool)){
                    this.useSelection();
                }
                setTimeout(() => (this.state.selectedTool as SelectionTool).selectAll());
                e.preventDefault();
            }
        });
    }

    commandApplyAdjustments(){
        throw new Error('Implement');
    }

    commandContrast(value: number){
        if (this.state.selectedTool instanceof AdjustTool){
            (this.state.selectedTool as AdjustTool).setContrast(value);
        }
    }

    commandBrightness(value: number){
        if (this.state.selectedTool instanceof AdjustTool){
            (this.state.selectedTool as AdjustTool).setBrightness(value);
        }
    }

    commandResetPalette(){
        if (this.state.selectedTool instanceof AdjustTool){
            (this.state.selectedTool as AdjustTool).setPalette(null);
        }
    }

    commandSavePalette(){
        if (this.state.selectedTool instanceof AdjustTool){
            const palette = (this.state.selectedTool as AdjustTool).currentPalette;

            if (!palette){
                throw new Error();
            }

            if (palette.unnamed){
                palette.name = prompt('Name for the palette', palette.name) || 'Unnamed palette';
            }

            PaletteService.upsert(palette)
                .then(p => this.commandSetPalette(p))
                .catch(e => console.log(`Not saved: ${e}`));

        }
    }

    commandSelectAll(){
        if (this.state.selectedTool instanceof SelectionTool){
            (this.state.selectedTool as SelectionTool).selectAll();
        }
    }

    commandSetPalette(palette: Palette){
        if (this.state.selectedTool instanceof AdjustTool){
            (this.state.selectedTool as AdjustTool).setPalette(palette);
        }
    }

    commandClearSelection(){
        if (this.state.selectedTool instanceof SelectionTool){
            (this.state.selectedTool as SelectionTool).clearSelection();
        }
    }

    commandDeleteSelection(){
        if (this.state.selectedTool instanceof SelectionTool){
            (this.state.selectedTool as SelectionTool).deleteSelection();
        }
    }

    commandCrop(){
        if (this.state.selectedTool instanceof SelectionTool){
            (this.state.selectedTool as SelectionTool).cropToSelection();
        }
    }

    toolComponent(): React.ReactNode{
        const tool = this.state.selectedTool;

        if (!tool){
            return <></>;
        }

        const colorable = tool?.useColor;
        const isEraser = tool instanceof EraserTool;
        const doc = this.state.controller.editor.document;

        if (tool instanceof SelectionTool){

            const size = doc.selectionRegion ? `${doc.selectionRegion.width} x ${doc.selectionRegion.height}` : `Nothing Selected`;

            return (
                <Expando title={`Selection`} items={<Label text={size}/>}>
                    <Button text={`Select All`} iconSize={20} icon={`full-frame`} onClick={() => this.commandSelectAll()}/>
                    <Button text={`Clear Selection`} iconSize={20} icon={`corners`} onClick={() => this.commandClearSelection()}/>
                    <Button text={`Delete Selection`}  iconSize={20} icon={`grid-crossed`} onClick={() => this.commandDeleteSelection()}/>
                    <Button text={`Crop`} iconSize={20} icon={`crop`} onClick={() => this.commandCrop()}/>
                </Expando>
            );
        }else if ( colorable && !isEraser ){
            return (
                <Expando title={`Color`}>
                    <ColorPicker colorPicked={color => this.colorPick(color) } />
                </Expando>
            );
        }else if ( tool instanceof AdjustTool ){

            const palette = (tool as AdjustTool).currentPalette;
            let paletteItems = <></>;

            if (palette && palette.unsaved){
                paletteItems = (
                    <>
                        <Button icon={'return'} iconSize={50} onClick={() => this.commandResetPalette()}/>
                        <Button icon={'floppy'} iconSize={50} onClick={() => this.commandSavePalette()}/>
                    </>
                );
            }else if(palette){
                paletteItems = (
                    <>
                        <Button icon={'return'} iconSize={50} onClick={() => this.commandResetPalette()}/>
                    </>
                );
            }

            return (
                <>
                    <Expando title={`Adjust`}>
                        <div className="adjusters">
                            <Range min={-200} max={200} value={0} onChange={value => this.commandBrightness(value)} />
                            <Range min={-128} max={128} value={0} onChange={value => this.commandContrast(value)} />
                        </div>
                    </Expando>
                    <Expando title={`Palette`} items={paletteItems}>
                        <PaletteManager palette={palette || undefined} paletteChanged={p => this.commandSetPalette(p)}/>
                    </Expando>
                    <Button text={`Apply`} onClick={() => this.commandApplyAdjustments()}/>
                </>
            );
        }
    }

    render() {

        const controller = this.state.controller;
        const controllers = this.state.controllers;
        const currentId = controller.id;
        const tool = this.state.selectedTool;
        const mainToolbarItems = <>
            <Button text={`faviconate`}>
                <MenuItem text={`New 16x16 Icon`} onActivate={() => this.newDocument(16)}/>
                <MenuItem text={`New 32x32 Icon`} onActivate={() => this.newDocument(32)}/>
                <MenuItem text={`New 64x64 Icon`} onActivate={() => this.newDocument(64)}/>
                <MenuItem text={`New 128x128 Icon`} onActivate={() => this.newDocument(128)}/>
                <MenuItem text={`New 256x256 Icon`} onActivate={() => this.newDocument(256)}/>
                <Separator/>
                <MenuItem text={`Import File`} onActivate={() => this.importFileDialog()}/>
            </Button>
            <Separator/>
            <Button icon={`undo`} iconSize={50} onClick={() => this.undo()} disabled={controller.editor.undoCount == 0}/>
            <Button icon={`redo`} iconSize={50} onClick={() => this.redo()} disabled={controller.editor.redoCount == 0}/>
            <Separator/>
            <Button icon={`cut`} iconSize={50} onClick={() => this.cut()}/>
            <Button icon={`copy`} iconSize={50} onClick={() => this.copy()}/>
            <Button icon={`paste`} iconSize={50} onClick={() => this.paste()}/>
        </>;
        const toolToolbarItems = <>
            <Button
                icon={`select`} iconSize={50}
                onClick={() => this.useSelection()}
                selected={tool instanceof SelectionTool}
            />
            <Separator/>
            <Button
                icon={`pencil`} iconSize={50}
                onClick={() => this.usePen()}
                selected={tool instanceof PencilTool && !(tool instanceof EraserTool)}
            />
            <Button
                icon={`bucket`} iconSize={50}
                onClick={() => this.useFlood()}
                selected={tool instanceof FloodFillTool}
            />
            <Button
                icon={`eraser`} iconSize={50}
                onClick={() => this.useEraser()}
                selected={tool instanceof EraserTool}/>
            <Separator/>
            <Button
                icon={`checker`} iconSize={50}
                onClick={() => this.setState({showBackground: !this.state.showBackground})}
                selected={this.state.showBackground}
            />
            <Button
                icon={`grid`} iconSize={50}
                onClick={() => this.setState({showGrid: !this.state.showGrid})}
                selected={this.state.showGrid}
            />
            <Separator/>
            <Button
                icon={`equalizer`} iconSize={50}
                onClick={() => this.useAdjustments()}
                selected={tool instanceof AdjustTool}
            />
        </>;

        const sizeOf = (itemId: number): Size => {
            const ctl = controllers.find(c => c.id === itemId);

            if (ctl){
                return ctl.iconSize;
            }
            return makeSz(0,0);
        };

        const sortedPreviews = this.state.previews
            .sort((a, b) => -compareSize(sizeOf(a.id), sizeOf(b.id)));

        const sideBar = (
            <div className="editor-sidebar">
                <Expando title={`Preview`}
                    items={(
                        <>
                            <Button iconSize={50} icon={`plus`}>
                                <MenuItem text={`16 x 16`} onActivate={() => this.newIconEntry(16)}/>
                                <MenuItem text={`32 x 32`} onActivate={() => this.newIconEntry(32)}/>
                                <MenuItem text={`50 x 50`} onActivate={() => this.newIconEntry(50)}/>
                                <MenuItem text={`64 x 64`} onActivate={() => this.newIconEntry(64)}/>
                                <MenuItem text={`128 x 128`} onActivate={() => this.newIconEntry(128)}/>
                                <MenuItem text={`256 x 256`} onActivate={() => this.newIconEntry(256)}/>
                            </Button>
                            <Button iconSize={50} icon={`minus`} disabled={this.state.controllers.length === 0} onClick={() => this.removeIconEntry()}/>
                            <Button iconSize={50} icon={`ellipsis`}/>
                        </>
                    )}
                >
                    {sortedPreviews
                        .map((item) => (
                        <PreviewPanel
                            key={item.id}
                            data={item.data}
                            selected={item.id === currentId}
                            size={sizeOf(item.id)}
                            onActivate={() => this.goToIcon(item.id)}/>
                    ))}
                </Expando>
                {this.toolComponent()}
                <Button text={`PNG`} onClick={() => this.download('png')} icon={`floppy`} iconSize={50}/>
                <Button text={`ICO`} onClick={() => this.download('ico')} icon={`floppy`} iconSize={50}/>
                <div id="cue" className="cue">0.1.1</div>
            </div>
        );

        const preview = this.state.previews.find(p => p.id === currentId);
        if (preview){
            changeFavicon(preview.data);
        }

        controller.tool = tool;
        controller.showBackground = this.state.showBackground;
        controller.showGrid = this.state.showGrid;

        if (controller.tool && controller.tool.useColor){
            controller.tool.useColor(this.state.colorA);
        }

        return (
            <div id={`app`}
                 onDragOver={e => this.appDragOver(e)}
                 onDrop={e => this.appDrop(e)}
            >
            <ToolbarView sideClassNames={`main-tools`} length={70} items={mainToolbarItems}>
                <DockView side={`right`} sideView={sideBar}>
                    <ToolbarView sideClassNames={`main-tools`} length={70} classNames={`canvas-main`} side={`left`} items={toolToolbarItems}>
                        <CanvasView controller={controller} />
                    </ToolbarView>
                </DockView>
            </ToolbarView>
            </div>
        );
    }

}