
import * as React from "react";
import {makePt, makeSz, Point, Rectangle, Size} from "../helpers/Rectangle";
import {CSSProperties, RefObject} from "react";

export interface SliderProps{
    min: number | Size;
    max: number | Size;
    value?: number | Size;
    onChange?: (value: number | Size) => void;
    containerStyle?: CSSProperties;
    handleStyle?: CSSProperties;
    direction?: 'horizontal' | 'vertical' | '2d';
}

export interface SliderState{
    value: number | Size;
}

interface GestureData{
    clientX: number;
    clientY: number;
}

export class Range extends React.Component<SliderProps, SliderState>{

    private containerRef: RefObject<HTMLDivElement> = React.createRef();
    private handleRef: RefObject<HTMLDivElement> = React.createRef();
    private dragging = false;
    private handleOffset: Point = makePt(0, 0);

    private mouseMoveHandler = (e: MouseEvent) => this.mouseMove(e);
    private mouseUpHandler = (e: MouseEvent) => this.mouseUp(e);
    private touchMoveHandler = (e: TouchEvent) => this.touchMove(e);
    private touchEndHandler = (e: TouchEvent) => this.touchEnd(e);

    constructor(props: SliderProps) {
        super(props);

        this.state = {
            value: props.value || props.min,
        };
    }

    private valueFromRects(): number | Size{

        const {container, handle} = this.boundingRects();
        const max = this.props.max;
        const min = this.props.min;

        if(this.props.direction === '2d') {

            if(typeof max == "number" || typeof min == "number"){
                throw new Error(`min and max must be Size`)
            }

            const maxSpace = makeSz(container.width - handle.width, container.height - handle.height);
            const curSpace = makeSz(handle.left - container.left, handle.top - container.top);
            return makeSz(
                Math.round(curSpace.width * (max.width - min.width) / maxSpace.width + min.width),
                Math.round(curSpace.height * (max.height - min.height) / maxSpace.height + min.height)
            );

        }else{

            if(typeof max !== "number" || typeof min !== "number"){
                throw new Error(`min and max must be number`);
            }

            if (this.props.direction !== 'vertical'){
                const maxSpace = container.width - handle.width;
                const curSpace = handle.left - container.left;
                return Math.round(curSpace * (max - min) / maxSpace + min);

            }else{
                const maxSpace = container.height - handle.height;
                const curSpace = handle.top - container.top;
                return Math.round(curSpace * (max - min) / maxSpace + min);
            }
        }
    }

    private handleMouseDown(e: React.MouseEvent<HTMLDivElement, MouseEvent>){
        this.pointingGestureStart(e);
        e.preventDefault();

        window.addEventListener('mousemove', this.mouseMoveHandler);
        window.addEventListener('mouseup', this.mouseUpHandler);
    }

    private handleTouchStart(e: React.TouchEvent<HTMLDivElement>){

        if (e.touches.length > 0){
            this.pointingGestureStart(e.touches[0]);
        }
        e.preventDefault();
        window.addEventListener('touchmove', this.touchMoveHandler);
        window.addEventListener('touchend', this.touchEndHandler);

    }

    private mouseMove(e: MouseEvent){
        this.pointingGestureMove(e);
        e.preventDefault();
    }

    private mouseUp(e: MouseEvent){
        this.pointingGestureEnd(e);
        window.removeEventListener('mousemove', this.mouseMoveHandler);
        window.removeEventListener('mouseup', this.mouseUpHandler);
    }

    private touchMove(e: TouchEvent){
        if (e.touches.length > 0){
            this.pointingGestureMove(e.touches[0]);
            e.preventDefault();
        }
    }

    private boundingRects(): {container: Rectangle; handle: Rectangle}{

        if(!this.containerRef.current || !this.handleRef.current){
            throw new Error(`Refs not ready`);
        }

        return {
            container: Rectangle.fromDOMRect(this.containerRef.current.getBoundingClientRect()),
            handle: Rectangle.fromDOMRect(this.handleRef.current.getBoundingClientRect()),
        };

    }

    private touchEnd(e: TouchEvent){

        if (e.touches.length > 0){
            this.pointingGestureEnd(e.touches[0]);
            e.preventDefault();
        }

        window.removeEventListener('touchmove', this.touchMoveHandler);
        window.removeEventListener('touchend', this.touchEndHandler);
    }

    private pointingGestureStart(e: GestureData){
        this.dragging = true;

        // Save handle offset
        if (this.handleRef.current){
            const {handle} = this.boundingRects();
            this.handleOffset = makePt(e.clientX - handle.left, e.clientY - handle.top);
        }

    }

    private pointingGestureEnd(e: GestureData){
        this.dragging = false;
    }

    private pointingGestureMove(e: GestureData){

        if (this.dragging && this.refsReady){

            const {container, handle} = this.boundingRects();

            let x = e.clientX - container.left - this.handleOffset.x;
            x = Math.max(0, x);
            x = Math.min(container.width - handle.width, x);

            let y = e.clientY - container.top - this.handleOffset.y;
            y = Math.max(0, y);
            y = Math.min(container.height - handle.height, y);

            this.updateHandleOffset(x, y);
        }
    }

    private updateHandleOffset(handleOffsetX: number, handleOffsetY: number){

        if (this.handleRef.current){
            const {direction} = this.props;

            if(direction !== 'vertical') {
                this.handleRef.current.style.left = `${handleOffsetX}px`;
            }

            if(direction === 'vertical' || direction === '2d'){
                this.handleRef.current.style.top = `${handleOffsetY}px`;
            }

        }

        if (this.props.onChange){
            this.props.onChange(this.valueFromRects());
        }

    }

    private handleOffsetFromValue(value: number): number{

        if (this.props.direction !== '2d'){
            const {container, handle} = this.boundingRects();
            const max = this.props.max as number;
            const min = this.props.min as number;
            const avail = container.width - handle.width;
            const result = value * avail / (max-min);

            return result;
        }else{
            throw new Error('TODO');
        }
    }

    private get refsReady(): boolean {
        return !!this.containerRef.current && !!this.handleRef.current;
    }

    render() {

        const {containerStyle, handleStyle} = this.props;

        return (
            <div ref={this.containerRef}
                 className="ui-range"
                 tabIndex={0}
                 style={containerStyle}>
                <div
                    ref={this.handleRef}
                    className="handle"
                    style={handleStyle}
                    onMouseDown={e => this.handleMouseDown(e)}
                    onTouchStart={e => this.handleTouchStart(e)}
                />
            </div>
        );
    }

}