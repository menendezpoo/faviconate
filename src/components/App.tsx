import * as React from "react";
import {ToolbarView} from "../hui/layout/ToolbarView";
import {Button} from "../hui/items/Button";
import {Separator} from "../hui/items/Separator";
import {DockView} from "../hui/layout/DockView";
import {PixelView} from "./PixelView";

export class App extends React.Component{

    render() {

        const mainToolbarItems = <>
            <Button text={`Faviconate`}/>
            <Separator/>
            <Button text={`Cut`}/>
            <Button text={`Copy`}/>
            <Button text={`Paste`}/>
        </>;

        const toolToolbarItems = <>
            <Button text={`A`}/>
            <Button text={`B`}/>
            <Button text={`C`}/>
        </>;

        const sideBar = <>
            <Button text={`Button 1`}/>
            <Button text={`Button 2`}/>
            <Button text={`Button 3`}/>
        </>;

        return (
            <ToolbarView items={mainToolbarItems}>
                <DockView side={`right`} sideView={sideBar}>
                    <ToolbarView side={`left`} items={toolToolbarItems}>
                        <PixelView />
                    </ToolbarView>
                </DockView>
            </ToolbarView>
        );
    }

}