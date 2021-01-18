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
    preventDefault?: boolean;
}

export interface CanvasSensor{
    pointingGestureMove?     (e: PointingEvent):    PointingEventResult | void;
    pointingGestureStart?    (e: PointingEvent):    PointingEventResult | void;
    pointingGestureEnd?      (e: PointingEvent):    PointingEventResult | void;
    keyDown?                 (e: KeyEvent):         KeyEventResult | void;
    keyUp?                   (e: KeyEvent):         KeyEventResult | void;
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

    private canvasSize: Size = makeSz(0,0);
    private _cursor: string | null = null;
    private resizer = () => this.updateCanvasSize();
    private mouseUpCatcher = (e: MouseEvent) => this.mouseUp(e);
    private keyDownCatcher = (e: KeyboardEvent) => this.keyDown(e);
    private keyUpCatcher = (e: KeyboardEvent) => this.keyUp(e);

    constructor(props: CanvasViewProps) {
        super(props);

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

        document.body.addEventListener('mouseup', this.mouseUpCatcher);

    }

    private mouseUp(e: MouseEvent){

        if(this.canvasRef.current && this.controller.pointingGestureEnd) {
            const point = this.canvasPoint(e.clientX, e.clientY);
            this.controller.pointingGestureEnd({point, touch: false});
        }

        document.body.removeEventListener(`mouseup`, this.mouseUpCatcher);
    }

    private mouseMove(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>){

        if (this.controller.pointingGestureMove){
            const point = this.canvasPoint(e.clientX, e.clientY);
            const result = this.controller.pointingGestureMove({point, touch: false});

            if (result && result.cursor){
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

    private keyDown(e: KeyboardEvent){
        if (this.controller.keyDown){
            const result = this.controller.keyDown({key: e.key});

            if (result && result.preventDefault === true){
                e.preventDefault();
            }
        }
    }

    private keyUp(e: KeyboardEvent){
        if (this.controller.keyUp){
            const result = this.controller.keyUp({key: e.key});

            if (result && result.preventDefault === true){
                e.preventDefault();
            }
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

        document.addEventListener('keyup', this.keyUpCatcher);
        document.addEventListener('keydown', this.keyDownCatcher);
    }

    componentWillUnmount(): void {
        this.unRegisterResizeHook();

        document.removeEventListener('keyup', this.keyUpCatcher);
        document.removeEventListener('keydown', this.keyDownCatcher);
    }

    componentDidUpdate(prevProps: Readonly<CanvasViewProps>, prevState: Readonly<{}>, snapshot?: any) {

    }

    render() {
        return (
            <div ref={this.containerRef} className={`canvas-view`}>
                <canvas
                    ref={this.canvasRef}
                    tabIndex={0}
                    onMouseDown={e => this.mouseDown(e)}
                    onMouseMove={e => this.mouseMove(e)}
                    onTouchStart={e => this.touchStart(e)}
                    onTouchMove={e => this.touchMove(e)}
                    onTouchEnd={e => this.touchEnd(e)}
                ></canvas>
            </div>
        );
    }

    get controller(): CanvasViewController{
        return this.props.controller;
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