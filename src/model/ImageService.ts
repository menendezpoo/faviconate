import {FileError, InvalidImageError, MemoryError} from "./errors";
import {Size} from "../hui/helpers/Rectangle";

export class ImageService{

    static fromFile(file: File): Promise<HTMLImageElement>{
        return new Promise<HTMLImageElement>((resolve, reject) => {

            const reader = new FileReader();

            reader.addEventListener('load', readEvent => {

                if (readEvent.target){
                    const img = new Image();

                    img.addEventListener('load', () => resolve(img));
                    img.addEventListener('error', () => reject(new InvalidImageError()));

                    img.src = readEvent.target.result as string;
                }else{
                    reject(new MemoryError());
                }

            });

            reader.addEventListener('error', () => reject(new FileError()));

            reader.readAsDataURL(file);

        });

    }

}