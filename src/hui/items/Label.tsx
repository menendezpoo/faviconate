import * as React from "react";
import {Icon, IconName, IconSize} from "./Icon";
import {ClassNames, cn} from "../helpers/hui";

export interface LabelProps extends ClassNames{
    text?: string;
    icon?: IconName;
    iconSize?: IconSize;
    description?: string;
}

export const Label = (props: LabelProps) => {

    const classTag = cn("ui-label", props.classNames);

    if(props.icon && !props.text) {
        return <div className={classTag}>
            <Icon name={props.icon} size={props.iconSize}/>
        </div>
    }else if(!props.icon && !props.description) {
        return <div className={classTag}>{props.text}</div>;

    }else if(!props.icon && props.description) {
        return <div className={classTag}>
            <div className="text">{props.text}</div>
            <div className="desc">{props.description}</div>
        </div>;

    }else if(props.icon){
        if(props.description) {
            return <div className={cn(classTag, 'with-icon')}>
                <Icon name={props.icon} size={props.iconSize} />
                <div className="text-side">
                    <div className="text">{props.text}</div>
                    <div className="desc">{props.description}</div>
                </div>
            </div>
        }else{
            return <div className={cn(classTag, 'with-icon')}>
                <Icon name={props.icon} size={props.iconSize} />
                <div className="text">{props.text}</div>
            </div>
        }
    }else{
        throw "Undesired configuration";
    }
};