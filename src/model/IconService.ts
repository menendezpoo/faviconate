import {Icon, IconColorModel} from "./Icon";
import {makePt, Point, Rectangle} from "../hui/helpers/Rectangle";

export class IconService{

    static pixelToData(pixel: Point, icon: Icon): number{
        return icon.width * 4 * pixel.y + pixel.x * 4;
    }

    static region32(icon: Icon, region: Rectangle, onPixel: (current: number, index: number) => void){
        let current = 0;
        for(let y = region.top; y < region.bottom; y++){
            for(let x = region.left; x < region.right; x++){
                const index = IconService.pixelToData(makePt(x,y), icon);
                onPixel(index, current);
                current += 4;
            }
        }
    }

    static newIcon(width: number, height: number, model: IconColorModel = 'rgba'): Icon{
        const icon = {
            width, height, model, data: new Uint8ClampedArray(width * height * 4)
        };

        return icon;
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

}