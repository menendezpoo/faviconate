import * as React from "react";
import {Color} from "../hui/helpers/Color";
import {Button} from "../hui/items/Button";
import {ColorPicker} from "../hui/items/ColorPicker";
import {Separator} from "../hui/items/Separator";
import {App} from "./App";
import {Label} from "../hui/items/Label";

/**
 * 1. Pick a color
 * 2. Adjust it
 * 3a. Confirm change
 * 3b. Cancel
 */

export interface ColorReplacerProps{
    onStart?: () => void;
    onCancel?: () => void;
    onOldColorPicked?: (color: Color) => void;
    onColorPreview?: (color: Color) => void;
    onColorSelected?: (color: Color) => void;
}

interface ColorReplacerState{
    colorToReplace?: Color;
    colorHovering?: Color;
    selectedColor?: Color;
}

export class ColorReplacer extends React.Component<ColorReplacerProps, ColorReplacerState>{

    private lastSelected: Color | null;
    private lastHover: Color | null;

    constructor(props: ColorReplacerProps) {
        super(props);

        this.state = {};
    }

    private cancelColorPicker(){
        App.activeController.colorPicker(undefined);
        this.setState({colorToReplace: undefined, colorHovering: undefined});

        if (this.props.onCancel){
            this.props.onCancel();
        }
    }

    private colorFromColorPicker(selectedColor: Color){

        this.setState({selectedColor});

        if (this.props.onColorPreview){
            if(!(this.lastSelected && selectedColor.equals(this.lastSelected))){
                this.props.onColorPreview(selectedColor);
            }
        }

        this.lastSelected = selectedColor;
    }

    private confirmChange(){

        if(!this.state.selectedColor){
            throw new Error(`No selected color`);
        }

        if (this.props.onColorSelected){
            this.props.onColorSelected(this.state.selectedColor);
        }

        this.setState({colorToReplace: undefined, colorHovering: undefined});
    }

    private startColorPicker(){

        App.activeController.colorPicker((colorToReplace, colorHovering) => {

            if (colorHovering){

                if (this.lastHover && !colorHovering.equals(this.lastHover)){
                    this.setState({colorHovering});
                }

                this.lastHover = colorHovering;

            }else if(colorToReplace){
                this.setState({colorToReplace, colorHovering: undefined});

                if (this.props.onOldColorPicked){
                    this.props.onOldColorPicked(colorToReplace);
                }

            }else{
                this.setState({colorToReplace: undefined, colorHovering: undefined});
            }

        });

        this.setState({colorHovering: Color.black});

        if (this.props.onStart){
            this.props.onStart();
        }
    }

    private useOf(colorHovering: Color): number{
        const data = App.activeController.editor.document.icon.data;
        let count = 0;

        for(let i = 0; i < data.length; i+=4){
            const color = Color.fromInt8Array(data, i);
            if (color.equals(colorHovering)){
                count++;
            }
        }

        return count;
    }

    render(){

        const {colorToReplace, colorHovering} = this.state;

        if (colorToReplace) {
            return (
                <div className="color-replacer">
                    <div className="swatch" style={{backgroundColor: colorToReplace.cssRgba}}/>
                    <Separator/>
                    <ColorPicker color={colorToReplace} colorPicked={c => this.colorFromColorPicker(c)}/>
                    <Button text={`Cancel`} onClick={() => this.cancelColorPicker()}/>
                    <Button text={`Confirm`} onClick={() => this.confirmChange()}/>
                </div>
            );
        }else if(colorHovering){
            return (
                <div className="color-replacer">
                    <div className="swatch" style={{backgroundColor: colorHovering.cssRgba}}/>
                    <Label text={`${colorHovering.toString().toUpperCase()}: ${this.useOf(colorHovering)}`}/>
                    <Separator/>
                    <Button text={`Cancel`} onClick={() => this.cancelColorPicker()}/>
                </div>
            );
        }else{
            return (
                <div className="color-replacer">
                    <Button
                        icon={`eyedropper`}
                        text={`Pick Color to Replace`}
                        onClick={() => this.startColorPicker()}/>
                </div>
            );
        }
    }

}