import * as React from 'react';
import {Callable} from "../hui/helpers/hui";
import {Button} from "../hui/items/Button";
import {BookCommands} from "./BookCommands";

export interface BackstageViewProps{
    commands: BookCommands;
    onExit?: Callable;
    onNewBook: () => void;
}

interface BackstageViewState{}

export class BackstageView extends React.Component<BackstageViewProps, BackstageViewState>{

    private windowKeyHandler = (e: KeyboardEvent) => this.onWindowKey(e);

    constructor(props: BackstageViewProps){
        super(props);
    }

    private onWindowKey(e: KeyboardEvent){
        if (e.key === 'Escape'){
            this.onExit();
        }
    }

    private onExit(){
        if (this.props.onExit){
            this.props.onExit();
        }
    }

    private newBook(){
        this.onExit();
        this.props.onNewBook();
    }

    private importImage(){
        this.onExit();
        this.props.commands.commandImportFileDialog();
    }

    componentDidMount() {
        window.addEventListener('keydown', this.windowKeyHandler);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.windowKeyHandler);
    }

    render() {
        return (
            <div className="backstage-view">
                <div className="head">
                    <div className="near">
                        <div className="back-button ui-icon icon-circle-back-large-white size-50"
                             tabIndex={0}
                             onClick={() => this.onExit()}
                        />
                        <div className="logo-and-tag-line">
                            <div className="logo"><span>fav</span><strong>icon</strong><span>ate</span></div>
                            <div className="tag-line">for pixel lovers</div>
                        </div>
                    </div>
                    <div className="far">
                        <a className="about" href="/about" target="_blank">About</a>
                    </div>
                </div>
                <div className="body">
                    <div className="commands">
                        <Button
                            icon="book"
                            description="Start from a blank template"
                            text="New Icon File"
                            iconSize={20}
                            onClick={() => this.newBook()}
                        />

                        <Button
                            icon="image"
                            description="Select an image on your computer to convert to an icon"
                            text="Import an Image..."
                            iconSize={20}
                            onClick={() => this.importImage()}
                        />
                    </div>
                    <div className="tiles">

                    </div>
                </div>
            </div>
        );
    };
}