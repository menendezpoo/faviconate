import * as React from "react";

export type IconSize = 8 | 16 | 32;
export type IconName = "empty" | "cross" | "floppy" | "file" | "folder" | "chevron-up" | "chevron-down" | "chevron-left" | "chevron-right";

export interface IconProps{
    classNames?: string;
    name: IconName;
    size?: IconSize;
}

export const Icon = (props: IconProps) => {
    return <div className={`ui-icon size-${props.size || 16} icon-${props.name} ${props.classNames || ''}`} />;
};