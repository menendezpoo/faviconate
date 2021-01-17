import {Icon, IconColorModel} from "./Icon";
import {makePt, Point, Rectangle} from "../hui/helpers/Rectangle";

export class InvalidRegionError extends Error{}

export class IconService{

    static clone(icon: Icon): Icon{
        return {...icon, data: new Uint8ClampedArray(icon.data)};
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

    static newIcon(width: number, height: number, model: IconColorModel = 'rgba'): Icon{
        const icon = {
            width, height, model, data: new Uint8ClampedArray(width * height * 4)
        };

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

    static blend(base: Icon, sprite: Icon, region: Rectangle): Icon {

        if (region.width > sprite.width || region.height > sprite.height){
            throw new InvalidRegionError();
        }

        const buffer = this.clone(base);
        const sourceOver = (s: number, d: number, sA: number) => d + s * (255 - sA);
        const blend = sourceOver;

        this.region32(base, region, (regionIndex, iconIndex) => {
            const a = sprite.data[iconIndex + 3];
            buffer.data[regionIndex] = blend(buffer.data[regionIndex], sprite.data[iconIndex], a);
            buffer.data[regionIndex + 1] = blend(buffer.data[regionIndex + 1], sprite.data[iconIndex + 1], a);
            buffer.data[regionIndex + 2] = blend(buffer.data[regionIndex + 2], sprite.data[iconIndex + 2], a);
            buffer.data[regionIndex + 3] = Math.max(a, buffer.data[regionIndex + 3]);
        });

        return buffer;
    }
}