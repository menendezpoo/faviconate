import * as React from "react";
import {Color} from "../helpers/Color";
import {TextBox} from "./TextBox";

export interface ColorPickerProps{
    colorPicked: (color: Color) => any;
}

export interface ColorPickerState{
    currentColor: Color;
}

export class ColorPicker extends React.Component<ColorPickerProps, ColorPickerState>{

    constructor(props: ColorPickerProps) {
        super(props);

        this.state = {
            currentColor: Color.transparent
        }

    }

    private handleChange(value: string){
        if (Color.hexParsable(value)){

            const color = Color.fromHex(value);

            this.setState({currentColor: color});

            if (this.props.colorPicked){
                this.props.colorPicked(color);
            }

        }
    }

    render() {
        return (
            <div>
                <TextBox change={value => this.handleChange(value)}/>
                <div className={`swatch`} style={{background: this.state.currentColor.hexRgb}}/>
            </div>
        );
    }

}