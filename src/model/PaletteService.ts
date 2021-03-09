import {uuid} from "../hui/helpers/Uuid";

const VER = "1";

export interface PaletteColor{
    name: string;
    hex: string;
}

export interface Palette{
    version?:string;
    id?: string;
    name: string;
    native?: boolean;
    unsaved?: boolean;
    unnamed?: boolean;
    colors: PaletteColor[];
}

const PALETTES_STORAGE_KEY = 'palettes-v1';

function validateVersion(arr: any[]): Palette[]{
    const r: Palette[] = [];

    for(const obj of arr){
        if (obj.version === VER){
            r.push(obj as Palette);
        }
    }

    return r;
}

export class PaletteService{

    static async getAll(): Promise<Palette[]>{
        try{
            const value = String(window.localStorage.getItem(PALETTES_STORAGE_KEY));

            if (value){
                const obj = JSON.parse(value);

                if(!obj){
                    return [];

                }else if(!(obj instanceof Array)){
                    return Promise.reject(new Error());
                }else{
                    return validateVersion(obj);
                }

            }else{
                return [];
            }

        }catch(e){
            return Promise.reject(e);
        }
    }

    static async upsert(palette: Palette): Promise<Palette>{

        if (!palette.id){
            palette.id = uuid();
        }

        palette = {...palette, unsaved: false, version: VER};

        const all = await this.getAll();
        const index = all.findIndex(p => p.id === palette.id);

        if (index >= 0 ){
            all[index] = palette;
        }else{
            all.push(palette);
        }

        try{
            window.localStorage.setItem(PALETTES_STORAGE_KEY, JSON.stringify(all));
            return palette;
        }catch(e){
            return Promise.reject(e);
        }

    }

}