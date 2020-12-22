import * as React from "react";
import {DockView, DockViewProps} from "./DockView";

export interface SplitViewProps extends DockViewProps{
}

export class SplitView extends React.Component<SplitViewProps>{

    render(){

        return (
            <DockView
                {...this.props}
                classNames={`ui-split-view`}
            >
                {this.props.children}
            </DockView>
        );

    }
}