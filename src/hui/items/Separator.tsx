import * as React from "react";

export interface SeparatorProps{

}

export class Separator extends React.Component<SeparatorProps>{
    render(){
        return (
            <div className={`ui-separator`}/>
        );
    }
}