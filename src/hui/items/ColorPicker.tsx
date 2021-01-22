import * as React from "react";
import {Color} from "../helpers/Color";
import {Ref, RefObject} from "react";

export interface ColorPickerProps{
    colorPicked: (color: Color) => any;
}

export interface ColorPickerState{
    currentColor: Color;
}

type ColorPickerFocus = 'hex' | 'r' | 'g' | 'b' | 'a';
const ColorPickerFields: ColorPickerFocus[] = ['hex', 'r', 'g', 'b', 'a'];

export class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState>{

    private focus: ColorPickerFocus | null = null;
    private txtHex: RefObject<HTMLInputElement> = React.createRef();
    private txtR: RefObject<HTMLInputElement> = React.createRef();
    private txtG: RefObject<HTMLInputElement> = React.createRef();
    private txtB: RefObject<HTMLInputElement> = React.createRef();
    private txtA: RefObject<HTMLInputElement> = React.createRef();

    constructor(props: ColorPickerProps) {
        super(props);

        this.state = {
            currentColor: Color.transparent
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

    private updateColor(color: Color){
        this.setState({currentColor: color});

        if (this.props.colorPicked){
            this.props.colorPicked(color);
        }
    }

    private handleChange(where: ColorPickerFocus){

        const txt = this.getInput(where);

        if (where == 'hex'){

            const value = txt.value;

            if (Color.hexParsable(value)){

                const color = Color.fromHex(value);

                this.updateColor(color);

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

        return (
            <div className="ui-color-picker">
                <div className="layer-swatch"><div className="swatch" style={{background: this.state.currentColor.hexRgb}}/></div>
                <div className="layer-2d-select">
                    <div className="2d-select">
                        <div className="hotspot"/>
                    </div>
                </div>
                <div className="layer-1d-select"/>
                <div className="layer-alpha-select"/>
                <div className="layer-inputs">
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