import {Icon, IconColorModel} from "./Icon";
import {makePt, makeSz, Point, Rectangle, scaleToContain, Size} from "../hui/helpers/Rectangle";
import {Color} from "../hui/helpers/Color";
import {InvalidImageError, InvalidRegionError, MemoryError} from "./errors";
import {ImageService} from "./ImageService";

export class IconService{

    static clone(icon: Icon): Icon{
        return {...icon, data: new Uint8ClampedArray(icon.data)};
    }

    static fromCanvas(canvas: HTMLCanvasElement, cx: CanvasRenderingContext2D | null = null): Icon{

        if (!cx){
            cx = canvas.getContext('2d');
        }

        if (!cx) {
            throw new MemoryError();
        }

        const model: IconColorModel = 'rgba';
        const width = canvas.width;
        const height = canvas.height;
        const imageData = cx.getImageData(0,0,width, height);
        const data = imageData.data;

        return {width, height, model, data};
    }

    static fromIcon(icon: Icon, region: Rectangle): Icon{

        const data = new Uint8ClampedArray(region.width * region.height * 4);

        this.region32(icon, region, (index, current) => {
            data[current] = icon.data[index];
            data[current + 1] = icon.data[index + 1];
            data[current + 2] = icon.data[index + 2];
            data[current + 3] = icon.data[index + 3];
        });

        return {
            width: region.width,
            height: region.height,
            data,
            model: `rgba`
        }
    }

    static fromImage(image: HTMLImageElement, newSize: Size): Icon{

        const canvas: HTMLCanvasElement = document.createElement('canvas');
        const model: IconColorModel = 'rgba';
        const width = newSize.width;
        const height = newSize.height;
        const cx = canvas.getContext('2d');

        if (!cx){
            throw new MemoryError();
        }

        canvas.width = width;
        canvas.height = height;
        cx.drawImage(image, 0, 0, width, height);

        const data = cx.getImageData(0,0, width, height).data;

        return {width, height, model, data};

    }

    static async fromFile(file: File, contain?: Size): Promise<Icon>{

        const image = await ImageService.fromFile(file);
        let width = image.width;
        let height = image.height;

        if (contain){
            const contained = scaleToContain(contain, makeSz(width, height));
            width = Math.round(contained.width);
            height = Math.round(contained.height);
        }

        return this.fromImage(image, makeSz(width, height));

    }

    static newIcon(width: number, height: number, model: IconColorModel = 'rgba'): Icon{
        const icon = {
            width, height, model, data: new Uint8ClampedArray(width * height * 4)
        };

        return icon;
    }

    static newIconWithBg(width: number, height: number, color: Color): Icon{
        const model: IconColorModel = 'rgba';
        const icon = {
            width, height, model, data: new Uint8ClampedArray(width * height * 4)
        };

        for (let i = 0; i < icon.data.length; i += 4){
            icon.data[i] = color.r;
            icon.data[i + 1] = color.g;
            icon.data[i + 2] = color.b;
            icon.data[i + 3] = color.a * 255;
        }

        return icon;
    }

    static pixelToData(pixel: Point, icon: Icon): number{
        return icon.width * 4 * pixel.y + pixel.x * 4;
    }

    static region32(icon: Icon, region: Rectangle, onPixel: (regionIndex: number, iconIndex: number) => void){
        let current = 0;
        for(let y = region.top; y < region.bottom; y++){
            for(let x = region.left; x < region.right; x++){
                const index = IconService.pixelToData(makePt(x,y), icon);
                onPixel(index, current);
                current += 4;
            }
        }
    }

    static blend(base: Icon, sprite: Icon, region: Rectangle, spriteOffset? : Point): Icon {

        if (region.width > sprite.width || region.height > sprite.height){
            throw new InvalidRegionError();
        }

        if (!spriteOffset){
            spriteOffset = makePt(0, 0)
        }

        const buffer = this.clone(base);
        const sourceOver = (s: number, d: number, sA: number) => d + s * (255 - sA);
        const blend = sourceOver;

        for (let y = 0; y < region.height; y++){
            for(let x = 0; x < region.width; x++){
                const baseIndex = this.pixelToData(makePt(region.left + x, region.top + y), base);
                const spriteIndex = this.pixelToData(makePt(x + spriteOffset.x, y + spriteOffset.y), sprite);
                const baseR = buffer.data[baseIndex];
                const baseG = buffer.data[baseIndex + 1];
                const baseB = buffer.data[baseIndex + 2];
                const baseA = buffer.data[baseIndex + 3];
                const spR = sprite.data[spriteIndex];
                const spG = sprite.data[spriteIndex + 1];
                const spB = sprite.data[spriteIndex + 2];
                const spA = sprite.data[spriteIndex + 3];

                buffer.data[baseIndex] = blend(baseR, spR, spA);
                buffer.data[baseIndex + 1] = blend(baseG, spG, spA);
                buffer.data[baseIndex + 2] = blend(baseB, spB, spA);
                buffer.data[baseIndex + 3] = Math.max(baseA, spA);
            }
        }

        return buffer;
    }
}