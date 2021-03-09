import * as React from "react";
import {Expando} from "./Expando";
import {Color} from "../hui/helpers/Color";
import {Palette} from "../model/PaletteService";

const MAX_SWATCHES = 50;

export interface ColorUsageExpandoProps{
    data: Uint8ClampedArray;
    palette?: Palette;
}

interface ColorUsageExpandoState{}

type UsageEntry = UsageEntryColor | UsageEntryMessage;

interface UsageEntryColor{
    name: string;
    color: Color;
    count: number;
}

interface UsageEntryMessage{
    message: string;
}

export class ColorUsageReport extends React.Component<ColorUsageExpandoProps, ColorUsageExpandoState>{

    private report: UsageEntry[] = [];

    constructor(props: ColorUsageExpandoProps) {
        super(props);
        this.buildReport();
    }

    private buildReport(){

        const data = this.props.data;
        const palette: Palette = this.props.palette || {name: '', colors:[]};
        const map: {[color: string]: number} = {};
        const report: UsageEntry[] = [];
        const warnings: UsageEntryMessage[] = [];
        let count = 0;

        for(let i = 0; i < data.length; i += 4 ){
            const color = Color.fromTupleInt8([data[i], data[i+1], data[i+2], data[i+3]]);
            const key = color.hexRgba;

            if (key in map){
                map[key]++;

            }else{
                map[key] = 1;
                if(count++ > MAX_SWATCHES){
                    warnings.push({message: `Limit of color count reached: ${MAX_SWATCHES}`});
                    break;
                }
            }
        }

        // Pass map to report
        for( let key in map){
            const color = Color.fromHex(key);
            const count = map[key];
            const palMatch = palette.colors.find(tuple => tuple.hex === color.toString());
            const name = palMatch ? palMatch.name : color.toString();
            report.push({color, count, name});
        }

        report.sort((a, b) => {
            if ('count' in a && 'count' in b){
                return b.count - a.count;
            }
            return 0;
        });

        warnings.forEach(w => report.push(w));

        this.report = report;

    }

    componentDidUpdate(prevProps: Readonly<ColorUsageExpandoProps>, prevState: Readonly<ColorUsageExpandoState>, snapshot?: any) {

    }

    render() {
        this.buildReport();

        return (
            <div className="color-usage-report">
                {this.report.map(entry => {

                    if ('message' in entry){
                        return (
                            <div className="entry message">{entry.message}</div>
                        );
                    }else{
                        return (
                            <div className="entry color">
                                <div className="swatch" style={{backgroundColor: entry.color.cssRgba}}/>
                                <div><span className="lighter">{entry.name}</span> {entry.count}</div>
                            </div>
                        );
                    }
                    })}
            </div>
        );
    }

}