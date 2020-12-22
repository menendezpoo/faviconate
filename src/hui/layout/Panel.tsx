import * as React from "react";
import {FunctionComponent, ReactNode} from "react";

export interface PanelProps {
    spacing?: number;
    children: ReactNode;
}

export const Panel: FunctionComponent<PanelProps> = (props: PanelProps) => {
    return (
        <div className="ui-panel"
             style={{
                 overflow: "auto"
             }}
        >
            {props.children}
        </div>
    );
};