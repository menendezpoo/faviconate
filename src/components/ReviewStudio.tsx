import * as React from "react";
import {ToolbarView} from "../hui/layout/ToolbarView";
import {Label} from "../hui/items/Label";
import {Button} from "../hui/items/Button";
import {Range} from "../hui/items/Range";
import {DockView} from "../hui/layout/DockView";
import {ContainerPanel} from "./ContainerPanel";
import {cn} from "../hui/helpers/hui";
import {Icon} from "../model/Icon";
import {RefObject} from "react";
import {makeSz, scaleToContain, Size} from "../hui/helpers/Rectangle";
import {IconReviewer} from "../model/IconReviewer";
import {IconService} from "../model/IconService";
import {MemoryError} from "../model/errors";

type Corner = 'ne' | 'nw' | 'se' | 'sw';

const MAX_PREVIEW = 200;

export interface ReviewStudioProps{
    icon: Icon;
}

interface ReviewStudioState{
    sampleSize: number;
    startCorner: Corner;
}

export class ReviewStudio extends React.Component<ReviewStudioProps, ReviewStudioState>{

    readonly previewCanvas: RefObject<HTMLCanvasElement> = React.createRef();
    readonly previewSize: Size;
    reviewer: IconReviewer;

    constructor(props: ReviewStudioProps) {
        super(props);

        this.state = {
            sampleSize: 3,
            startCorner: 'nw',
        };

        this.previewSize = scaleToContain(makeSz(MAX_PREVIEW, MAX_PREVIEW), makeSz(props.icon.width, props.icon.height));
        this.reviewer = new IconReviewer(props.icon);
    }

    private setStartCorner(startCorner: Corner){
        this.setState({startCorner});
    }

    private updateIcon(){
        if (this.previewCanvas.current){

            const sourceCanvas = IconService.asCanvas(this.reviewer.current);

            const w = this.previewSize.width;
            const h = this.previewSize.height;

            const destCx = this.previewCanvas.current.getContext('2d');

            if (destCx){
                destCx.imageSmoothingEnabled = false;
                destCx.drawImage(sourceCanvas, 0,0, w, h);
            }else{
                throw new MemoryError();
            }
        }
    }

    componentDidMount() {
        this.updateIcon();
    }

    render() {

        const topItems = (
            <>
                <Label text={`Review`}/>
            </>
        );

        const topItemsFar = (
            <>
                <Button icon={`dismiss`} iconSize={20}/>
            </>
        );

        const sideItems = (
            <>
                <ContainerPanel>
                    <canvas
                        width={this.previewSize.width}
                        height={this.previewSize.height}
                        ref={this.previewCanvas}/>
                </ContainerPanel>
            </>
        );

        return (
            <div className={`modal review-studio`}>
                <ToolbarView items={topItems} itemsFar={topItemsFar}>
                    <DockView side={`right`} sideView={sideItems}>
                        <ContainerPanel classNames={`main-panel`}>
                            <div className={`row sample-size`}>
                                <div className="caption">Sample Size</div>
                                <Range min={1} max={10} round={true} value={this.state.sampleSize} onChange={sampleSize => this.setState({sampleSize})}/>
                                <div className="value">{this.state.sampleSize} X {this.state.sampleSize}</div>
                            </div>
                            <div className="row corner">
                                <div className="caption">Corner to Start</div>
                                <div className="corner-grid">
                                    <div className="row">
                                        <div
                                            className={cn("corner nw", {selected: this.state.startCorner === 'nw'})}
                                            onClick={() => this.setStartCorner('nw')}
                                        />
                                        <div className={cn("corner ne", {selected: this.state.startCorner === 'ne'})}
                                             onClick={() => this.setStartCorner('ne')}
                                        />
                                    </div>
                                    <div className="row">
                                        <div
                                            className={cn("corner sw", {selected: this.state.startCorner === 'sw'})}
                                            onClick={() => this.setStartCorner('sw')}
                                        />
                                        <div
                                            className={cn("corner se", {selected: this.state.startCorner === 'se'})}
                                            onClick={() => this.setStartCorner('se')}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row cta">
                                <Button classNames={`cta`} text={`Start`}/>
                            </div>
                        </ContainerPanel>
                    </DockView>
                </ToolbarView>
            </div>
        );
    }

}
