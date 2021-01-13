
export type IconColorModel = 'rgb' | 'rgba' | 'palette';

export interface Icon{
    width: number;
    height: number;
    model: IconColorModel;
    data: Uint8ClampedArray;
}