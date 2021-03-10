import * as React from "react";
import {IconCanvasController} from "../model/IconCanvasController";
import {makeSz, Size} from "../hui/helpers/Rectangle";
import {BookController} from "../model/BookController";
import {Label} from "../hui/items/Label";
import {BookEditor} from "./BookEditor";
import {BookService} from "../model/BookService";
import {DocumentService} from "../model/DocumentService";

const DEFAULT_ICON = makeSz(32, 32);

export interface AppProps{}

export interface AppState{
    bookController?: BookController;
}

export class App extends React.Component<AppProps, AppState>{

    static activeController: IconCanvasController;

    constructor(props: AppProps) {
        super(props);

        this.state = {};
    }

    private handleNewBook(sz: Size){
        const book = BookService.newBook(sz);
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

        let content = <Label text={'Loading...'}/>;

        if (this.state.bookController){
            content = <BookEditor
                        bookController={this.state.bookController}
                        onNewBook={sz => this.handleNewBook(sz)}
                      />;
        }

        return (
            <div id={`app`}>
                {content}
            </div>
        );
    }

}