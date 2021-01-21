import * as React from "react";
import {RefObject} from "react";
import {Callable} from "../hui/helpers/hui";

export interface PreviewPanelProps{
    data: string;
    onActivate?: Callable;
    selected?: boolean;
}

export class PreviewPanel extends React.Component<PreviewPanelProps>{

    ref: RefObject<HTMLDivElement> = React.createRef();

    private onActivate(){
        if (this.props.onActivate){
            this.props.onActivate();
        }
    }

    render() {
        return (
            <div
                ref={this.ref}
                onClick={() => this.onActivate()}
                className={`preview-panel ${this.props.selected ? 'selected' : ''}`}>
                <img src={this.props.data} alt=""/>
            </div>
        );
    }

}