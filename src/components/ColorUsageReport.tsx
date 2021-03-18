import * as React from "react";
import {Color} from "../hui/helpers/Color";
import {Palette} from "../model/PaletteService";
import {Button} from "../hui/items/Button";
import {ClipboardService} from "../model/ClipboardService";
import {Separator} from "../hui/items/Separator";

const MAX_SWATCHES = 100;
const DEFAULT_VISIBLE_ITEMS = 10;

export interface ColorUsageExpandoProps{
    data: Uint8ClampedArray;
    palette?: Palette;
}

interface ColorUsageExpandoState{
    showAll?: boolean;
}

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
        this.state = {};
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

    private getTextReport(): string{
        return this.report.map(entry => {
            if ('message' in entry){
                return entry.message;
            }else{
                const {color, count, name} = entry;
                return `${color}, ${name}, ${count}`
            }
        }).join('\n');
    }

    private copyReportToClipboard(){
        const text = this.getTextReport();
        console.log(JSON.stringify(this.report));
        ClipboardService.systemCopyText(text).then(() => console.log(`Copied to clipboard.`));
    }

    private swapShowAll(){

        const {showAll} = this.state;

        this.setState({showAll: !showAll});

    }

    render() {
        this.buildReport();

        const {showAll} = this.state;
        const fullCount = this.report.length;
        const report = showAll ? this.report : this.report.slice(0, DEFAULT_VISIBLE_ITEMS);

        return (
            <div className="color-usage-report">
                {report.map(entry => {

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

                {(() => {
                    if (fullCount > DEFAULT_VISIBLE_ITEMS){
                        return (
                            <>
                                <Separator/>
                                <Button
                                    text={showAll ? `Show Less` : `Show all (${this.report.length})`}
                                    onClick={() => this.swapShowAll()}/>
                            </>
                        );
                    }
                })() }
                <Separator/>
                <Button
                    icon={`copy`}
                    iconSize={50}
                    onClick={() => this.copyReportToClipboard()}/>
            </div>
        );
    }

}