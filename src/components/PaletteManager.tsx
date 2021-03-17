import * as React from "react";
import {Color} from "../hui/helpers/Color";
import {Button} from "../hui/items/Button";
import {Clickable} from "../hui/items/Clickable";
import {ColorPicker} from "../hui/items/ColorPicker";
import {Palette, PaletteColor, PaletteService} from "../model/PaletteService";
import {App} from "./App";
import {ClipboardService} from "../model/ClipboardService";
import {Separator} from "../hui/items/Separator";

export interface PaletteProps{
    palette?: Palette;
    paletteChanged?: (palette: Palette) => void;
}

interface PaletteState{
    addMode?: boolean;
    colorToAdd?: Color;
    colorToAddName?: string;
    palettes?: Palette[];
    paletteCode?: string;
    codeMode?: boolean;
}

export class PaletteManager extends React.Component<PaletteProps, PaletteState>{

    static natives: Palette[] = [
        {
            name: 'Black & White',
            native: true,
            colors: [{name: "Black", hex: Color.black.toString()}, {name: "White", hex: Color.white.toString()}],
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
                    {p.colors.map(palColor => this.swatch(palColor))}
                </div>
            </div>
        );
    }

    private swatch(palColor: PaletteColor): React.ReactNode{

        const {name, hex} = palColor;
        const color = Color.fromHex(hex);

        const style = {
            backgroundColor: color.hexRgb,
        };
        return <div className="swatch" title={name} style={style}/>;
    }

    private startAddMode(){
        this.setState({addMode: true});
    }

    private addColor(color: Color, name: string){
        const palette: Palette = this.props.palette!;

        if (palette.native){
            palette.native = false;
            palette.name = '(Unsaved Palette)';
            palette.unnamed = true;
        }

        palette.unsaved = true;

        const hex = color.toString();

        this.setPalette({
            ...palette,
            colors: [...palette.colors,  {name, hex}]
        });

        this.dismissAddColor();
    }

    private addSelectedColor(){

        if(!this.state.colorToAdd || !this.props.palette){
            throw new Error();
        }

        const color = this.state.colorToAdd;
        const name = this.state.colorToAddName || color.toString();

        this.addColor(color, name);
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

    private copyCode(pal: Palette){
        ClipboardService.systemCopyText(JSON.stringify(pal)).then(() => alert('Copied'));
    }

    private startCodeMode(pal: Palette){
        this.setState({codeMode: true, paletteCode: JSON.stringify(pal)});
    }

    private endCodeMode(save = false){

        if (save){
            try{
                const p: Palette = JSON.parse(this.state.paletteCode || '');
                p.unsaved = true;
                this.setPalette(p);
            }catch(e){
                alert(`Can't format palette`);
                return;
            }
        }

        this.setState({codeMode: false});
    }

    private startEyedropper(){
        App.activeController.colorPicker(colorToAdd => {

            if(colorToAdd){

                const colorToAddName = prompt(`Pick a name for the color`, String(colorToAdd)) || String(colorToAdd);

                this.setState({colorToAdd, colorToAddName});
            }

        });
    }

    private startEyedropperAdd(){
        App.activeController.colorPicker(colorToAdd => {

            if(colorToAdd){

                const colorToAddName = prompt(`Pick a name for the color`, String(colorToAdd)) || String(colorToAdd);

                this.setState({colorToAdd, colorToAddName});

                setTimeout(() => this.addSelectedColor());
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
        const {codeMode} = this.state;

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

            let paletteContent = <></>;

            if (codeMode === true){

                paletteContent = (
                    <div>
                        <textarea onChange={e => this.setState({paletteCode: e.target.value})}>{JSON.stringify(pal, null, 2)}</textarea>
                        <Separator/>
                        <Button text={`Cancel`} onClick={() => this.endCodeMode()}/>
                        <Button text={`OK`} onClick={() => this.endCodeMode(true)}/>
                    </div>
                );

            }else{
                paletteContent = (
                    <div className="swatches">
                        {pal.colors.map(tuple => <Clickable classNames="pal-swatch">{this.swatch(tuple)}</Clickable>)}
                        <Button icon={`plus`} iconSize={20} onClick={() => this.startAddMode()}/>
                        <Button icon={'eyedropper'} onClick={() => this.startEyedropperAdd()}/>
                        {/*<Button icon={'copy'} onClick={() => this.copyCode(pal)}/>*/}
                        <Button icon={'code-file'} onClick={() => this.startCodeMode(pal)}/>
                    </div>
                );
            }

            return (
                <div className="ui-palette">
                    <div className="palette-label">{pal.name}</div>
                    {paletteContent}
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