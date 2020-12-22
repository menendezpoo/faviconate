import * as React from "react";
import {Label, LabelProps} from "./Label";
import {Icon} from "./Icon";
import {MenuOverlay} from "../overlays/MenuOverlay";
import {RefObject} from "react";
import {Callable} from "../helpers/hui";
import {ClickDismiss} from "../helpers/ClickDismiss";
import {Rectangle} from "../helpers/Rectangle";

export interface MenuItemProps  extends LabelProps{
    children?: React.ReactNode;
    isOpen?: boolean;
    isSelected?: boolean;
    isActivated?: boolean;
    onOpen?: Callable;
    onClose?: Callable;
    onActivate?: Callable;
    onDismissSignal?: Callable;
    onDismissSingleSignal?: Callable;
    onSelectSignal?: Callable;
    parent?: MenuOverlay;
}

export interface MenuItemState {
}

export class MenuItem extends React.Component<MenuItemProps, MenuItemState>{

    ref: RefObject<HTMLDivElement>;

    constructor(props: MenuItemProps){
        super(props);
        this.ref = React.createRef();
        this.showOverlay = this.showOverlay.bind(this);
        this.hideOverlay = this.hideOverlay.bind(this);
        this.mouseActivate = this.mouseActivate.bind(this);
        this.sendDismissSignal = this.sendDismissSignal.bind(this);
        this.sendDismissSingleSignal = this.sendDismissSingleSignal.bind(this);
        this.sendSelectSignal = this.sendSelectSignal.bind(this);
    }

    mouseActivate(e: React.MouseEvent<HTMLDivElement, MouseEvent>){
        e.stopPropagation();

        this.activate();
    }

    activate(){

        if(this.props.onActivate) {
            this.props.onActivate();
        }

        this.sendDismissSignal();

    }

    hideOverlay(e: React.MouseEvent<HTMLDivElement, MouseEvent>){

        ClickDismiss.mouseup.preventNextEvent();
        e.stopPropagation();

        if(this.props.onClose) {
            this.props.onClose();
        }
    }

    showOverlay(e: React.MouseEvent<HTMLDivElement, MouseEvent>){

        ClickDismiss.mouseup.preventNextEvent();

        e.stopPropagation();

        if(this.props.onOpen && this.ref && this.ref.current) {
            this.props.onOpen();
        }
    }


    render(){

        const selectedClass = this.props.isSelected ? 'is-selected' : '';
        const propsWithIcon = Object.assign({icon: "empty"}, this.props);

        if(this.props.isActivated === true && React.Children.count(this.props.children) === 0) {
            setTimeout(() => this.activate());
        }

        if(this.props.children) {

            const rect = Rectangle.fromDOMRect(this.ref.current?.getBoundingClientRect() || new DOMRect());

            if(this.props.isOpen) {
                return (
                    <div ref={this.ref} className={`ui-menuitem is-selected is-open`} onMouseDown={this.hideOverlay}>
                        <Label {...propsWithIcon} />
                        <Icon name={`chevron-right`} size={8} />
                        <MenuOverlay
                            left={rect.right} top={rect.top} refRect={rect} parentMenuItem={this}
                            onDismissSingleSignal={this.sendDismissSingleSignal}
                            onDismissSignal={this.sendDismissSignal}>
                            {this.props.children}
                        </MenuOverlay>
                    </div>
                )
            }else{
                return (
                    <div ref={this.ref}
                         className={`ui-menuitem ${selectedClass}`}
                         onMouseEnter={this.sendSelectSignal}
                         onMouseDown={this.showOverlay}>
                        <Label {...propsWithIcon} />
                        <Icon name={`chevron-right`} size={8} />
                    </div>
                )
            }
        }else{
            return (
                <div ref={this.ref}
                     className={`ui-menuitem ${selectedClass}`}
                     onMouseEnter={this.sendSelectSignal}
                     onMouseDown={this.mouseActivate}>
                    <Label {...propsWithIcon} />
                </div>
            )
        }
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

    sendSelectSignal(){
        if(this.props.onSelectSignal) {
            this.props.onSelectSignal();
        }
    }
}