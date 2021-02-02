import * as React from "react";
import {Callable, ClassNames, cn} from "../helpers/hui";

export interface ClickableProps extends ClassNames{
    isSelected?: boolean;
    avoidHover?: boolean;
    onClick?: Callable;
    children?: React.ReactNode;
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
        const classTags = cn(
            `ui-clickable`,
            {selected: this.props.isSelected || this.state.isHovered},
            this.props.classNames
        );
        return (
            <div
                className={classTags}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
                onClick={this.props.onClick}
            >
                {this.props.children}
            </div>
        );
    }
}