import {Icon, IconColorModel} from "./Icon";
import {Palette} from "./PaletteService";

const ICONS_STORAGE_KEY = 'icons-v1';

interface SerializedIcon{
    width: number;
    height: number;
    data: string;
    model: IconColorModel;
}

function binToString(bin: Uint8ClampedArray): string{
    let r = '';

    for(let i = 0; i < bin.length; i++){
        const ch = bin[i].toString(16);
        r += ch.length == 1 ? '0' + ch : ch;
    }

    return r;
}

function stringToBin(str: string): Uint8ClampedArray{
    const r = new Uint8ClampedArray(str.length / 2);

    for(let i = 0; i < r.length; i++){
        const nmb = str.charAt(i * 2) + str.charAt(i * 2 + 1);
        r[i] = parseInt(nmb, 16);
    }

    return r;
}

function serializeIcons(icons: Icon[]): SerializedIcon[]{
    return icons.map(icon => {
        return {
            ...icon,
            data: binToString(icon.data)
        }
    });
}

function deserializeIcons(icons: SerializedIcon[]): Icon[]{
    return icons.map(icon => { return {
            ...icon,
            data: stringToBin(icon.data)
    }});
}

export class DocumentService{

    static async saveIcons(icons: Icon[]){

        try{
            window.localStorage.setItem(ICONS_STORAGE_KEY, JSON.stringify(serializeIcons(icons)));
        }catch(e){
            return Promise.reject(e);
        }
    }

    static async restoreIcons(): Promise<Icon[]>{
        try{
            const value = String(window.localStorage.getItem(ICONS_STORAGE_KEY));

            if (value){
                const obj = JSON.parse(value);

                if(!obj){
                    return [];

                }else if(!(obj instanceof Array)){
                    return Promise.reject(new Error());
                }else{
                    return deserializeIcons(obj as SerializedIcon[]);
                }

            }else{
                return [];
            }

        }catch(e){
            return Promise.reject(e);
        }
    }

}