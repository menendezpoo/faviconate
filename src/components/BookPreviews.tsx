import * as React from "react";
import {compareSize, makeSz, Size} from "../hui/helpers/Rectangle";
import {PreviewPanel} from "./PreviewPanel";
import {IconCanvasController} from "../model/IconCanvasController";

export interface IconPreview{
    id: string;
    data: string;
}

export interface BookPreviewsProps{
    currentController: string;
    controllers: IconCanvasController[];
    previews: IconPreview[];
    onIconSelected?: (id: string) => void;
    onIconDelete?: (id: string) => void;
}

interface BookPreviewsState{}

export class BookPreviews extends React.Component<BookPreviewsProps, BookPreviewsState>{


    private handleSelected(id: string){
        if (this.props.onIconSelected){
            this.props.onIconSelected(id);
        }
    }

    private onIconDelete(id: string){
        if (this.props.onIconDelete){
            this.props.onIconDelete(id);
        }
    }

    render() {

        const {controllers, previews, currentController} = this.props;

        const sizeOf = (itemId: string): Size => {
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