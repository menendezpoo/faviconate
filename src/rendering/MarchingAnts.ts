import {distance, Point, Rectangle} from "../hui/helpers/Rectangle";
import {Color} from "../hui/helpers/Color";

export class MarchingAnts{

    static line(cx: CanvasRenderingContext2D, a: Point, b: Point, color1 = Color.black, color2  = Color.white, step: number = 0){

        step = step % 8; // step can only go from 0 to 8

        const lineWidthBuffer = cx.lineWidth;
        cx.lineWidth = 1.5;

        const fives = new Array(Math.round(distance(a, b) / 5)).fill(5);

        switch(step){
            case 0: cx.setLineDash([1, ...fives]); break;
            case 1: cx.setLineDash([2, ...fives]); break;
            case 2: cx.setLineDash([3, ...fives]); break;
            case 3: cx.setLineDash([4, ...fives]); break;
            case 4: cx.setLineDash([5, 5]); break;
            case 5: cx.setLineDash([0, 1,...fives]); break;
            case 6: cx.setLineDash([0,2,...fives]); break;
            case 7: cx.setLineDash([0,3,...fives]); break;
            case 8: cx.setLineDash([0,4,...fives]); break;
        }

        cx.strokeStyle = color1.cssRgba;
        cx.beginPath();
        cx.moveTo(a.x, a.y);
        cx.lineTo(b.x, b.y);
        cx.stroke();

        switch(step){
            case 0: cx.setLineDash([0, 1, ...fives]); break;
            case 1: cx.setLineDash([0, 2, ...fives]); break;
            case 2: cx.setLineDash([0, 3, ...fives]); break;
            case 3: cx.setLineDash([0, 4, ...fives]); break;
            case 4: cx.setLineDash([0, 5, ...fives]); break;
            case 5: cx.setLineDash([1,...fives]); break;
            case 6: cx.setLineDash([2,...fives]); break;
            case 7: cx.setLineDash([3,...fives]); break;
            case 8: cx.setLineDash([4,...fives]); break;
        }

        cx.strokeStyle = color2.cssRgba;
        cx.beginPath();
        cx.moveTo(a.x, a.y);
        cx.lineTo(b.x, b.y);
        cx.stroke();

        cx.setLineDash([]);
        cx.lineWidth = lineWidthBuffer;
    }

    static rectangle(cx: CanvasRenderingContext2D, r: Rectangle, color1 = Color.black, color2  = Color.white, step: number = 0){
        const lines: [Point, Point][] = [
            [r.northWest, r.northEast],
            [r.northEast, r.southEast],
            [r.southEast, r.southWest],
            [r.southWest, r.northWest],
        ];

        for(const [a, b] of lines){
            this.line(cx, a, b, color1, color2, step);
        }

    }

}