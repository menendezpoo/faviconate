import * as React from "react";
import {RefObject} from "react";

export interface PreviewPanelProps{
    canvas: HTMLCanvasElement | null;
}

export class PreviewPanel extends React.Component<PreviewPanelProps>{

    ref: RefObject<HTMLDivElement> = React.createRef();

    private updateCanvas(){
        if (this.ref.current && this.props.canvas){
            this.ref.current.innerHTML = '';
            this.ref.current.appendChild(this.props.canvas);
        }
    }

    render() {

        this.updateCanvas();

        return (
            <div ref={this.ref} className={`preview-panel`}>
            </div>
        );
    }

}