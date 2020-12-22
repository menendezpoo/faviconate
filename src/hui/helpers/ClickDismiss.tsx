import {Callable} from "./hui";

export class ClickDismiss{

    static mouseup = new ClickDismiss('mouseup');

    private static idReminder = 1;

    private stack: {id: number, call: Callable}[] = [];

    private preventNext = false;

    private constructor(eventName: string){
        window.addEventListener(eventName, e => {
            if(this.preventNext) {
                this.preventNext = false;
                return;
            }else{
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

        const id = ClickDismiss.idReminder++;

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

    preventNextEvent(){
        this.preventNext = true;
    }

    unregister(id: number){
        this.stack = this.stack.filter(m => m.id != id);
        this.preventNext = false;
    }

}