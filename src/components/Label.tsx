import * as React from "react";

export interface LabelProps {
    text: string;
}

export const Label = (props: LabelProps) => <div className="label">{props.text}</div>;