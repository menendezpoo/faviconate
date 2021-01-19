import {FileError, InvalidImageError, MemoryError} from "./errors";
import {makeSz, scaleToContain, Size} from "../hui/helpers/Rectangle";
import {Icon} from "./Icon";

const REDUCE_MARGIN = 256;

export class ImageService{

    static fromFile(file: Blob): Promise<HTMLImageElement>{
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

    static resize(image: HTMLImageElement, size: Size): Uint8ClampedArray{

        const mustReduce = image.width > REDUCE_MARGIN || image.height > REDUCE_MARGIN;
        const reducedSize = mustReduce ? scaleToContain(makeSz(REDUCE_MARGIN, REDUCE_MARGIN), size) : size;
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const cx = canvas.getContext('2d');

        if (!cx){
            throw new MemoryError();
        }

        canvas.width = reducedSize.width;
        canvas.height = reducedSize.height;
        cx.drawImage(image, 0, 0, reducedSize.width, reducedSize.height);

        const imageData = cx.getImageData(0,0, reducedSize.width, reducedSize.height);

        if (size.width < REDUCE_MARGIN || size.height < REDUCE_MARGIN){
            return this.resample(imageData, size);
        }else{
            return imageData.data;
        }

    }

    static resample(image: ImageData, size: Size): Uint8ClampedArray{
        const srcW = image.width;
        const srcH = image.height;
        const destW = Math.round(size.width);
        const destH = Math.round(size.height);
        let data = image.data;
        let data2 = new Uint8ClampedArray(size.width * size.height * 4);
        let ratio_w = srcW / destW;
        let ratio_h = srcH / destH;
        let ratio_w_half = Math.ceil(ratio_w/2);
        let ratio_h_half = Math.ceil(ratio_h/2);

        for(let j = 0; j < destH; j++){
            for(let i = 0; i < destW; i++){
                let x2 = (i + j*destW) * 4;
                let weight = 0;
                let weights = 0;
                let weights_alpha = 0;
                let gx_r = 0, gx_g = 0, gx_b = 0, gx_a = 0;
                let center_y = (j + 0.5) * ratio_h;
                for(let yy = Math.floor(j * ratio_h); yy < (j + 1) * ratio_h; yy++){
                    let dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                    let center_x = (i + 0.5) * ratio_w;
                    let w0 = dy*dy; //pre-calc part of w
                    for(let xx = Math.floor(i * ratio_w); xx < (i + 1) * ratio_w; xx++){
                        let dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                        let w = Math.sqrt(w0 + dx*dx);
                        if(w >= -1 && w <= 1){
                            //hermite filter
                            weight = 2 * w*w*w - 3*w*w + 1;
                            if(weight > 0){
                                dx = 4*(xx + yy*srcW);
                                //alpha
                                gx_a += weight * data[dx + 3];
                                weights_alpha += weight;
                                //colors
                                if(data[dx + 3] < 255)
                                    weight = weight * data[dx + 3] / 250;
                                gx_r += weight * data[dx];
                                gx_g += weight * data[dx + 1];
                                gx_b += weight * data[dx + 2];
                                weights += weight;
                            }
                        }
                    }
                }
                data2[x2]     = gx_r / weights;
                data2[x2 + 1] = gx_g / weights;
                data2[x2 + 2] = gx_b / weights;
                data2[x2 + 3] = gx_a / weights_alpha;
            }
        }
        return data2;
    }

}