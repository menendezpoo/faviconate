
const MIME_PNG = "image/png";

export class ClipboardEmptyError extends Error{}

export class ClipboardService {

    private static buffer: Blob | null;

    static async copyBlob(blob: Blob, mime: string): Promise<void> {

        try{
            await this.systemCopyBlob(blob, mime);
        }catch(e){
            this.buffer = blob;
        }

    }

    static async pasteBlob(): Promise<Blob> {
        try{
            return await this.systemPasteBlob();
        }catch(e){
            if (this.buffer){
                return this.buffer;
            }else{
                return Promise.reject(new ClipboardEmptyError());
            }
        }
    }

    static async systemCopyBlob(blob: Blob, mime: string): Promise<void> {

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

    static async systemPasteBlob(): Promise<Blob> {
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
            return Promise.reject(new ClipboardEmptyError());
        }

        return Promise.reject(warnings);
    }


}