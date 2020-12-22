import * as React from "react";
import {ToolbarView, ToolbarViewProps} from "./ToolbarView";
import {ReactNode} from "react";
import {IconName} from "../items/Icon";
import {Button} from "../items/Button";
import {DockViewProps} from "./DockView";

export interface Tab {
    key: string;
    text?: string;
    icon?: IconName;
}

export interface TabViewProps extends DockViewProps{
    tabs: Tab[];
    selected?: string;
}

export class TabView extends React.Component<TabViewProps>{
    render(){

        /*HERE:! IMPLEMENTING THIS*/

        return (
            <ToolbarView
                {...this.props}
                classNames={`ui-tab-view`}
                sideClassNames={`tabs`}
                itemsCenter={this.props.tabs.map(t => (
                    <Button {...t} classTag={`tab`} selected={t.key === this.props.selected}/>
                ))}
            >
                {this.props.children}
            </ToolbarView>
        );
    }
}