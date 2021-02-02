import * as React from "react";
import {ClickableProps} from "./Clickable";
import {Label, LabelProps} from "./Label";
import {Icon} from "./Icon";
import {KeyboardEvent, RefObject} from "react";
import {MenuOverlay} from "../overlays/MenuOverlay";
import {Callable, Disable} from "../helpers/hui";
import {FocusStackHandler} from "../helpers/FocusStackHandler";
import {ClickDismiss} from "../helpers/ClickDismiss";
import {Rectangle} from "../helpers/Rectangle";

export interface ButtonProps extends ClickableProps, LabelProps, Disable{
    children?: React.ReactNode;
    split?: boolean;
    face?: "hover" | "always" | "never";
    selected?: boolean;
    useChevron?: boolean;
}

export interface ButtonState {
    dropDownVisible?: boolean;
}

export class Button extends React.Component<ButtonProps, ButtonState>{

    buttonRef: RefObject<HTMLDivElement>;

    private escapeKeyDismissId = 0;
    private clickDismissId = 0;

    constructor(props: ButtonProps){
        super(props);
        this.buttonRef = React.createRef();
        this.state = {};
        this.activate = this.activate.bind(this);
        this.showDropDown = this.showDropDown.bind(this);
        this.hideDropDown = this.hideDropDown.bind(this);
        this.keyDownHide = this.keyDownHide.bind(this);
        this.keyDownShow = this.keyDownShow.bind(this);
        this.keyDownActivate = this.keyDownActivate.bind(this);
    }

    activate(){
        if(this.props.disabled !== true && this.props.onClick) {
            this.props.onClick();
        }
    }

    keyPass(e: KeyboardEvent<HTMLDivElement>, call: Callable){
        if(e.key === 'Enter' || e.key === ' ') {
            if(!this.props.disabled) {
                e.stopPropagation();
                e.preventDefault();
                call();
            }
        }
    }

    keyDownHide(e: KeyboardEvent<HTMLDivElement>){
        this.keyPass(e, () => this.hideDropDown());
    }

    keyDownShow(e: KeyboardEvent<HTMLDivElement>){
        if(this.props.disabled) {
            return;
        }
        this.keyPass(e, () => this.showDropDown());
    }

    keyDownActivate(e: KeyboardEvent<HTMLDivElement>){
        this.keyPass(e, () => this.activate());
    }

    hideDropDown(){
        this.setState({dropDownVisible: false});

        // Unregister for ESC key
        FocusStackHandler.dismiss.unregister(this.escapeKeyDismissId);

        // Unregister from body click
        ClickDismiss.mouseup.unregister(this.clickDismissId);
    }

    showDropDown(){
        this.setState({dropDownVisible: true});

        // Register for hiding when ESC key is pressed
        this.escapeKeyDismissId = FocusStackHandler.dismiss.register(() => { this.hideDropDown(); });

        // Register for hiding when body is clicked
        this.clickDismissId = ClickDismiss.mouseup.register(() => this.hideDropDown());
    }

    render(){
        const rect = Rectangle.fromDOMRect(this.buttonRef.current?.getBoundingClientRect() || new DOMRect());
        const chevron = () => this.props.useChevron ? <Icon name={"chevron-down"} size={8}/> : undefined;
        const label = () => <Label {...this.props} />;
        const menu = () => (
            <MenuOverlay
                top={rect.top + rect.height}
                left={rect.left}
                refRect={rect}
                onDismissSignal={this.hideDropDown}>
                {this.props.children}
            </MenuOverlay>
        );

        const tags = [
                `face-${this.props.face || 'hover'}`,
                 this.props.classNames,
                 this.props.disabled ? 'disabled' : null,
                 this.props.selected ? 'selected' : null,
            ]
            .filter(a => !!a)
            .join(` `);

        const tabProp = this.props.disabled ? {} : {tabIndex: 0};

        if(this.props.children) {
            if(this.props.split) {
                if(this.state.dropDownVisible) {
                    return (
                        <div className={`ui-button-wrap split`}>
                            <div {...tabProp}
                                 ref={this.buttonRef}
                                 className={`ui-clickable ui-button is-open ${tags}`}
                                 onClick={this.activate}>
                                {label()}
                            </div>
                            <div {...tabProp}
                                 className={`ui-clickable ui-button split-part`}
                                 onClick={this.showDropDown}
                                 onKeyDown={this.keyDownShow}>
                                {chevron()}
                                {menu()}
                            </div>
                        </div>
                    )
                }else{
                    return (
                        <div className={`ui-button-wrap split ${tags}`}>
                            <div {...tabProp}
                                 ref={this.buttonRef}
                                 className={"ui-clickable ui-button"}
                                 onKeyDown={this.keyDownActivate}
                                 onClick={this.activate}>
                                {label()}
                            </div>
                            <div {...tabProp}
                                 className={`ui-clickable ui-button split-part`}
                                 onClick={this.showDropDown}
                                 onKeyDown={this.keyDownShow}>
                                {chevron()}
                            </div>
                        </div>
                    )
                }

            }else if(this.state.dropDownVisible) {
                return (
                    <div className={`ui-button-wrap`}>
                        <div {...tabProp}
                             ref={this.buttonRef}
                             className={`ui-clickable ui-button is-open ${tags}`}
                             onKeyDown={this.keyDownHide}
                             onClick={this.showDropDown}>
                            {label()}
                            {chevron()}
                        </div>
                        {menu()}
                    </div>
                )
            }else{
                return (
                    <div className={`ui-button-wrap`}>
                        <div {...tabProp}
                             ref={this.buttonRef}
                             className={`ui-clickable ui-button ${tags}`}
                             onClick={this.showDropDown}
                             onKeyDown={this.keyDownShow}>
                            {label()}
                            {chevron()}
                        </div>
                    </div>
                )
            }
        }else{
            return (
                <div {...tabProp}
                     ref={this.buttonRef}
                     className={`ui-clickable ui-button ${tags}`}
                     onClick={this.activate}
                     onKeyDown={this.keyDownActivate}>
                    {label()}
                </div>
            )
        }
    }
}