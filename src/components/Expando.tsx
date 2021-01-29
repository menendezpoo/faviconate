import * as React from "react";

export interface ExpandoProps{
    title: string;
    children?: React.ReactNode;
    items?: React.ReactNode;
}

interface ExpandoState{

}

export class Expando extends React.Component<ExpandoProps, ExpandoState>{

    render() {
        return (
            <div className="expando">
                <div className="head">
                    <div className="label">{this.props.title}</div>
                    <div className="items">{this.props.items}</div>
                </div>
                <div className="body">
                    <div className="children">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }

}