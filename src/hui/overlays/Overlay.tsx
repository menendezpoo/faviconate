import * as React from "react";

export interface OverlayProps {
    top: number;
    left: number;
    width?: number | "auto";
    height?: number | "auto";
    children: React.ReactNode;
}

export class Overlay extends React.Component<OverlayProps>{

    render(){

        const st = {
            top: this.props.top + 'px',
            left: this.props.left + 'px',
            width: `auto`,
            height: `auto`
        };

        if("number" === typeof this.props.height) {
            st.height = this.props.height + 'px';
        }

        if("number" === typeof this.props.width) {
            st.width = this.props.width + 'px';
        }

        return <div className={`ui-overlay`} style={st}>
            {this.props.children}
        </div>;
    }

}