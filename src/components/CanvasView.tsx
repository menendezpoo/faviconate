import * as React from "react";
import {RefObject} from "react";
import {makePt, makeSz, Point, Rectangle, Size} from "../hui/helpers/Rectangle";

export interface PointingEvent {
    point: Point;
    touch: boolean;
}

export interface PointingEventResult{
    cursor?: string;
}

export interface KeyEvent{
    key: string;
}

export interface KeyEventResult{

}

export interface CanvasSensor{
    pointingGestureMove?     (e: PointingEvent):    PointingEventResult;
    pointingGestureStart?    (e: PointingEvent):    PointingEventResult;
    pointingGestureEnd?      (e: PointingEvent):    PointingEventResult;
    keyDown?                 (e: KeyEvent):         KeyEventResult;
    keyUp?                   (e: KeyEvent):         KeyEventResult;
}

export interface CanvasViewController extends CanvasSensor{
    render                   (context: CanvasRenderingContext2D, size: Size): void;
}

export interface CanvasViewProps{
    controller: CanvasViewController;
}

export class CanvasView extends React.Component<CanvasViewProps>{

    readonly containerRef: RefObject<HTMLDivElement> = React.createRef();
    readonly canvasRef: RefObject<HTMLCanvasElement> = React.createRef();
    readonly controller: CanvasViewController;

    private draw = true;
    private canvasSize: Size = makeSz(0,0);
    private _cursor: string | null = null;
    private resizer = () => this.updateCanvasSize();

    constructor(props: CanvasViewProps) {
        super(props);

        this.controller = props.controller;
    }

    private canvasPoint(clientX: number, clientY: number): Point{
        if(this.canvasRef.current) {
            const bounds = Rectangle.fromDOMRect(this.canvasRef.current.getBoundingClientRect());
            return makePt(clientX - bounds.left, clientY - bounds.top);
        }
        return makePt(clientX, clientY);
    }

    private registerResizeHook(){
        window.addEventListener('resize', this.resizer);
    }

    private unRegisterResizeHook(){
        window.removeEventListener('resize', this.resizer);
    }

    private updateCanvasSize(){
        if(this.containerRef.current) {

            const rect = Rectangle.fromDOMRect(this.containerRef.current.getBoundingClientRect());

            if(this.canvasRef.current) {
                this.canvasSize = makeSz(rect.width, rect.height);
                this.canvasRef.current.width = rect.width;
                this.canvasRef.current.height = rect.height;

            }else{
                console.log(`Diagram::resize: No canvasRef`);
            }

        }else{
            console.log(`Diagram::resize: No containerRef`);
        }

    }

    private mouseDown(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>){

        if (this.controller.pointingGestureStart){
            const point = this.canvasPoint(e.clientX, e.clientY);
            this.controller.pointingGestureStart({point, touch: false});
        }

    }

    private mouseUp(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>){

        if(this.canvasRef.current && this.controller.pointingGestureEnd) {
            const point = this.canvasPoint(e.clientX, e.clientY);
            this.controller.pointingGestureEnd({point, touch: false});
        }
    }

    private mouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>){

        if (this.controller.pointingGestureMove){
            const point = this.canvasPoint(e.clientX, e.clientY);
            const result = this.controller.pointingGestureMove({point, touch: false});

            if (result.cursor){
                this.cursor = result.cursor;
            }
        }
    }

    private touchEnd(e: React.TouchEvent<HTMLCanvasElement>){
        if (this.controller.pointingGestureEnd){
            if(e.touches.length > 0) {
                const t = e.touches[0];
                this.controller.pointingGestureEnd({
                    point: this.canvasPoint(t.clientX, t.clientY),
                    touch: true,
                });
            }else{
                this.controller.pointingGestureEnd({point: makePt(0,0), touch: true})
            }
        }
    }

    private touchMove(e: React.TouchEvent<HTMLCanvasElement>){
        if(this.controller.pointingGestureMove && e.touches.length > 0) {
            const t = e.touches[0];
            this.controller.pointingGestureMove({
                point: this.canvasPoint(t.clientX, t.clientY),
                touch: true
            });
        }
    }

    private touchStart(e: React.TouchEvent<HTMLCanvasElement>){
        if(this.controller.pointingGestureStart && e.touches.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            const t = e.touches[0];
            const point = this.canvasPoint(t.clientX, t.clientY);
            this.controller.pointingGestureStart({point, touch: true});
        }

    }

    private keyDown(e: React.KeyboardEvent){
        if (this.controller.keyDown){
            this.controller.keyDown({key: e.key});
        }
    }

    private keyUp(e: React.KeyboardEvent){
        if (this.controller.keyUp){
            this.controller.keyUp({key: e.key});
        }
    }

    componentDidMount() {
        this.resizer();

        if (this.canvasRef.current){
            const context = this.canvasRef.current.getContext("2d");

            if (context){

                const draw = () => {
                    this.controller.render(context, this.canvasSize);
                    requestAnimationFrame(draw);
                };

                console.log(`Start draw...`, this.canvasSize);

                requestAnimationFrame(() => draw());

            }else{
                console.log(`No context`);
            }
        }else{
            console.log(`No canvasRef`);
        }
    }

    componentWillMount(): void {
        this.registerResizeHook();
    }

    componentWillUnmount(): void {
        this.unRegisterResizeHook();
    }

    render() {
        return (
            <div ref={this.containerRef} className={`canvas-view`}>
                <canvas
                    ref={this.canvasRef}
                    onMouseDown={e => this.mouseDown(e)}
                    onMouseMove={e => this.mouseMove(e)}
                    onMouseUp={e => this.mouseUp(e)}
                    onTouchStart={e => this.touchStart(e)}
                    onTouchMove={e => this.touchMove(e)}
                    onTouchEnd={e => this.touchEnd(e)}
                    onKeyDown={e => this.keyDown(e)}
                    onKeyUp={e => this.keyUp(e)}
                ></canvas>
            </div>
        );
    }

    get cursor(): string | null{
        return this._cursor;
    }

    set cursor(value: string | null){

        const changed = value !== this._cursor;

        if(changed){

            if(this.canvasRef.current) {
                this.canvasRef.current.style.cursor = value || '';
            }

            this._cursor = value;
        }
    }
}