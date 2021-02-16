import * as React from "react";
import {Expando} from "./Expando";
import {Color} from "../hui/helpers/Color";
import {Label} from "../hui/items/Label";

const MAX_SWATCHES = 100;

export interface ColorUsageExpandoProps{
    data: Uint8ClampedArray;
}

interface ColorUsageExpandoState{}

type UsageEntry = UsageEntryColor | UsageEntryMessage;

interface UsageEntryColor{
    color: Color;
    count: number;
}

interface UsageEntryMessage{
    message: string;
}

export class ColorUsageExpando extends React.Component<ColorUsageExpandoProps, ColorUsageExpandoState>{

    private report: UsageEntry[] = [];

    constructor(props: ColorUsageExpandoProps) {
        super(props);
        this.buildReport();
    }

    private buildReport(){

        const data = this.props.data;
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
            report.push({color, count});
        }

        warnings.forEach(w => report.push(w));

        this.report = report;

        console.log(data);
        console.log(map);
        console.log(warnings);
        console.log(report);


    }


    render() {
        this.buildReport();

        return (
            <Expando title={`Usage`}>
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
                                    <Label text={String(entry.count)}/>
                                </div>
                            );
                        }
                        })}
                </div>
            </Expando>
        );
    }

}