import * as React from "react";
import {Color} from "../hui/helpers/Color";
import {Button} from "../hui/items/Button";

export interface PaletteProps{
    palette?: Color[];
    paletteChanged?: (palette: Color[]) => void;
}

interface PaletteState{

}

export class Palette extends React.Component<PaletteProps, PaletteState>{

    static gallery = [
        [Color.black, Color.white],
        [Color.black, Color.fromHex('808080'), Color.white],
        [Color.black, Color.fromHex('808080'), Color.white, Color.fromHex('f00')],
        [Color.black, Color.fromHex('808080'), Color.white, Color.fromHex('f00'), Color.fromHex('f80'), Color.fromHex('ff0')],
    ];

    private setPalette(p: Color[]){
        if(this.props.paletteChanged) {
            this.props.paletteChanged(p);
        }
    }

    private palettePreview(p: Color[]): React.ReactNode{
        return (
            <div className="palette-preview" onClick={() => this.setPalette(p)}>
                {p.map(color => this.swatch(color))}
            </div>
        );
    }

    private swatch(color: Color): React.ReactNode{
        const style = {
            backgroundColor: color.hexRgb,
        };
        return <div className="swatch" style={style}/>;
    }

    render() {
        const pal = this.props.palette;

        if(pal && pal.length) {
            return (
                <div className="ui-palette">
                    {pal.map(color => <div className="pal-swatch">{this.swatch(color)}</div>)}
                </div>
            );
        }else{
            return (
                <div className="ui-palette">
                    {Palette.gallery.map(p => this.palettePreview(p))}
                </div>
            );
        }
    }

}