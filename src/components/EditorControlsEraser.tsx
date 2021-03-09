import * as React from 'react';

export interface EditorControlsEraserProps{

}

interface EditorControlsEraserState{}

export class EditorControlsEraser extends React.Component<EditorControlsEraserProps, EditorControlsEraserState>{

    constructor(props: EditorControlsEraserProps){
        super(props);
    }

    render() {
        return (
            <div>Eraser</div>
        );
    };
}