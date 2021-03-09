import * as React from "react";
import {RefObject} from "react";
import {Callable} from "../hui/helpers/hui";
import {Button} from "../hui/items/Button";
import {Size} from "../hui/helpers/Rectangle";
import {MenuItem} from "../hui/items/MenuItem";

export interface PreviewPanelProps{
    data: string;
    onActivate?: Callable;
    onDelete?: Callable;
    selected?: boolean;
    size: Size;
}

export class PreviewPanel extends React.Component<PreviewPanelProps>{

    ref: RefObject<HTMLDivElement> = React.createRef();

    private onActivate(){
        if (this.props.onActivate){
            this.props.onActivate();
        }
    }

    private onDelete(){
        if (this.props.onDelete){
            this.props.onDelete();
        }
    }

    render() {

        const size = this.props.size;
        const length = Math.max(size.width, size.height);
        const level = Math.ceil(length/64);

        return (
            <div
                ref={this.ref}
                onClick={() => this.onActivate()}
                className={`preview-panel ${this.props.selected ? 'selected' : ''} level-${level}`}>
                <div className="preview"><img src={this.props.data} alt=""/></div>
                <div className="label size-label">{size.width} x {size.height}</div>
                <Button classNames={`ellipsis`} icon={`ellipsis`} iconSize={50}>
                    <MenuItem text={'Delete'} onActivate={() => this.onDelete()}/>
                </Button>
            </div>
        );
    }

}