import * as React from 'react';
import {DockView} from "../hui/layout/DockView";
import {IconEditor} from "./IconEditor";
import {ToolbarView} from "../hui/layout/ToolbarView";
import {EditorMainToolbar} from "./EditorMainToolbar";
import {EditorControls} from "./EditorControls";
import {BookController} from "../model/BookController";
import {IconEditorTool} from "../model/IconEditor";
import {IconCanvasController} from "../model/IconCanvasController";
import {App} from "./App";
import {Size} from "../hui/helpers/Rectangle";
import {SelectionTool} from "../model/tools/SelectionTool";
import {IconPreview} from "./BookPreviews";
import {BookCommands, MAPPINGS} from "./BookCommands";

export interface BookEditorProps{
    bookController: BookController;
    onNewBook?: (size: Size) => void;
}

export interface BookEditorState{
    iconController: IconCanvasController;
    iconControllers: IconCanvasController[];
    iconPreviews: IconPreview[];
    tool: IconEditorTool | null;
    undos: number;
    redos: number;
    showBackground: boolean;
    showGrid: boolean;
}

export class BookEditor extends React.Component<BookEditorProps, BookEditorState>{

    private keyboardHandler = (e: KeyboardEvent) => this.handleKeyboard(e);

    constructor(props: BookEditorProps){
        super(props);

        this.state = this.initBookController(props.bookController);

    }

    private initBookController(bookController: BookController): BookEditorState{

        bookController.onUpdated = () => {
            const iconControllers = this.props.bookController.iconControllers;
            const iconPreviews = this.props.bookController.iconPreviews;
            this.setState({iconControllers, iconPreviews});
        };

        const iconController = bookController.iconControllers[0];
        const iconControllers = bookController.iconControllers;
        const iconPreviews = bookController.iconPreviews;
        const tool = new SelectionTool(iconController);

        iconControllers.forEach(ctl => this.initController(ctl));

        return {
            iconController,
            iconControllers,
            iconPreviews,
            tool,
            undos: 0,
            redos: 0,
            showBackground: true,
            showGrid: true,
        };

    }

    private initController(iconController: IconCanvasController){
        if(this.state){
            iconController.showBackground = this.state.showBackground;
            iconController.showGrid = this.state.showBackground;
        }else{
            iconController.showBackground = true;
            iconController.showGrid = true;
        }
    }

    private newBook(size: Size){
        if (this.props.onNewBook){
            this.props.onNewBook(size);
        }
    }

    private addIcon(size: Size){
        const iconController = this.props.bookController.addIcon(size);

        this.initController(iconController);

        this.setState({iconController});
    }

    private removeIcon(id: string){

        const ctl = this.props.bookController.removeIcon(id);

        if (ctl){
            this.initController(ctl);
            this.getCommands().commandGoToIcon(ctl.id);
        }else{
            this.getCommands().commandGoToIcon(this.state.iconControllers[0].id);
        }

    }

    private getCommands(): BookCommands{
        return new BookCommands(this.props.bookController, this.state, state => this.setState(state));
    }

    private handleDragOver(e: React.DragEvent<HTMLDivElement>){
        e.preventDefault();
    }

    private handleDrop(e: React.DragEvent<HTMLDivElement>){
        e.preventDefault();

        if (e.dataTransfer?.items && e.dataTransfer.items.length > 0){
            const item = e.dataTransfer.items[0];
            const file = item.getAsFile();

            if (file){
                this.getCommands().importFile(file);
            }else{
                console.log(`Can't get as file`)
            }
        }
    }

    private handleKeyboard(e: KeyboardEvent){
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
                    map.command(this.getCommands());
                    e.preventDefault();
                }
            });
    }

    componentDidMount() {
        document.addEventListener('keydown', this.keyboardHandler);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyboardHandler);
    }

    componentDidUpdate(prevProps: Readonly<BookEditorProps>, prevState: Readonly<BookEditorState>, snapshot?: any) {
        App.activeController = this.state.iconController;

        if (prevProps.bookController !== this.props.bookController){
            this.setState(this.initBookController(this.props.bookController));
            this.props.bookController.persist();
        }

        if (prevState.tool !== this.state.tool){
            this.state.iconController.tool = this.state.tool;
        }
    }

    render() {

        const {bookController} = this.props;
        const {tool, iconController, iconControllers, iconPreviews} = this.state;
        const commands = this.getCommands();

        const mainToolbarItems = <EditorMainToolbar
            iconController={iconController}
            showBackground={this.state.showBackground}
            showGrid={this.state.showGrid}
            commands={commands}
            onNewBook={size => this.newBook(size)}
        />;

        const sideBar = <EditorControls
            tool={tool}
            bookController={bookController}
            iconController={iconController}
            iconControllers={iconControllers}
            iconPreviews={iconPreviews}
            onAddIcon={s => this.addIcon(s)}
            onRemoveIcon={id => this.removeIcon(id)}
            onGoToIcon={id => commands.commandGoToIcon(id)}
        />;

        return (
            <div className="drag-wrap" onDragOver={e => this.handleDragOver(e)} onDrop={e => this.handleDrop(e)}>
                <ToolbarView sideClassNames={`main-tools`} length={70} items={mainToolbarItems}>
                    <DockView side={`right`} sideView={sideBar}>
                        <IconEditor
                            controller={iconController}
                            tool={tool}
                            commands={commands}
                        />
                    </DockView>
                </ToolbarView>
            </div>
        );
    };
}