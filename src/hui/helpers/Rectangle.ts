
export interface Point {
    x: number;
    y: number;
}

export interface Rect{
    left: number,
    top: number,
    width: number,
    height: number,
}

export interface Size {
    width: number;
    height: number;
}

export type BasicCardinalPoint = 'n' | 'e' | 's' | 'w';
export type CardinalPoint = BasicCardinalPoint | 'ne' | 'se' | 'sw'| 'nw';

export function makePt(x: number, y: number): Point {
    return {x, y};
}

export function makeSz(width: number, height: number): Size{
    return {width, height};
}

export function roundPt(p: Point): Point{
    return makePt(Math.round(p.x), Math.round(p.y));
}

export function roundSz(size: Size): Size{
    return makeSz(Math.round(size.width), Math.round(size.height));
}

export function slope(a: Point, b: Point): number{
    return (b.y - a.y) / (b.x - a.x);
}

export function midPoint(a: Point, b: Point): Point {
    return {x: (a.x + b.x) / 2, y: (a.y + b.y) / 2};
}

export function distance(a: Point, b: Point): number{
    return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

export function scaleToContain(container: Size, scalable: Size): Size{

    const wOriented = makeSz(container.width, container.width * scalable.height / scalable.width);
    const hOriented = makeSz(container.height * scalable.width / scalable.height, container.height);

    if (wOriented.width <= container.width && wOriented.height <= container.height){
        return wOriented;
    }

    return hOriented;
}

export class Rectangle{

    static get empty(): Rectangle{
        return new Rectangle(0, 0, 0, 0);
    }

    static fromRect(r: Rect): Rectangle{
        return new Rectangle(r.left, r.top, r.width, r.height);
    }

    static fromDOMRect(r: DOMRect): Rectangle{
        return new Rectangle(r.left, r.top, r.width, r.height);
    }

    static fromLTRB(left: number, top: number, right: number, bottom: number): Rectangle{
        return new Rectangle(left, top, right - left, bottom - top);
    }

    static fromPoint(p: Point): Rectangle{
        return new Rectangle(p.x, p.y, 0, 0);
    }

    static fromSize(s: Size): Rectangle{
        return new Rectangle(0, 0, s.width, s.height);
    }

    static unionOf(...rects: Rectangle[]): Rectangle | null{

        if(rects.length == 0) {
            return null;
        }

        let current = rects[0];

        for(let i = 1; i < rects.length; i++){
            current = current.union(rects[i]);
        }

        return current;
    }

    constructor(readonly left: number, readonly top:number, readonly width: number, readonly height: number){}

    centerAt(point: Point): Rectangle{
        return this.withLocation(makePt(
            point.x - this.width / 2,
            point.y - this.height / 2
        ));
    }

    clone(): Rectangle{
        return new Rectangle(this.left, this.top, this.width, this.height);
    }

    contains(p: Point): boolean{
        return p.x >= this.left && p.x < this.right && p.y >= this.top && p.y < this.bottom;
    }

    deflate(horizontal: number, vertical: number): Rectangle{
        return Rectangle.fromLTRB(this.left + horizontal, this.top + vertical, this.right - horizontal, this.bottom - vertical);
    }

    equals(r: Rectangle): boolean{
        return r.left === this.left &&
            r.top === this.top &&
            r.width === this.width &&
            r.height === this.height;
    }

    getCardinalPoint(c: CardinalPoint): Point{
        switch (c) {
            case 'n': return this.north;
            case 'ne': return this.northEast;
            case 'e': return this.east;
            case 'se': return this.southEast;
            case 's': return this.south;
            case 'sw': return this.southWest;
            case 'w': return this.west;
            case 'nw': return this.northWest;
        }
    }

    inflate(horizontal: number, vertical: number): Rectangle{
        return Rectangle.fromLTRB(this.left - horizontal, this.top - vertical, this.right + horizontal, this.bottom + vertical);
    }

    intersects(rectangle: Rectangle): boolean{
        let thisX = this.left;
        let thisY = this.top;
        let thisW = this.width;
        let thisH = this.height;
        let rectX = rectangle.left;
        let rectY = rectangle.top;
        let rectW = rectangle.width;
        let rectH = rectangle.height;
        return (rectX < thisX + thisW) && (thisX < (rectX + rectW)) && (rectY < thisY + thisH) && (thisY < rectY + rectH);
    }

    offset(xOffset: number, yOffset: number): Rectangle{
        return this.withLocation(makePt(this.left + xOffset, this.top + yOffset));
    }

    round(): Rectangle{
        return new Rectangle(
            Math.round(this.left),
            Math.round(this.top),
            Math.round(this.width),
            Math.round(this.height),
        );
    }

    toString(){
        return `(Rect: ${this.left}, ${this.top}, ${this.width}, ${this.height})`;
    }

    union(r: Rectangle): Rectangle{
        const x = [this.left, this.right, r.left, r.right];
        const y = [this.top, this.bottom, r.top, r.bottom];
        return Rectangle.fromLTRB(
            Math.min(...x), Math.min(...y),
            Math.max(...x), Math.max(...y)
        );
    }

    withBottom(bottom: number){
        return new Rectangle(this.left, bottom - this.height, this.width, this.height);
    }

    withHeight(height: number){
        return new Rectangle(this.left, this.top, this.width, height);
    }

    withLeft(left: number){
        return new Rectangle(left, this.top, this.width, this.height);
    }

    withLocation(location: Point): Rectangle{
        return new Rectangle(location.x, location.y, this.width, this.height);
    }

    withRight(right: number){
        return new Rectangle(right - this.width, this.top, this.width, this.height);
    }

    withSize(size: Size): Rectangle{
        return new Rectangle(this.left, this.top, size.width, size.height);
    }

    withTop(top: number){
        return new Rectangle(this.left, top, this.width, this.height);
    }

    withWidth(width: number){
        return new Rectangle(this.left, this.top, width, this.height);
    }

    get center(): Point{
        return {
            x: this.left + this.width / 2,
            y: this.top + this.height / 2
        };
    }

    get isEmpty(): boolean{
        return this.width == 0 && this.height == 0 && this.left == 0 && this.top == 0;
    }

    get right(): number{
        return this.left + this.width;
    }

    get bottom(): number{
        return this.top + this.height;
    }

    get location(): Point{
        return makePt(this.left, this.top);
    }

    get tuple(): [number, number, number, number]{
        return [this.left, this.top, this.width, this.height];
    }

    get northEast(): Point{
        return {x: this.right, y: this.top};
    }

    get southEast(): Point{
        return {x: this.right, y: this.bottom};
    }

    get southWest(): Point{
        return {x: this.left, y: this.bottom};
    }

    get northWest(): Point{
        return {x: this.left, y: this.top};
    }

    get east(): Point{
        return makePt(this.right, this.center.y);
    }

    get eastSegment(): [Point, Point]{
        return [this.northEast, this.southEast];
    }

    get north(): Point{
        return makePt(this.center.x, this.top);
    }

    get northSegment(): [Point, Point]{
        return [this.northEast, this.northWest];
    }

    get south(): Point{
        return makePt(this.center.x, this.bottom);
    }

    get southSegment(): [Point, Point]{
        return [this.southEast, this.southWest];
    }

    get west(): Point{
        return makePt(this.left, this.center.y);
    }

    get westSegment(): [Point, Point]{
        return [this.southWest, this.northWest];
    }

    get size(): Size{
        return {width: this.width, height: this.height};
    }
}