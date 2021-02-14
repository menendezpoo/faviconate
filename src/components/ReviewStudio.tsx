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
import {makePt, makeSz, Rectangle, scaleToContain, Size} from "../hui/helpers/Rectangle";
import {IconReviewer, StartCorner} from "../model/IconReviewer";
import {IconService} from "../model/IconService";
import {MemoryError} from "../model/errors";
import {GraphicsMemoryError} from "../hui/helpers/errors";
import {MarchingAnts} from "../model/MarchingAnts";

const MAX_PREVIEW = 200;
const DEF_SIZE = 3;
const DEF_CORNER = 'nw';

export interface ReviewStudioProps{
    icon: Icon;
}

interface ReviewStudioState{
    sampleSize: number;
    startCorner: StartCorner;
    mode: 'setup' | 'review';
}

export class ReviewStudio extends React.Component<ReviewStudioProps, ReviewStudioState>{

    readonly previewCanvas: RefObject<HTMLCanvasElement> = React.createRef();
    readonly reviewCanvas: RefObject<HTMLCanvasElement> = React.createRef();
    readonly previewSize: Size;

    private reviewSize: Size;
    private reviewer: IconReviewer;

    constructor(props: ReviewStudioProps) {
        super(props);

        this.state = {
            sampleSize: DEF_SIZE,
            startCorner: DEF_CORNER,
            mode: 'setup',
        };

        this.previewSize = scaleToContain(makeSz(MAX_PREVIEW, MAX_PREVIEW), makeSz(props.icon.width, props.icon.height));
        this.reviewer = new IconReviewer(props.icon, makeSz(DEF_SIZE, DEF_SIZE), DEF_CORNER);
    }

    private setStartCorner(startCorner: StartCorner){
        this.setState({startCorner});

        const {icon} = this.props;
        const {sampleSize} = this.state;

        this.reviewer = new IconReviewer(icon, makeSz(sampleSize, sampleSize), startCorner);
        this.updateCanvasesGraphics();
    }

    private setSampleSize(sampleSize: number){
        this.setState({sampleSize});

        const {icon} = this.props;
        const {startCorner} = this.state;

        this.reviewer = new IconReviewer(icon, makeSz(sampleSize, sampleSize), startCorner);
        this.updateCanvasesGraphics();
    }

    private updateCanvasesGraphics(){
        this.drawPreviewCanvas();
        this.drawReviewCanvas();
    }

    private marchingAntsMarker(cx: CanvasRenderingContext2D, contentBounds: Rectangle, focusRegion: Rectangle){
        // N
        const na = makePt(contentBounds.left, focusRegion.top);
        const nb = makePt(contentBounds.right, focusRegion.top);

        // S
        const sa = makePt(contentBounds.left, focusRegion.bottom);
        const sb = makePt(contentBounds.right, focusRegion.bottom);

        // W
        const wa = makePt(focusRegion.left, contentBounds.top);
        const wb = makePt(focusRegion.left, contentBounds.bottom);

        // E
        const ea = makePt(focusRegion.right, contentBounds.top);
        const eb = makePt(focusRegion.right, contentBounds.bottom);


        MarchingAnts.line(cx, na, nb);
        MarchingAnts.line(cx, sa, sb);
        MarchingAnts.line(cx, wa, wb);
        MarchingAnts.line(cx, ea, eb);
    }

    private drawPreviewCanvas(){
        if (!this.previewCanvas.current){
            return;
        }

        const sourceCanvas = IconService.asCanvas(this.reviewer.current);

        const srcW = sourceCanvas.width;
        const srcH = sourceCanvas.height;
        const w = this.previewSize.width;
        const h = this.previewSize.height;

        const destCx = this.previewCanvas.current.getContext('2d');

        if (!destCx){
            throw new GraphicsMemoryError();
        }

        destCx.clearRect(0, 0, w, h);
        destCx.imageSmoothingEnabled = false;
        destCx.drawImage(sourceCanvas, 0,0, w, h);

        const sampleW = this.reviewer.sample.width;
        const sampleH = this.reviewer.sample.height;
        const contentBounds = new Rectangle(0, 0, w, h);
        const pixelSize = makeSz(w/srcW, h/srcH);
        const focusSize = makeSz(sampleW * pixelSize.width, sampleH * pixelSize.height);
        const focusLocation = makePt(pixelSize.width * this.reviewer.currentHotspot.left, pixelSize.height * this.reviewer.currentHotspot.top);
        const focusRegion = Rectangle.fromPoint(focusLocation).withSize(focusSize);

        this.marchingAntsMarker(destCx, contentBounds, focusRegion);

    }

    private drawReviewCanvas(){
        if (!this.reviewCanvas.current){
            return;
        }

        const reviewSource = this.reviewer.reviewImage();
        const reviewCx = this.reviewCanvas.current.getContext('2d');

        if (!reviewCx){
            throw new GraphicsMemoryError();
        }

        const graphicSize = makeSz(reviewSource.width, reviewSource.height);
        const contentBounds = Rectangle.fromSize(scaleToContain(this.reviewSize, graphicSize)).centerAt(Rectangle.fromSize(this.reviewSize).center);


        reviewCx.clearRect(0,0, this.reviewSize.width, this.reviewSize.height);
        reviewCx.imageSmoothingEnabled = false;
        reviewCx.drawImage(reviewSource, ...contentBounds.tuple);

        const pixelSize = makeSz(contentBounds.width / reviewSource.width, contentBounds.height / reviewSource.height);
        const sample = this.state.sampleSize;
        const focusRegion = new Rectangle(contentBounds.left + pixelSize.width * sample,
            contentBounds.top + pixelSize.height * sample, pixelSize.width * sample, pixelSize.height * sample);

        this.marchingAntsMarker(reviewCx, contentBounds, focusRegion);

    }

    componentDidMount() {
        this.updateCanvasesGraphics();

        window.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft'){
                this.reviewer.move('w');
                this.updateCanvasesGraphics();

            }else if(e.key == 'ArrowRight'){
                this.reviewer.move('e');
                this.updateCanvasesGraphics();

            }else if(e.key == 'ArrowUp'){
                this.reviewer.move('n');
                this.updateCanvasesGraphics();

            }else if(e.key == 'ArrowDown'){
                this.reviewer.move('s');
                this.updateCanvasesGraphics();

            }
        });
    }

    componentDidUpdate(prevProps: Readonly<ReviewStudioProps>, prevState: Readonly<ReviewStudioState>, snapshot?: any) {
        if (prevState.mode === 'setup' && this.state.mode === 'review' && this.reviewCanvas.current){
            const r = Rectangle.fromDOMRect(this.reviewCanvas.current.parentElement!.getBoundingClientRect());
            this.reviewSize = r.size;
            this.reviewCanvas.current.width = r.width;
            this.reviewCanvas.current.height = r.height;
            this.updateCanvasesGraphics();
        }
    }

    render() {

        const {mode} = this.state;

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
            <div className="review-studio-sidebar">
                <ContainerPanel classNames="preview">
                    <canvas
                        width={this.previewSize.width}
                        height={this.previewSize.height}
                        ref={this.previewCanvas}/>
                </ContainerPanel>
            </div>
        );

        const setupItems = (
            <>
                <div className={`row sample-size`}>
                    <div className="caption">Sample Size</div>
                    <Range
                        value={this.state.sampleSize} min={1} max={10}
                        round={true}
                        onChange={v => this.setSampleSize(v)}
                    />
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
                    <Button classNames={`cta`} text={`Start`} onClick={() => this.setState({mode: 'review'})}/>
                </div>
            </>
        );

        const reviewItems = (
            <>
                <canvas ref={this.reviewCanvas}/>
            </>
        );

        const mainContent = mode === 'setup' ? setupItems : reviewItems;

        return (
            <div className={`modal review-studio`}>
                <ToolbarView items={topItems} itemsFar={topItemsFar}>
                    <DockView side={`right`} sideView={sideItems}>
                        <ContainerPanel classNames={`main-panel`}>
                            {mainContent}
                        </ContainerPanel>
                    </DockView>
                </ToolbarView>
            </div>
        );
    }

}
