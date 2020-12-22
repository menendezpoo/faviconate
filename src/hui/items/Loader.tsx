import * as React from "react";
import {Label, LabelProps} from "./Label";

export interface LoaderProps extends LabelProps{
    text: string;
}

export class Loader extends React.Component<LoaderProps>{
    render(){
        return (
            <div className={`ui-loader`}>
                <Label {...this.props}/>
            </div>
        );
    }
}