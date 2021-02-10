import * as React from "react";
import {ToolbarView} from "../hui/layout/ToolbarView";
import {Label} from "../hui/items/Label";
import {Button} from "../hui/items/Button";
import {Range} from "../hui/items/Range";
import {DockView} from "../hui/layout/DockView";
import {ContainerPanel} from "./ContainerPanel";

export interface ReviewStudioProps{

}

interface ReviewStudioState{
    sampleSize: number;
}

export class ReviewStudio extends React.Component<ReviewStudioProps, ReviewStudioState>{

    constructor(props: ReviewStudioProps) {
        super(props);

        this.state = {
            sampleSize: 3,
        }
    }

    render() {

        const topItems = (
            <>
                <Label text={`Review`}/>
            </>
        );

        const topItemsFar = (
            <>
                <Button icon={`dismiss`} iconSize={20}/>
            </>
        );

        return (
            <div className={`modal review-studio`}>
                <ToolbarView items={topItems} itemsFar={topItemsFar}>
                    <DockView side={`right`}>
                        <ContainerPanel classNames={`main-panel`}>
                            <div className={`row sample-size`}>
                                <div className="caption">Sample Size</div>
                                <Range min={1} max={10} round={true} value={this.state.sampleSize} onChange={sampleSize => this.setState({sampleSize})}/>
                                <div className="value">{this.state.sampleSize} X {this.state.sampleSize}</div>
                            </div>
                            <div className="row corner">
                                <div className="caption">Corner to Start</div>
                                <div className="corner-grid">
                                    <div className="row">
                                        <div className="corner nw selected"/>
                                        <div className="corner ne"/>
                                    </div>
                                    <div className="row">
                                        <div className="corner sw"/>
                                        <div className="corner se"/>
                                    </div>
                                </div>
                            </div>
                            <div className="row cta">
                                <Button classNames={`cta`} text={`Start`}/>
                            </div>
                        </ContainerPanel>
                    </DockView>
                </ToolbarView>
            </div>
        );
    }

}
