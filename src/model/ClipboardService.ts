
const MIME_PNG = "image/png";

export class ClipboardService {

    static async copyBlob(blob: Blob, mime: string): Promise<void> {

        const ctorName = 'ClipboardItem';

        if (ctorName in window){
            const ctor: any = (window as any)[ctorName]; // Workaround: currently not in TS library.
            const item = new ctor({[mime]: blob});
            const data = [item];

            try{
                await (navigator.clipboard as any).write(data);
            }catch(e){
                return Promise.reject(`Error writing data to clipboard`);
            }

        }else{
            return Promise.reject(`No compatibility for clipboard copying`);
        }

    }

    static async pasteBlob(): Promise<Blob> {
        const data: any | undefined = await (navigator.clipboard as any).read();
        let warnings: string[] = [];

        if (data && data.length > 0){

            for(let i = 0; i < data.length; i++){

                const item = data[i];
                const types: string[] = data[i].types;

                if (types.indexOf(MIME_PNG) >= 0){
                    const blob: Blob = await item.getType(MIME_PNG);

                    if (blob){
                        return blob;
                    }else{
                        warnings.push(`Can't read ${item.type} from clipboard`);
                    }

                    break;
                }else{
                    warnings.push(`Unsupported MIME: ${item.type}`);
                }
            }
        }else{
            warnings.push(`No data items to paste`);
        }

        return Promise.reject(warnings);
    }
}