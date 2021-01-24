import * as React from "react";
import {Color} from "../helpers/Color";
import {RefObject} from "react";
import {GraphicsMemoryError} from "../helpers/errors";
import {Range} from "./Range";
import {makePt, makeSz, Size} from "../helpers/Rectangle";

export interface ColorPickerProps{
    colorPicked: (color: Color) => any;
}

export interface ColorPickerState{
    currentColor: Color;
    selectedHue: number;
}

type ColorPickerFocus = 'hex' | 'r' | 'g' | 'b' | 'a';
const ColorPickerFields: ColorPickerFocus[] = ['hex', 'r', 'g', 'b', 'a'];

function dataUrlFrom(data: Uint8ClampedArray, width: number): string{
    const imageData = new ImageData(data, width);
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = width;
    canvas.height = data.length / 4 / width;

    const cx = canvas.getContext('2d');

    if(!cx){
        throw new GraphicsMemoryError();
    }

    cx.putImageData(imageData, 0,0);

    return canvas.toDataURL();
}

function createHuePattern(): string{
    const convert = (foo: number, hue: number) => Color.fromHsv(hue, 1, 1).tupleInt8;
    const array360 = new Array(360).fill(0);
    const arrayColors = array360.map(convert);
    const flatArrayColors: number[] = [].concat(...arrayColors as any);
    const data = new Uint8ClampedArray(flatArrayColors);
    return dataUrlFrom(data, 360);
}

function createSaturationPattern(hue = 1, length = 10): string{

    const arr = new Uint8ClampedArray(length * length * 4);
    let z = 0

    for(let j = length; j >= 0; j--){
        for(let i = 0; i < length; i++){
            const hsv = Color.fromHsv(hue, i/length, j/length);
            let [r, g, b, a] = hsv.tupleInt8;
            arr[z++] = r;
            arr[z++] = g;
            arr[z++] = b;
            arr[z++] = a;
        }
    }

    return dataUrlFrom(arr, length);
}

export class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState>{

    static hueBar = createHuePattern();

    private focus: ColorPickerFocus | null = null;
    private txtHex: RefObject<HTMLInputElement> = React.createRef();
    private txtR: RefObject<HTMLInputElement> = React.createRef();
    private txtG: RefObject<HTMLInputElement> = React.createRef();
    private txtB: RefObject<HTMLInputElement> = React.createRef();
    private txtA: RefObject<HTMLInputElement> = React.createRef();

    constructor(props: ColorPickerProps) {
        super(props);

        this.state = {
            currentColor: Color.transparent,
            selectedHue: -1,
        }

    }

    private getInput(type: ColorPickerFocus): HTMLInputElement{

        let ref: RefObject<HTMLInputElement>;

        switch (type){
            case "a": ref = this.txtA; break;
            case "r": ref = this.txtR; break;
            case "g": ref = this.txtG; break;
            case "b": ref = this.txtB; break;
            case "hex": ref = this.txtHex; break;
        }

        if (ref.current){
            return ref.current;
        }

        throw new Error(`No input element for: ${type}`);
    }

    private getInputValueFor(type: ColorPickerFocus): string{

        const color = this.state.currentColor;

        switch (type){
            case "a": return color.a.toString();
            case "r": return color.r.toString();
            case "g": return color.g.toString();
            case "b": return color.b.toString();
            case "hex": return color.a !== 1 ? color.hexRgba : color.hexRgb;
        }

    }

    private updateColor(color: Color, selectedHue?: number){

        this.setState({currentColor: color, selectedHue: typeof selectedHue === "number" ? selectedHue : -1});

        if (this.props.colorPicked){
            this.props.colorPicked(color);
        }
    }

    private updateHue(hue: number){
        const color = this.state.currentColor;
        const hsv = color.hsv;
        this.updateColor(Color.fromHsv(hue, hsv[1], hsv[2]), hue);
    }

    private updateAlpha(alpha: number){

    }

    private updateSat(dim: Size){
        const hue = this.state.selectedHue;
        const sat = dim.width / 100;
        const light = 1 - dim.height / 100;
        this.updateColor(Color.fromHsv(hue >= 0 ? hue : 0, sat, light), hue);
    }

    private handleChange(where: ColorPickerFocus){
        const txt = this.getInput(where);
        if (where == 'hex'){
            const value = txt.value;
            if (Color.hexParsable(value)){
                this.updateColor(Color.fromHex(value));
            }
        }else{
            const a = parseInt(this.getInput("a").value) || 0;
            const b = parseInt(this.getInput("b").value) || 0;
            const g = parseInt(this.getInput("g").value) || 0;
            const r = parseInt(this.getInput("r").value) || 0;
            const color = new Color(r, g, b, a);
            this.updateColor(color);
        }
    }

    componentDidMount() {
        ColorPickerFields.forEach(type => {
            const txt = this.getInput(type);

            txt.addEventListener('input', () => this.handleChange(type));
            txt.addEventListener('focus', () => {
                this.focus = type;
            });
            txt.addEventListener('blur', () => {
                this.focus = null;
            });
        });
    }

    syncInputValues(){
        for(const type of ColorPickerFields){
            if (this.focus !== type){
                this.getInput(type).value = this.getInputValueFor(type);
            }
        }
    }

    render() {

        if (this.txtHex.current){
            this.syncInputValues(); // Dont update if not rendered yet
        }

        const color = this.state.currentColor;
        const hsv = color.hsv;
        const hue = this.state.selectedHue >= 0 ? this.state.selectedHue : hsv[0];
        const alpha = color.a * 100;

        const satImg = createSaturationPattern(hue, 10);
        const hueHandleStyle = {background: Color.fromHsv(hue, 1, 1).hexRgb}
        const hueContainerStyle = {backgroundImage: `url(${ColorPicker.hueBar})`};
        const satContainerStyle = {backgroundImage: `url(${satImg})`}

        return (
            <div className="ui-color-picker">
                <div className="layer swatch"><div className="swatch" style={{background: color.cssRgba}}/></div>
                <div className="layer slider-2d">
                    <Range
                        min={makeSz(0,0)}
                        max={makeSz(100, 100)}
                        value={makeSz(0,0)}
                        direction={'2d'}
                        containerStyle={satContainerStyle}
                        onChange={sat => this.updateSat(sat as Size)}
                    />
                </div>
                <div className="layer slider-1d">
                    <Range
                        min={0}
                        max={359}
                        value={hue}
                        handleStyle={hueHandleStyle}
                        containerStyle={hueContainerStyle}
                        onChange={hue => this.updateHue(hue as number)}
                    />
                </div>
                <div className="layer slider-alpha">
                    <Range
                        min={0}
                        max={100}
                        value={alpha}
                        onChange={a => this.updateAlpha(a as number)}
                    />
                </div>
                <div className="layer inputs">
                    <div className="item">
                        <input type="text" ref={this.txtHex}/>
                        <div className="label">Hex</div>
                    </div>
                    <div className="item">
                        <input type="text" ref={this.txtR}/>
                        <div className="label">R</div>
                    </div>
                    <div className="item">
                        <input type="text" ref={this.txtG}/>
                        <div className="label">G</div>
                    </div>
                    <div className="item">
                        <input type="text" ref={this.txtB}/>
                        <div className="label">B</div>
                    </div>
                    <div className="item">
                        <input type="text" ref={this.txtA}/>
                        <div className="label">A</div>
                    </div>
                </div>
            </div>
        );
    }

}