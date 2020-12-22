/**
 * Keeps a stack for globally reacting to keys, like Escape and Enter.
 */
import {Callable} from "./hui";

export class
FocusStackHandler{

    private static idReminder = 1;

    static dismiss = new FocusStackHandler('Escape');

    static commit = new FocusStackHandler('Enter');

    private stack: {id: number, call: Callable}[] = [];

    private constructor(key: string){

        window.addEventListener('keydown', e => {
            if(e.key === key) {
                if(this.stack.length > 0) {
                    e.stopImmediatePropagation();
                    this.popAndExecute();
                }
            }
        });
    }

    isIdRegistered(id: number): boolean{
        return this.stack.filter(m => m.id === id).length > 0;
    }

    register(call: Callable): number{

        const id = FocusStackHandler.idReminder++;

        this.stack.push({id, call});

        return id;

    }

    popAndExecute(){
        const entry = this.stack.pop();

        if(entry){
            entry.call();
            this.unregister(entry.id);
        }
    }

    unregister(id: number){
        this.stack = this.stack.filter(m => m.id != id);
    }

}