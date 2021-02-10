import * as React from "react";
import {ClassNames, cn} from "../hui/helpers/hui";

export interface ContainerPanelProps extends ClassNames{
    children?: React.ReactNode;
}
interface ContainerPanelState{}

export class ContainerPanel extends React.Component<ContainerPanelProps, ContainerPanelState>{

    render() {
        return (
            <div className={cn(`container-panel`, this.props.classNames)}>
                <div className="marker n"/>
                <div className="marker s"/>
                <div className="marker e"/>
                <div className="marker w"/>
                <div className="content">
                    {this.props.children}
                </div>
            </div>
        );
    }

}