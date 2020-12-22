import * as React from "react";
import {Label, LabelProps} from "./Label";
import {Icon, IconName} from "./Icon";
import {ReactElement} from "react";
import {TreeView} from "../layout/TreeView";

export interface TreeItemProps extends LabelProps{
    itemKey?: string;
    expanded?: boolean;
    selected?: boolean;
    level?: number;
    tree?: TreeView;
    parent?: TreeItem;
}


export class TreeItem extends React.Component<TreeItemProps>{

    constructor(props: TreeItemProps){
        super(props);
        this.state = {selectedIndex: -1};
        this.click = this.click.bind(this);
    }

    click(){

        const count = React.Children.count(this.props.children);

        if(count > 0) {
            if(this.props.expanded) {
                this.props.tree!.removeExpandedNode(this.props.itemKey!);
            }else{
                this.props.tree!.addExpandedNode(this.props.itemKey!);
            }
        }

        this.props.tree!.setSelectedNode(this.props.itemKey!);

        // if(this.props.selectRequested) {
        //     this.props.selectRequested.call(this);
        // }
    }

    render(){
        const level = this.props.level || 0;
        const count = React.Children.count(this.props.children);
        const chevron: IconName = count > 0 ?
            this.props.expanded ? `chevron-down` : `chevron-right`
            : `empty`;
        const tagger = count > 0 ?
            this.props.expanded ? `expanded` : `collapsed`
            : `childless`;
        const contents = count && this.props.expanded ?
            <div className={`tree-item-children`}>
                {React.Children.map(this.props.children, (item: ReactElement<TreeItemProps>, index) =>
                    React.cloneElement(item, {
                        level: level + 1,
                        tree: this.props.tree,
                        expanded: this.props.tree!.isExpanded(item.props.itemKey!),
                        selected: this.props.tree!.isSelected(item.props.itemKey!),
                        parent: this,
                    })
                )}

            </div>
            : undefined ;

        return (
            <>
                <div className={`${this.props.selected ? 'selected' : ''} ${tagger} ui-tree-item`}
                     data-tree-key={this.props.itemKey}
                     onClick={this.click}
                     style={ {paddingLeft: level ? (level * 1.5) + 'em' : undefined}}
                >
                    <Icon name={chevron} size={8} classNames={`collapse-glyph`}/>
                    <Label {...this.props}/>
                </div>
                {contents}
            </>
        );
    }
}