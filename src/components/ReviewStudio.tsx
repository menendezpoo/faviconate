import * as React from "react";
import {ToolbarView} from "../hui/layout/ToolbarView";
import {Label} from "../hui/items/Label";
import {Button} from "../hui/items/Button";
import {Range} from "../hui/items/Range";
import {DockView} from "../hui/layout/DockView";
import {ContainerPanel} from "./ContainerPanel";
import {Callable, cn} from "../hui/helpers/hui";
import {Icon} from "../model/Icon";
import {RefObject} from "react";
import {BasicCardinalPoint, makeSz, Rectangle, scaleToContain, Size} from "../hui/helpers/Rectangle";
import {IconReviewer, StartCorner} from "../model/IconReviewer";
import {GraphicsMemoryError} from "../hui/helpers/errors";
import {ColorUsageReport} from "./ColorUsageReport";
import {ReviewRenderer} from "../rendering/ReviewRenderer";
import {Expando} from "./Expando";

const MAX_PREVIEW = 200;
const DEF_SIZE = 3;
const DEF_CORNER = 'nw';

export interface ReviewStudioProps{
    icon: Icon;
    onCloseRequested?: Callable;
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

    private dismiss(){
        if (this.props.onCloseRequested){
            this.props.onCloseRequested();
        }
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
        const renderer = new ReviewRenderer(this.reviewer);
        this.drawPreviewCanvas(renderer);
        this.drawReviewCanvas(renderer);
    }

    private drawPreviewCanvas(renderer: ReviewRenderer){
        if (!this.previewCanvas.current){
            return;
        }

        const destCx = this.previewCanvas.current.getContext('2d');

        if (!destCx){
            throw new GraphicsMemoryError();
        }

        renderer.renderPreview(destCx, this.previewSize);

    }

    private drawReviewCanvas(renderer: ReviewRenderer){

        if (!this.reviewCanvas.current){
            return;
        }

        const context = this.reviewCanvas.current.getContext('2d');

        if (!context){
            throw new GraphicsMemoryError();
        }

        renderer.renderReview(context, this.reviewSize);

    }

    private navigate(p: BasicCardinalPoint){
        this.reviewer.move(p);
        this.updateCanvasesGraphics();
        this.forceUpdate();
    }

    componentDidMount() {
        this.updateCanvasesGraphics();

        window.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft'){
                this.navigate('w');
                e.stopPropagation();

            }else if(e.key == 'ArrowRight'){
                this.navigate('e');
                e.stopPropagation();

            }else if(e.key == 'ArrowUp'){
                this.navigate('n');
                e.stopPropagation();

            }else if(e.key == 'ArrowDown'){
                this.navigate('s');
                e.stopPropagation();

            }else if(e.key == 'Escape'){
                this.dismiss();
                e.stopPropagation();

            }
        }, true);
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
                <Button icon={`dismiss`} iconSize={20} onClick={() => this.dismiss()}/>
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
                <Expando title={`Navigate`}>
                    <div className="key-navigation">
                        <div className="row">
                            <div className={`nothing`}/>
                            <Button icon={`circle-arrow-up`} iconSize={50} onClick={() => this.navigate('n')}/>
                            <div className={`nothing`}/>
                        </div>
                        <div className="row">
                            <Button icon={`circle-arrow-left`} iconSize={50} onClick={() => this.navigate('w')}/>
                            <div className={`nothing`}/>
                            <Button icon={`circle-arrow-right`} iconSize={50} onClick={() => this.navigate('e')}/>
                        </div>
                        <div className="row">
                            <div className={`nothing`}/>
                            <Button icon={`circle-arrow-down`} iconSize={50} onClick={() => this.navigate('s')}/>
                            <div className={`nothing`}/>
                        </div>
                    </div>
                </Expando>
                <Expando title={`Colors`}>
                    <ColorUsageReport data={this.reviewer.sampleSprite}/>
                </Expando>

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
