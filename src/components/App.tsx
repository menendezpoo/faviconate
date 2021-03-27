import * as React from "react";
import {IconCanvasController} from "../model/IconCanvasController";
import {makeSz, Size} from "../hui/helpers/Rectangle";
import {BookController} from "../model/BookController";
import {Label} from "../hui/items/Label";
import {BookEditor} from "./BookEditor";
import {BookService} from "../model/BookService";
import {DocumentService} from "../model/DocumentService";
import {BackstageView} from "./BackstageView";
import {BookCommands} from "./BookCommands";

const DEFAULT_ICON = makeSz(32, 32);

export interface AppProps{}

export interface AppState{
    bookController?: BookController;
    backstageMode?: boolean;
    commands?: BookCommands;
}

export class App extends React.Component<AppProps, AppState>{

    static activeController: IconCanvasController;

    constructor(props: AppProps) {
        super(props);

        this.state = {};
    }

    private goBackstageMode(commands: BookCommands){
        this.setState({backstageMode: true, commands});
    }

    private goBookMode(){
        this.setState({backstageMode: false});
    }

    private handleNewBook(sz?: Size){
        const book = BookService.newBook(sz || DEFAULT_ICON);
        const bookController: BookController = new BookController(book);
        this.setState({bookController});
    }

    componentDidMount() {

        DocumentService.restoreIcons().then(icons => {

            let book = BookService.newBook(DEFAULT_ICON);

            if (icons && icons.length > 0){
                book = BookService.fromIcons(icons);
            }

            const bookController: BookController = new BookController(book);
            this.setState({bookController});
        });

    }

    render() {

        let {backstageMode, bookController, commands} = this.state;

        let content = <Label text={'Loading...'}/>;

        if (backstageMode && commands){
            content = <BackstageView
                        commands={commands}
                        onNewBook={() => this.handleNewBook()}
                        onExit={() => this.goBookMode()}
                      />;
        }else if (bookController){
            content = <BookEditor
                        bookController={bookController}
                        onNewBook={sz => this.handleNewBook(sz)}
                        onBackstageMode={commands => this.goBackstageMode(commands)}
                      />;
        }

        return (
            <div id={`app`}>
                {content}
            </div>
        );
    }

}