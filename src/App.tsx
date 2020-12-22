import * as React from "react";
import {ToolbarView} from "./hui/layout/ToolbarView";
import {Button} from "./hui/items/Button";
import {Separator} from "./hui/items/Separator";
import {DockView} from "./hui/layout/DockView";

export class App extends React.Component{

    render() {

        const mainItems = <>
            <Button text={`Faviconate`}/>
            <Separator/>
            <Button text={`Cut`}/>
            <Button text={`Copy`}/>
            <Button text={`Paste`}/>
        </>;

        const sideBar = <>
            <Button text={`Button 1`}/>
            <Button text={`Button 2`}/>
            <Button text={`Button 3`}/>
        </>;

        return (
            <ToolbarView items={mainItems}>
                <DockView side={`right`} sideView={sideBar}>
                    <span>Place Grid Here</span>
                </DockView>
            </ToolbarView>
        );
    }

}