export type KeyCaptureEvent = (e: KeyboardEvent) => void;

export class KeyCaptureStackHandler{
    private static idReminder = 1;

    static instance = new KeyCaptureStackHandler();

    private stack: {id: number, call: KeyCaptureEvent}[] = [];

    private constructor(){
        window.addEventListener('keydown', e => {
            if(this.stack.length > 0) {
                this.execute(e);
            }
        }, true);
    }

    isIdRegistered(id: number): boolean{
        return this.stack.filter(m => m.id === id).length > 0;
    }

    register(call: KeyCaptureEvent): number{

        const id = KeyCaptureStackHandler.idReminder++;

        this.stack.push({id, call});

        return id;

    }

    private execute(e: KeyboardEvent){
        if(this.stack.length > 0) {
            const entry = this.stack[this.stack.length - 1];
            entry.call(e);
        }
    }

    unregister(id: number){
        this.stack = this.stack.filter(m => m.id != id);
    }
}