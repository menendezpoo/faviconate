import {Callable} from "./hui";

export class EventHandler{

    private readonly handlers: (Callable | null)[] = [];

    add(f: Callable | null){
        this.handlers.push(f);
    }

    raise(){
        for(let handler of this.handlers){
            if(handler !== null){
                handler();
            }
        }
    }

}