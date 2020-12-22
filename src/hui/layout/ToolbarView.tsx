import * as React from "react";
import {ReactNode} from "react";
import {DockView, DockViewProps} from "./DockView";

const DEFAULT_TOOLBAR_SIZE = 40;

export interface ToolbarViewProps extends DockViewProps{
    items?: ReactNode;
    itemsCenter?: ReactNode;
    itemsFar?: ReactNode;
}

export class ToolbarView extends React.Component<ToolbarViewProps>{

    render(){

        const len = this.props.length || DEFAULT_TOOLBAR_SIZE;
        const side = this.props.side || 'top';

        return (
            <DockView
                {...this.props}
                length={len}
                classNames={`ui-toolbar-view ${this.props.classNames || ''}`}
                side={side}
                sideClassNames={`toolbar ${this.props.sideClassNames || ''}`}
                sideView={<>
                    <div className="items near">{this.props.items}</div>
                    <div className="items center">{this.props.itemsCenter}</div>
                    <div className="items far">{this.props.itemsFar}</div>
                </>}
            >
                {this.props.children}
            </DockView>
        );
    }

}