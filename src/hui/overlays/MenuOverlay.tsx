import * as React from "react";
import {OverlayProps} from "./Overlay";
import {MenuItem, MenuItemProps} from "../items/MenuItem";
import {RefObject} from "react";
import {Separator} from "../items/Separator";
import {Rectangle} from "../helpers/Rectangle";
import {Callable} from "../helpers/hui";
import {KeyCaptureStackHandler} from "../helpers/KeyCaptureStackHandler";

export interface MenuOverlayProps extends OverlayProps{
    refRect: Rectangle;
    onDismissSignal: Callable;
    onDismissSingleSignal?: Callable;
    parentMenuItem?: MenuItem;
}

export interface MenuOverlayState{
    selectedIndex?: number;
    openIndex?: number;
    activatedIndex?: number;
}

export class MenuOverlay extends React.Component<MenuOverlayProps, MenuOverlayState>{

    overlayRef: RefObject<HTMLDivElement> | undefined;

    readonly keyCaptureId: number;
    private childCount: number | undefined;
    private separators: number[] = [];

    constructor(props: MenuOverlayProps){
        super(props);
        this.overlayRef = React.createRef();
        this.state = {};
        this.setOpenItem = this.setOpenItem.bind(this);
        const isActivationKey = (e: KeyboardEvent) => e.key === 'Enter' || e.key === ' ';
        const cancelAndDo = (e: KeyboardEvent, f: Callable) => {
            e.stopPropagation();
            e.preventDefault();
            f();
        };

        this.keyCaptureId = KeyCaptureStackHandler.instance.register(e => {
            if(e.key == 'ArrowDown') {
                cancelAndDo(e, this.selectNext.bind(this));

            }else if(e.key === 'ArrowUp') {
                cancelAndDo(e, this.selectPrev.bind(this));

            }else if(e.key === 'ArrowRight' || isActivationKey(e)) {
                cancelAndDo(e, this.openCurrentIndex.bind(this));

                if(isActivationKey(e)) {
                    this.setState({activatedIndex: this.state.selectedIndex});
                }

            }else if(e.key === 'ArrowLeft') {
                if("undefined" !== typeof this.props.parentMenuItem) {
                    cancelAndDo(e, () => this.sendDismissSingleSignal());
                }
            }
        });
    }

    closeOpenedIndex(){
        if("undefined" !== typeof this.state.openIndex) {
            this.setState({openIndex: undefined});
        }
    }

    componentWillUnmount(): void {
        KeyCaptureStackHandler.instance.unregister(this.keyCaptureId);
    }

    selectNext(){

        let current = -1;

        if("number" === typeof this.state.selectedIndex) {
            current = this.state.selectedIndex;
        }

        let next = current + 1;

        while("undefined" !== typeof this.separators.find(i => i === next)) {
            next++;
        }

        if("undefined" !== typeof this.childCount && next >= this.childCount) {
            next = 0;
        }

        this.setState({selectedIndex: next});
    }

    selectPrev(){

        let current = -1;

        if("number" === typeof this.state.selectedIndex) {
            current = this.state.selectedIndex;
        }

        let prev = current - 1;

        while("undefined" !== typeof this.separators.find(i => i === prev)) {
            prev--;
        }

        if(prev < 0) {
            if("undefined" !== typeof this.childCount) {
                prev = this.childCount - 1;
            }else{
                prev = 0;
            }
        }

        this.setState({selectedIndex: prev});
    }

    openCurrentIndex(){
        if("undefined" !== typeof this.state.selectedIndex) {
            this.setOpenItem(this.state.selectedIndex);
        }
    }

    correctPosition(){
        if(!(this.overlayRef && this.overlayRef.current)) {
            return;
        }

        const rect = Rectangle.fromDOMRect(this.overlayRef.current.getBoundingClientRect());
        const view = {width: window.innerWidth, height: window.innerHeight};
        const refRect = this.props.refRect;
        let newRectangle = rect.clone();

        if(rect.right > view.width) {
            newRectangle = newRectangle.withRight(refRect.right);
        }

        if(rect.bottom > view.height) {
            newRectangle = newRectangle.withBottom(view.height);
        }

        if(!newRectangle.equals(rect)) {
            this.overlayRef.current.style.left = newRectangle.left + 'px';
            this.overlayRef.current.style.top  = newRectangle.top  + 'px';
        }
    }

    setNoOpenItem(){
        this.setState({selectedIndex: undefined});
    }

    setOpenItem(index: number){
        this.setState({selectedIndex: index, openIndex: index});
    }

    setSelectedItem(index: number){
        this.setState({selectedIndex: index});
    }

    render(){
        const st = {
            top: this.props.top + 'px',
            left: this.props.left + 'px',
            width: `auto`,
            height: `auto`,
        };

        if("number" === typeof this.props.height) {
            st.height = this.props.height + 'px';
        }

        if("number" === typeof this.props.width) {
            st.width = this.props.width + 'px';
        }

        setTimeout(() => {
            this.correctPosition();
        });

        this.childCount = React.Children.count(this.props.children);

        this.separators = []; // Reset to collect on .map bellow

        return <div ref={this.overlayRef} className={`ui-overlay ui-menu-overlay`} style={st}>
            {React.Children.map(this.props.children, (menuItem: React.ReactElement<MenuItemProps>, index) => {
                if(menuItem.type === Separator) {
                    this.separators.push(index);
                }
                return React.cloneElement(menuItem, {
                    onOpen: () => this.setOpenItem(index),
                    onClose: () => this.setNoOpenItem(),
                    onDismissSignal: () => this.sendDismissSignal(),
                    onDismissSingleSignal: () => this.closeOpenedIndex(),
                    onSelectSignal: () => this.setSelectedItem(index),
                    isSelected: index === this.state.selectedIndex,
                    isOpen: index === this.state.openIndex,
                    isActivated: index === this.state.activatedIndex,
                    parent: this,
                });
            })}
        </div>;
    }

    sendDismissSignal(){
        if(this.props.onDismissSignal) {
            this.props.onDismissSignal();
        }
    }

    sendDismissSingleSignal(){
        if(this.props.onDismissSingleSignal) {
            this.props.onDismissSingleSignal();
        }
    }
}