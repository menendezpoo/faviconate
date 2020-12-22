import * as React from "react";
import {ReactNode} from "react";

export interface TabLayoutProps{
    children?: ReactNode;
    selected: number;
}

export interface TabLayoutState {
    selected: number;
}

export class TabLayout extends React.Component<TabLayoutProps, TabLayoutState>{

    getDefaultProps(){
        return {
            selected: 0
        }
    }

    getInitialState(){
        return {
            selected: this.props.selected
        }
    }

    renderContent(){
        return <div>{React.Children.toArray(this.props.children)[this.state.selected]}</div>;
    }

    renderTitles(){
        return <div className={`labels`}>
            {React.Children.map(this.props.children,(child, index) => {
                if(child) {
                    return <div className={`label`}>{(child as any).props.label}</div>;
                }else{
                    return null;
                }
            })}
        </div>;
    }

    render(){
        return <div className={`ui-tab-layout`}>
            {this.renderTitles()}
            {this.renderContent()}
        </div>;
    }
}