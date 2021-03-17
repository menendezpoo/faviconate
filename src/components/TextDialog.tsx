import * as React from 'react';
import {Button} from "../hui/items/Button";

export interface TextDialogProps{

}

interface TextDialogState{}

export class TextDialog extends React.Component<TextDialogProps, TextDialogState>{

    constructor(props: TextDialogProps){
        super(props);
    }

    render() {
        return (
            <div className="modal dialog">
                <div className="title">Title</div>
                <div className="description">Title</div>
                <textarea></textarea>
                <div className="items">
                    <Button text={`Cancel`}/>
                    <Button text={`Ok`}/>
                </div>
            </div>
        );
    };
}