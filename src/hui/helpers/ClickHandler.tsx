/**
 * Makes an element clickable, optionally focusable and keyboard-click enabled as well.
 * It also introduces the concept of enabled/disabled. If the element of any of its parents is tagged
 * with the class `disabled` then the click will be ignored.
 */
import {EventHandler} from "./EventHandler";
import {Callable} from "./hui";

export class ClickHandler{

    static of(e: HTMLElement, handler: Callable ): ClickHandler{
        const h = new ClickHandler(e);
        h.click.add(handler);
        return h;
    }

    static soft(e: HTMLElement, handler: Callable ): ClickHandler{
        const h = new ClickHandler(e, true);
        h.click.add(handler);
        return h;
    }

    static wire(e: HTMLElement, event: EventHandler): ClickHandler{
        return ClickHandler.of(e, () => event.raise());
    }

    readonly click = new EventHandler();

    private constructor (public readonly element: HTMLElement, soft: boolean = false){

        if(!soft){
            element.tabIndex = 0;
        }

        element.addEventListener('click', () => {
            if(this.isEnabled) {
                this.click.raise();
            }
        });

        element.addEventListener('keydown', e => {
            if(e.key == 'Enter' || e.key == ' ') {
                if(this.isEnabled) {
                    e.stopImmediatePropagation();
                    this.click.raise();
                }
            }

        }, true);
    }

    get isEnabled(): boolean{

        if(this.element.classList.contains('disabled')) {
            return false;
        }

        const list: HTMLElement[] = [];
        let parent = this.element.parentElement;

        while (parent){

            list.unshift(parent);

            if(parent.parentElement instanceof HTMLElement) {
                parent = parent.parentElement;
            }else{
                parent = null;
            }
        }

        for(let e of list){
            if(e.classList.contains('disabled')) {
                return false;
            }
        }

        return true;
    }

}