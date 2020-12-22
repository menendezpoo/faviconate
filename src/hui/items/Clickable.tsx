import * as React from "react";
import {Label, LabelProps} from "./Label";
import {Callable} from "../helpers/hui";

export interface ClickableProps extends LabelProps{
    isSelected?: boolean;
    avoidHover?: boolean;
    onClick?: Callable;
}

interface ClickableState {
    isHovered?: boolean;
}
export class Clickable extends React.Component<ClickableProps, ClickableState>{

    constructor(props: ClickableProps){
        super(props);
        this.state = {};
        this.mouseEnter = this.mouseEnter.bind(this);
        this.mouseLeave = this.mouseLeave.bind(this);
    }

    mouseEnter(){
        if(this.props.avoidHover !== true) {
            this.setState({isHovered: true});
        }
    }

    mouseLeave(){
        if(this.props.avoidHover !== true) {
            this.setState({isHovered: false});
        }
    }

    render(){
        return (
            <div
                className={`ui-clickable ${this.props.isSelected || this.state.isHovered ? 'selected' : ''}`}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
                onClick={this.props.onClick}
            >
                <Label {...this.props} />
            </div>
        );
    }
}