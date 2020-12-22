import * as React from "react";
import {KeyboardEvent, ReactElement} from "react";
import {TreeItemProps} from "../items/TreeItem";
import {RefObject} from "react";

export interface TreeViewProps {

}

interface TreeViewState {
    expandedNodes: string[];
    selectedNodes: string[];
}

export class TreeView extends React.Component<TreeViewProps, TreeViewState>{

    ref: RefObject<HTMLDivElement>;

    constructor(props: TreeViewProps) {
        super(props);
        this.ref = React.createRef();
        this.keyDown = this.keyDown.bind(this);
        this.state = {
            expandedNodes: [],
            selectedNodes: [],
        };
    }

    keyDown(e: KeyboardEvent<HTMLDivElement>){
        // console.log(`keydown on tree ${e.key}`);
        if(e.key === 'ArrowDown') {
            this.selectAdjacent('next');

        }else if(e.key === 'ArrowUp') {
            this.selectAdjacent('prev');

        }else if(e.key === 'ArrowRight') {
            this.actionOnSelected('expand');

        }else if(e.key === 'ArrowLeft'){
            this.actionOnSelected('collapse');

        }else if(e.key === 'End') {
            this.selectAdjacent('first');

        }else if(e.key === 'Start') {
            this.selectAdjacent('last');
        }
    }

    setSelectedNode(key: string){
        this.setState({selectedNodes: [key]});
    }

    addExpandedNode(key: string){
        if(!this.isExpanded(key)){
            this.setState({expandedNodes: this.state.expandedNodes.concat(key)});
        }

        setTimeout( () => console.log(`update expanded: ${JSON.stringify(this.state.expandedNodes)}`));
    }

    removeExpandedNode(key: string){
        this.setState({expandedNodes: this.state.expandedNodes.filter(n => n != key)});
    }

    isExpanded(key: string): boolean{
        return this.state.expandedNodes.filter(k => k === key).length > 0;
    }

    isSelected(key: string): boolean{
        return this.state.selectedNodes.filter(k => k === key).length > 0;
    }

    private createVisibleNodeKeyArray(): string[] | null{
        const ka = `data-tree-key`;
        const nodeList = this.ref.current?.querySelectorAll(`.ui-tree-item`);

        if(nodeList) {

            const list: string[] = [];

            for(let node of nodeList){
                list.push(node.getAttribute(ka)!);
            }

            return list;
        }

        return null;
    }

    selectAdjacent(type: 'prev' |'next' | 'first' | 'last'){
        const selectedKey = this.state.selectedNodes[0];
        const nodes = this.createVisibleNodeKeyArray();
        const index = nodes?.indexOf(selectedKey) || 0;

        if(!nodes) return;

        let newIndex = type === 'next' ? index + 1 : index - 1;

        if(type === 'first') {
            newIndex = 0;
        }

        if(type === 'last') {
            newIndex = nodes.length - 1;
        }

        if(newIndex >= nodes.length) {
            newIndex = nodes.length - 1;
        }

        if(newIndex < 0) {
            newIndex = 0;
        }

        this.setSelectedNode(nodes[newIndex]);

    }

    actionOnSelected(type: 'expand' | 'collapse'){
        for(let key of this.state.selectedNodes){
            if(type === 'expand') {
                this.addExpandedNode(key);
            }else{
                this.removeExpandedNode(key);
            }
        }
    }

    render(){
        return (
            <div className={`ui-tree-view`}
                 tabIndex={0}
                 ref={this.ref}
                 onKeyDown={this.keyDown}
            >
                {React.Children.map(this.props.children,
                    (item: ReactElement<TreeItemProps>) => React.cloneElement(item, {
                        tree: this,
                        expanded: this.isExpanded(item.props.itemKey!),
                        selected: this.isSelected(item.props.itemKey!),
                    }))}
            </div>
        );
    }
}