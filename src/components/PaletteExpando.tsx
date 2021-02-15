import * as React from "react";
import {Button} from "../hui/items/Button";
import {Expando} from "./Expando";
import {PaletteManager} from "./PaletteManager";
import {Palette, PaletteService} from "../model/PaletteService";

export interface PaletteExpandoProps{

}

interface PaletteExpandoState{
    palette?: Palette;
}

export class PaletteExpando extends React.Component<PaletteExpandoProps, PaletteExpandoState>{

    constructor(props: PaletteExpandoProps) {
        super(props);
        this.state = {};
    }

    private resetPalette(){
        this.setState({palette: undefined});
    }

    private setPalette(palette: Palette){
        this.setState({palette});
    }

    private savePalette(){
        const palette = this.state.palette;

        if (!palette){
            throw new Error();
        }

        if (palette.unnamed){
            palette.name = prompt('Name for the palette', palette.name) || 'Unnamed palette';
        }

        PaletteService.upsert(palette)
            .then(p => this.setPalette(p))
            .catch(e => console.log(`Not saved: ${e}`));
    }

    render() {

        const palette = this.state.palette;
        let paletteItems = <></>;

        const btnReturn = <Button icon={'return'} iconSize={50} onClick={() => this.resetPalette()}/>;

        if (palette && palette.unsaved){
            paletteItems = (
                <>
                    {btnReturn}
                    <Button icon={'floppy'} iconSize={50} onClick={() => this.savePalette()}/>
                </>
            );
        }else if(palette){
            paletteItems = (
                <>
                    {btnReturn}
                </>
            );
        }

        return (
            <Expando title={`Palette`} items={paletteItems}>
                <PaletteManager palette={palette || undefined} paletteChanged={p => this.setPalette(p)}/>
            </Expando>
        );
    }
}