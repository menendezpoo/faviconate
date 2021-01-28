
export function darkModeOn(): boolean | undefined {
    if (window.matchMedia){
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}