import * as React from "react";
import {ReactElement} from "react";
import {ButtonProps} from "./Button";

export interface ItemGroupProps {
    selectedIndex?: number;
}

interface ItemGroupState{
}

export class ItemGroup extends React.Component<ItemGroupProps, ItemGroupState>{

    constructor(props: ItemGroupProps){
        super(props);
        this.state = {};
    }

    render(){
        return (
            <div className={`ui-item-group`}>
                {React.Children.map(this.props.children, (item: ReactElement<ButtonProps>, index) =>
                    React.cloneElement(item, {
                        selected: index === this.props.selectedIndex
                    })
                )}
            </div>
        );
    }

}