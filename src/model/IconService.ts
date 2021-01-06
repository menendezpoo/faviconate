import {Icon, IconColorModel} from "./Icon";

export class IconService{

    static newIcon(width: number, height: number, model: IconColorModel = 'rgba'): Icon{
        const icon = {
            width, height, model, data: new Uint8Array(width * height * 4)
        };

        return icon;
    }

}