import * as React from "react";
import * as ReactDOM from "react-dom";
import {ToolbarView} from "../hui/layout/ToolbarView";
import {DockView} from "../hui/layout/DockView";
import {IconCanvasController} from "../model/IconCanvasController";
import {EraserTool} from "../model/tools/EraserTool";
import {PencilTool} from "../model/tools/PencilTool";
import {Color} from "../hui/helpers/Color";
import {IconDocument, IconEditorTool} from "../model/IconEditor";
import {SelectionDragMode, SelectionTool} from "../model/tools/SelectionTool";
import {IconDirectory, IconService} from "../model/IconService";
import {makeSz, Size} from "../hui/helpers/Rectangle";
import {InvalidImageError} from "../model/errors";
import {FloodFillTool} from "../model/tools/FloodFillTool";
import {darkModeOn} from "../hui/helpers/Utils";
import {iconSz} from "../model/Icon";
import {AdjustTool} from "../model/tools/AdjustTool";
import {ReviewStudio} from "./ReviewStudio";
import {DocumentService} from "../model/DocumentService";
import {PaletteComposerTool} from "../model/tools/PaletteComposerTool";
import {CanvasEditor} from "./CanvasEditor";
import {IconPreview} from "./BookPreviews";
import {EditorControls} from "./EditorControls";
import {EditorMainToolbar} from "./EditorMainToolbar";

const DEFAULT_ICON = makeSz(32, 32);

export type ToolCommand = 'SELECTION' | 'PEN' | 'FLOOD' | 'ERASER' | 'PALETTE_COMPOSER' | 'DITHER' |
    'UNDO' | 'REDO' | 'CUT' | 'COPY' | 'PASTE' | 'SWAP_BG' | 'SWAP_GRID' | 'REVIEW_STUDIO' |
    'IMPORT_FILE' | 'SELECT_ALL';

interface KeyMapping{
    command: ToolCommand;
    key: string;
    flat?: boolean;
    shift?: boolean;
}

const MAPPINGS: KeyMapping[] = [
    {key: 'z', command: 'REDO', shift: true},
    {key: 'z', command: 'UNDO'},
    {key: 'v', command: 'PASTE'},
    {key: 'c', command: 'COPY'},
    {key: 'x', command: 'CUT'},
    {key: 'a', command: 'SELECT_ALL'},

    {key: 'd', command: 'PEN', flat: true},
    {key: 'v', command: 'SELECTION', flat: true},
    {key: 'f', command: 'FLOOD', flat: true},
    {key: 'e', command: 'ERASER', flat: true},
    {key: 'b', command: 'SWAP_BG', flat: true},
    {key: 'g', command: 'SWAP_GRID', flat: true},
];

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

export interface AppProps{}

export interface AppState{
    controller: IconCanvasController;
    controllers: IconCanvasController[];
    previews: IconPreview[];
    selectedTool: IconEditorTool | null;
    selectionMove?: SelectionDragMode;
    undos: number;
    redos: number;
    showBackground: boolean;
    showGrid: boolean;
    colorA: Color;
}

export class App extends React.Component<AppProps, AppState>{

    static activeController: IconCanvasController;

    constructor(props: AppProps) {
        super(props);

        this.state = this.newDocumentState(DEFAULT_ICON);
        const icon = this.state.controller.editor.document.icon;
        const id = this.state.controller.id;

        IconService.asBlobUrl(icon).then(data => this.setState({previews: [{id, data}]}));

        DocumentService.restoreIcons().then(icons => {
            if (icons && icons.length > 0){
                this.setIcons({icons});
            }
        });

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

            this.persist();
        })
    }

    private setIcons(dir: IconDirectory){

        console.log(`Set icons`)
        console.log(dir);

        if (dir.icons.length == 0){
            throw new InvalidImageError();
        }

        const controllers = dir.icons.map(icon => this.createController({icon}));
        const controller = controllers[0];
        const selectedTool = new SelectionTool(controller);

        Promise.all(
            controllers.map(async c => {
                return {
                    id: c.id,
                    data: await IconService.asBlobUrl(c.editor.document.icon)
                }
            })
        ).then(previews => this.setState({
            controller,
            controllers,
            selectedTool,
            previews,
        }));

    }

    private removeIconEntry(id?: number){

        if(typeof id === 'undefined'){
            id = this.state.controller.id;
        }

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
                    });
                });

        }else{

            controller = controllers[currentIcon];

            this.setState({
                controllers, controller, previews, selectedTool: controller.tool
            });


        }

        this.persist();

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

    private commandCopy(){
        this.state.controller.copy()
            .then(() => console.log("Copied"))
            .catch(e => console.log(`Not copied: ${e}`));
    }

    private commandCut(){
        this.state.controller.cut()
            .then(() => console.log("Did cut"))
            .catch(e => console.log(`Didn't cut: ${e}`));
    }

    private commandPaste(){
        this.state.controller.paste()
            .then(r => {

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

    private commandImportFileDialog(){
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

    private commandUseDither(){
        this.useTool(new AdjustTool(this.state.controller));
    }

    private commandUseEraser(){
        this.useTool(new EraserTool(this.state.controller));
    }

    private commandUseFlood(){
        this.useTool(new FloodFillTool(this.state.controller));
    }

    private commandUsePaletteComposer(){
        this.useTool(new PaletteComposerTool(this.state.controller));
    }

    private commandUsePen(){
        this.useTool(new PencilTool(this.state.controller));
    }

    private commandUseSelection(){
        this.useTool(new SelectionTool(this.state.controller));
    }

    private commandSwapBg(){
        this.setState({showBackground: !this.state.showBackground});
    }

    private commandSwapGrid(){
        this.setState({showGrid: !this.state.showGrid});
    }

    private commandSelectAll(){
        if (!(this.state.selectedTool instanceof SelectionTool)){
            this.commandUseSelection();
        }
        setTimeout(() => (this.state.selectedTool as SelectionTool).selectAll());
    }

    private commandReview(){

        const dismiss = () => {
            ReactDOM.unmountComponentAtNode(document.getElementById(`root-dialog`)!);
        };

        ReactDOM.render(
            <ReviewStudio icon={this.state.controller.editor.document.icon} onCloseRequested={dismiss}/>,
            document.getElementById(`root-dialog`)
        );
    }

    private commandUndo(){
        this.state.controller.editor.undo();
        const undos = this.state.undos + 1;

        if (this.state.controller.editor.undoPeek?.selectionRegion && !(this.state.selectedTool instanceof SelectionTool)){
            this.setState({undos, selectedTool: new SelectionTool(this.state.controller)});
        }else{
            this.setState({undos});
        }

    }

    private commandRedo(){
        this.state.controller.editor.redo();
        const redos = this.state.redos + 1;

        if (this.state.controller.editor.redoPeek?.selectionRegion && !(this.state.selectedTool instanceof SelectionTool)){
            this.setState({redos, selectedTool: new SelectionTool(this.state.controller)});
        }else{
            this.setState({redos});
        }
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

    private colorPick(color: Color){

        this.state.controllers.forEach(c => {
            if (c.tool && c.tool.useColor){
                c.tool.useColor(color);
            }
        });

        this.setState({colorA: color});
    }

    private useTool(tool: IconEditorTool){
        this.setState({selectedTool: tool});
    }

    private createController(doc: IconDocument): IconCanvasController{

        const controller = new IconCanvasController(doc);

        const docChanged = () => {
            const icon = this.state.controller.editor.document.icon;
            const id = this.state.controller.id;

            IconService.asBlobUrl(icon).then(data => this.setPreviewData(id, data));

        }

        controller.editor.documentSubmitted = () => {
            docChanged();
            this.persist();
        }
        controller.editor.documentChanged = () => docChanged();

        return controller;
    }

    private persist(){
        DocumentService.saveIcons(this.state.controllers.map(c => c.editor.document.icon))
            .then(() => console.log('Saved'))
            .catch(() => console.log('Error saving'));
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

    private getMainToolbarItems(){

        return <EditorMainToolbar
            controller={this.state.controller}
            showBackground={this.state.showBackground}
            showGrid={this.state.showGrid}
            onNewBook={size => this.newDocument(size)}
            onCommand={cmd => this.canvasCommand(cmd)}
        />;
    }

    private getSideBar(){

        const {selectedTool, controller, controllers, previews} = this.state;

        return (
            <EditorControls
                tool={selectedTool}
                controller={controller}
                controllers={controllers}
                previews={previews}
                onColorPicked={c => this.colorPick(c)}
                onNewIcon={s => this.newIconEntry(s)}
                onRemoveIcon={id => this.removeIconEntry(id)}
                onGoToIcon={id => this.goToIcon(id)}
            />);
    }

    private canvasCommand(c: ToolCommand){
        switch (c){
            case "DITHER":              this.commandUseDither(); return;
            case "ERASER":              this.commandUseEraser(); return;
            case "FLOOD":               this.commandUseFlood(); return;
            case "PALETTE_COMPOSER":    this.commandUsePaletteComposer(); return;
            case "PEN":                 this.commandUsePen(); return;
            case "SELECTION":           this.commandUseSelection(); return;
            case "COPY":                this.commandCopy(); return;
            case "CUT":                 this.commandCut(); return;
            case "IMPORT_FILE":         this.commandImportFileDialog(); return;
            case "PASTE":               this.commandPaste(); return;
            case "REDO":                this.commandRedo(); return;
            case "REVIEW_STUDIO":       this.commandReview(); return;
            case "SWAP_BG":             this.commandSwapBg(); return;
            case "SWAP_GRID":           this.commandSwapGrid(); return;
            case "UNDO":                this.commandUndo(); return;
            case "SELECT_ALL":          this.commandSelectAll(); return;
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', e => {

            const focused = document.querySelector("*:focus");

            if (focused && (focused.tagName == 'INPUT' || focused.tagName == 'TEXTAREA')){
                return;
            }

            const ctrlMeta = e.ctrlKey || e.metaKey;

            MAPPINGS
                .filter(map => map.key === e.key)
                .forEach(map => {
                    if(
                        (map.flat && !e.shiftKey && !ctrlMeta) ||
                        (!map.flat && !!map.shift && e.shiftKey) ||
                        (!map.flat && ctrlMeta)
                    ){
                        this.canvasCommand(map.command);
                        e.preventDefault();
                    }
                });
        });
    }

    componentDidUpdate(prevProps: Readonly<AppProps>, prevState: Readonly<AppState>, snapshot?: any) {
        App.activeController = this.state.controller;
    }

    render() {

        const controller = this.state.controller;
        const currentId = controller.id;
        const tool = this.state.selectedTool;
        const mainToolbarItems = this.getMainToolbarItems();
        const sideBar = this.getSideBar();

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
                    <CanvasEditor
                        controller={controller}
                        tool={tool}
                        onCommand={c => this.canvasCommand(c)}
                    />
                </DockView>
            </ToolbarView>
            </div>
        );
    }

}