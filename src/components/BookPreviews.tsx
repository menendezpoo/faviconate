import * as React from "react";
import {compareSize, makeSz, Size} from "../hui/helpers/Rectangle";
import {PreviewPanel} from "./PreviewPanel";
import {IconCanvasController} from "../model/IconCanvasController";

export interface IconPreview{
    id: number;
    data: string;
}

export interface BookPreviewsProps{
    currentController: number;
    controllers: IconCanvasController[];
    previews: IconPreview[];
    onIconSelected?: (id: number) => void;
    onIconDelete?: (id: number) => void;
}

interface BookPreviewsState{}

export class BookPreviews extends React.Component<BookPreviewsProps, BookPreviewsState>{


    private handleSelected(id: number){
        if (this.props.onIconSelected){
            this.props.onIconSelected(id);
        }
    }

    private onIconDelete(id: number){
        if (this.props.onIconDelete){
            this.props.onIconDelete(id);
        }
    }

    render() {

        const {controllers, previews, currentController} = this.props;

        const sizeOf = (itemId: number): Size => {
            const ctl = controllers.find(c => c.id === itemId);

            if (ctl){
                return ctl.iconSize;
            }
            return makeSz(0,0);
        };

        const sortedPreviews = previews
            .sort((a, b) => -compareSize(sizeOf(a.id), sizeOf(b.id)));

        return (
            <>
                {sortedPreviews
                    .map((item) => (
                        <PreviewPanel
                            key={item.id}
                            data={item.data}
                            selected={item.id === currentController}
                            size={sizeOf(item.id)}
                            onActivate={() => this.handleSelected(item.id)}
                            onDelete={() => this.onIconDelete(item.id)}
                        />
                    ))}
            </>
        );
    }

}