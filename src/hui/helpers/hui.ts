export interface Focusable{
    avoidFocus?: boolean;
}
export interface Disable{
    disabled?: boolean;
}

export interface ClassNames{
    classNames?: string;
}

// Behaves like classnames npm module
export function cn(...args: any[]): string{
    const result: string[] = [];

    for(const thing of args){
        if (typeof thing === "object"){
            for(const prop in thing){
                const value = thing[prop];
                if (!!value){
                    result.push(prop);
                }
            }
        }else if(!!thing){
            result.push(String(thing));
        }
    }

    return result.join(' ');
}

export type Callable = () => void;