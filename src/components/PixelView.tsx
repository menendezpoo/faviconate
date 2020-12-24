import * as React from "react";
import {RefObject} from "react";

export class PixelView extends React.Component{

    canvasRef: RefObject<HTMLCanvasElement> = React.createRef()

    render() {
        return (
            <div className={`pixel-view`}>
                <canvas ref={this.canvasRef}></canvas>
            </div>
        );
    }
}