import {makeSz, Size} from "../hui/helpers/Rectangle";

export type IconColorModel = 'rgb' | 'rgba' | 'palette';

export interface Icon{
    width: number;
    height: number;
    model: IconColorModel;
    data: Uint8ClampedArray;
}

export function iconSz(icon: Icon): Size{
    return makeSz(icon.width, icon.height);
}