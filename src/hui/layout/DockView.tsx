import * as React from "react";
import {CSSProperties, ReactNode} from "react";

const DEFAULT_LENGTH = 300;

export interface DockViewProps {
    classNames?: string;
    sideClassNames?: string;
    containerClassNames?: string;
    side?: 'left' | 'right' | 'top' | 'bottom';
    sideView?: ReactNode;
    length?: number;
}

export class DockView extends React.Component<DockViewProps>{

    render(){

        const side = this.props.side || 'left';
        const len = this.props.length || DEFAULT_LENGTH;
        let sideCss: CSSProperties = {};
        let mainCss: CSSProperties = {};

        switch (side) {
            case "left":
                sideCss.width = len + 'px';
                mainCss.left = len + 'px';
                break;
            case "right":
                sideCss.width = len + 'px';
                mainCss.right = len + 'px';
                break;
            case "top":
                sideCss.height = len + 'px';
                mainCss.top = len + 'px';
                break;
            case "bottom":
                sideCss.height = len + 'px';
                mainCss.bottom = len + 'px';
                break;
        }

        return (
            <div className={`ui-dock-view side-${side} ${this.props.classNames}`}>
                <div className={`dock-side ${this.props.sideClassNames || ''}`} style={sideCss}>{this.props.sideView}</div>
                <div className={`main-side ${this.props.containerClassNames || ''}`} style={mainCss}>{this.props.children}</div>
            </div>
        );

    }
}