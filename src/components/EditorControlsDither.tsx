import * as React from 'react';
import {Expando} from "./Expando";
import {Range} from "../hui/items/Range";
import {PaletteExpando} from "./PaletteExpando";
import {Button} from "../hui/items/Button";
import {AdjustProperties, AdjustTool} from "../model/tools/AdjustTool";
import {Palette} from "../model/PaletteService";

export interface EditorControlsDitherProps{
    tool: AdjustTool;
}

interface EditorControlsDitherState{
    adjust: AdjustProperties;
}

export class EditorControlsDither extends React.Component<EditorControlsDitherProps, EditorControlsDitherState>{

    constructor(props: EditorControlsDitherProps){
        super(props);
        this.state = {adjust: {}};
    }

    private commandApplyAdjustments(){
        this.props.tool.apply();
    }

    private commandContrast(contrast: number){
        const adjust = this.state.adjust;
        this.setState({adjust: {...adjust, contrast}});
    }

    private commandBrightness(brightness: number){
        const adjust = this.state.adjust;
        this.setState({adjust: {...adjust, brightness}});
    }

    private commandDitheringKernel(kernel: number){
        const adjust = this.state.adjust;
        this.setState({adjust: {...adjust, kernel}});
    }

    private commandDitheringSerpentine(serpentine: boolean){
        const adjust = this.state.adjust;
        this.setState({adjust: {...adjust, serpentine}});
    }

    private commandResetPalette(){
        const adjust = this.state.adjust;
        this.setState({adjust: {...adjust, palette: undefined}});
    }

    private commandSetPalette(palette: Palette){
        const adjust = this.state.adjust;
        this.setState({adjust: {...adjust, palette}});
    }

    componentDidUpdate(prevProps: Readonly<EditorControlsDitherProps>, prevState: Readonly<EditorControlsDitherState>, snapshot?: any) {
        this.props.tool.updateAdjustments(this.state.adjust);
    }

    render() {

        const props = this.state.adjust;

        return (
            <>
                <Expando title={`Adjust`}>
                    <div className="adjusters">
                        <Range min={-200} max={200} value={props.brightness || 0} onChange={value => this.commandBrightness(value)} />
                        <Range min={-128} max={128} value={props.contrast || 0} onChange={value => this.commandContrast(value)} />
                    </div>
                </Expando>
                <PaletteExpando
                    title={props.palette ? `Palette` : `Apply Palette`}
                    onPaletteChanged={p => this.commandSetPalette(p)}
                    onPaletteReset={() => this.commandResetPalette()}
                />
                <Expando title={`Dithering`}>
                    <Range min={0} max={8} round={true} value={props.kernel || 0} onChange={value => this.commandDitheringKernel(value)} />
                    <Button selected={!!props.serpentine} text={`Serpentine: ` + (props.serpentine ? 'yes' : 'no')} onClick={() => this.commandDitheringSerpentine(!props.serpentine)} />
                </Expando>
                <Button classNames={`cta`} text={`Apply`} onClick={() => this.commandApplyAdjustments()}/>
            </>
        );
    };
}