import {Icon, IconColorModel} from "./Icon";

export class IconService{

    static newIcon(width: number, height: number, model: IconColorModel = 'rgba'): Icon{
        const icon = {
            width, height, model, data: new Uint8ClampedArray(width * height * 4)
        };

        return icon;
    }

}