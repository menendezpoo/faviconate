import {Book} from "./Book";
import {IconCanvasController} from "./IconCanvasController";
import {IconPreview} from "../components/BookPreviews";
import {makeSz, Size} from "../hui/helpers/Rectangle";
import {IconService} from "./IconService";
import {Icon} from "./Icon";
import {DocumentService} from "./DocumentService";

const DEFAULT_ICON = makeSz(32, 32);

function changeFavicon(src: string) {
    const id = 'dyna-favicon';

    const oldLink = document.getElementById(id);
    if (oldLink) { document.head.removeChild(oldLink) }

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'shortcut icon';
    link.href = src;
    document.head.appendChild(link);
}

export class BookController{

    private controllers: IconCanvasController[] = [];
    private previews: IconPreview[] = [];

    onUpdated: (m?:string) => void = () => void(0);

    constructor(private readonly book: Book) {

        book.icons.forEach(icon => this.createIconController(icon));

        if (book.icons.length > 0){
            this.updatePreviews().then(() => this.onUpdated('init load'));
        }
    }

    private createIconController(icon: Icon): IconCanvasController{

        const controller = new IconCanvasController({icon});

        const docChanged = () => {
            this.updatePreview(controller.id).then(() => this.onUpdated());
        }

        controller.editor.documentSubmitted = () => {
            docChanged();
            this.persist();
        };

        controller.editor.documentChanged = () => docChanged();

        this.controllers.push(controller);

        return controller;
    }

    private async updatePreview(id: string){

        const controller = this.getIconController(id);

        if (controller){

            const data = await IconService.asBlobUrl(controller.editor.document.icon);
            const preview = this.getPreview(id);

            if (preview){
                preview.data = data;
            }else{
                this.previews.push({id, data});
            }
        }
    }

    getBook(): Book{
        return {...this.book, icons: this.controllers.map(c => c.editor.document.icon)};
    }

    getIconController(id: string): IconCanvasController | null{
        return this.controllers.find(c => c.id === id) || null;
    }

    getPreview(id: string): IconPreview | null{
        return this.previews.find(p => p.id === id) || null;
    }

    addIcon(size: Size, skipUpdate = false): IconCanvasController{
        const icon = IconService.newIcon(size.width, size.height);
        const controller = this.createIconController(icon);

        this.updatePreview(controller.id)
            .then(() => {
                if (!skipUpdate){
                    this.onUpdated('addIcon');
                }
            });

        this.persist();

        return controller;
    }

    addIcons(icons: Icon[], skipUpdate = false): IconCanvasController[]{
        const controllers: IconCanvasController[] = [];

        for(const icon of icons){
            controllers.push(this.createIconController(icon));
        }

        this.updatePreviews().then(() => {
            if (!skipUpdate){
                this.onUpdated('addIcons');
            }
        });

        this.persist();

        return controllers;
    }

    async importIcoFile(icoFile: Blob): Promise<IconCanvasController[]>{
        const dir = await IconService.fromIcoBlob(icoFile);
        return this.addIcons(dir.icons);
    }

    persist(){
        DocumentService.saveIcons(this.controllers.map(c => c.editor.document.icon))
            .then(() => console.log('Saved'))
            .catch(() => console.log('Error saving'));
    }

    removeIcon(id: string, skipUpdate = false): IconCanvasController | undefined{

        let ctl: IconCanvasController | undefined;

        // remove from controllers
        this.controllers = this.controllers.filter(c => c.id !== id);

        // remove from previews
        this.previews = this.previews.filter(p => p.id !== id);

        // remove from book
        this.book.icons = this.controllers.map(c => c.editor.document.icon);

        if (this.controllers.length === 0){
            ctl = this.addIcon(DEFAULT_ICON, false);
        }

        if (!skipUpdate){
            this.onUpdated('removeIcon');
        }

        this.persist();

        return ctl;
    }

    async updatePreviews(){
        return await Promise.all(this.controllers.map(c => this.updatePreview(c.id)));
    }

    get iconControllers(): IconCanvasController[]{
        return this.controllers;
    }

    get iconPreviews(): IconPreview[]{
        return this.previews;
    }

}