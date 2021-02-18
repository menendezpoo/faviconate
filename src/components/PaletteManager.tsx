import * as React from "react";
import {Color} from "../hui/helpers/Color";
import {Button} from "../hui/items/Button";
import {Clickable} from "../hui/items/Clickable";
import {ColorPicker} from "../hui/items/ColorPicker";
import {Palette, PaletteService} from "../model/PaletteService";
import {App} from "./App";

export interface PaletteProps{
    palette?: Palette;
    paletteChanged?: (palette: Palette) => void;
}

interface PaletteState{
    addMode?: boolean;
    colorToAdd?: Color;
    palettes?: Palette[];
}

export class PaletteManager extends React.Component<PaletteProps, PaletteState>{

    static natives: Palette[] = [
        {
            name: 'Black & White',
            native: true,
            colors: [Color.black.tupleInt8, Color.white.tupleInt8],
        },
        {
            name: 'Grayscale 1',
            native: true,
            colors: [Color.black.tupleInt8, Color.fromHex('808080').tupleInt8, Color.white.tupleInt8],
        },
        {
            name: 'Orange Range',
            native: true,
            colors: [
                Color.black.tupleInt8,
                Color.fromHex('808080').tupleInt8,
                Color.fromHex('f00').tupleInt8,
                Color.fromHex('f80').tupleInt8,
                Color.fromHex('ff0').tupleInt8,
                Color.white.tupleInt8,
            ],
        },
    ];

    constructor(props: PaletteProps) {
        super(props);

        this.state = {};
    }

    private setPalette(p: Palette){
        if(this.props.paletteChanged) {
            this.props.paletteChanged(p);
        }
    }

    private palettePreview(p: Palette): React.ReactNode{
        return (
            <div key={p.id} className="palette-preview" onClick={() => this.setPalette(p)}>
                <div className="palette-label">{p.name}</div>
                <div className="swatches">
                    {p.colors.map(tuple => this.swatch(Color.fromTupleInt8(tuple)))}
                </div>
            </div>
        );
    }

    private swatch(color: Color): React.ReactNode{
        const style = {
            backgroundColor: color.hexRgb,
        };
        return <div className="swatch" style={style}/>;
    }

    private startAddMode(){
        this.setState({addMode: true});
    }

    private addColor(color: Color){
        const palette: Palette = this.props.palette!;

        if (palette.native){
            palette.native = false;
            palette.name = '(Unsaved Palette)';
            palette.unnamed = true;
        }

        palette.unsaved = true;

        this.setPalette({
            ...palette,
            colors: [...palette.colors, color.tupleInt8]
        });

        this.dismissAddColor();
    }

    private addSelectedColor(){

        if(!this.state.colorToAdd || !this.props.palette){
            throw new Error();
        }

        const color = this.state.colorToAdd;

        this.addColor(color);
    }

    private dismissAddColor(){
        this.setState({addMode: false});
    }

    private refreshPalette(){
        PaletteService.getAll().then(palettes => {

            if (JSON.stringify(palettes) != JSON.stringify(this.state.palettes)){
                this.setState({palettes});
            }
        });
    }

    private startEyedropper(){
        App.activeController.colorPicker(colorToAdd => {

            if(colorToAdd){
                console.log(`Got Color ${colorToAdd.cssRgba}`);
                this.setState({colorToAdd});
            }

        });
    }

    componentDidMount() {
        this.refreshPalette();
    }

    componentDidUpdate(prevProps: Readonly<PaletteProps>, prevState: Readonly<PaletteState>, snapshot?: any) {
        this.refreshPalette();
    }

    render() {
        const pal = this.props.palette;

        if(this.state.addMode){
            return (
                <div className={`ui-palette`}>
                    <ColorPicker color={this.state.colorToAdd} colorPicked={colorToAdd => this.setState({colorToAdd})}/>
                    <Button icon={'eyedropper'} onClick={() => this.startEyedropper()}/>
                    <Button text={'Cancel'} onClick={() => this.dismissAddColor()}/>
                    <Button text={'Add Color'} onClick={() => this.addSelectedColor()}/>
                </div>
            );

        }else if(pal) {
            return (
                <div className="ui-palette">
                    <div className="palette-label">{pal.name}</div>
                    <div className="swatches">
                        {pal.colors.map(tuple => <Clickable classNames="pal-swatch">{this.swatch(Color.fromTupleInt8(tuple))}</Clickable>)}
                        <Button icon={`plus`} iconSize={20} onClick={() => this.startAddMode()}/>
                    </div>
                </div>
            );
        }else{

            const palettes: Palette[] = this.state.palettes || [];

            return (
                <div className="ui-palette">
                    {palettes.concat(PaletteManager.natives).map(p => this.palettePreview(p))}
                </div>
            );
        }
    }

}