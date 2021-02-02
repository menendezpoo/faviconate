import {Color} from "../hui/helpers/Color";
import {uuid} from "../hui/helpers/Uuid";

export interface Palette{
    id?: string;
    name: string;
    native?: boolean;
    unsaved?: boolean;
    unnamed?: boolean;
    colors: [number, number, number, number][];
}

const PALETTES_STORAGE_KEY = 'palettes-v1';

export class PaletteService{

    static async getAll(): Promise<Palette[]>{
        try{
            const value = String(window.localStorage.getItem(PALETTES_STORAGE_KEY));

            if (value){
                const obj = JSON.parse(value);

                if(!obj){
                    console.log(`No palettes loaded`);
                    return [];

                }else if(!(obj instanceof Array)){
                    return Promise.reject(new Error());
                }else{
                    console.log(`Actual palettes loaded`);
                    return obj as Palette[];
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

        palette = {...palette, unsaved: false};

        const all = await this.getAll();
        const index = all.findIndex(p => p.id === palette.id);

        if (index >= 0 ){
            all[index] = palette;
        }else{
            all.push(palette);
        }

        try{
            window.localStorage.setItem(PALETTES_STORAGE_KEY, JSON.stringify(all));
            console.log(`Saved items loaded`);
            return palette;
        }catch(e){
            return Promise.reject(e);
        }

    }

}