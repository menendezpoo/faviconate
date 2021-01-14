
interface EditorTransaction<T>{
    documentState: T;
}

export class NoDocumentError extends Error{}
export class NoTransactionError extends Error{}
export class TransactionInProgressError extends Error{}
export class UnsavedChangesError extends Error{}

export class Editor<T>{

    private _currentTransaction: EditorTransaction<T> | null = null;
    private _document: T | null = null;
    private _hasChanges: boolean = false;

    private readonly undoStack: EditorTransaction<T>[] = [];
    private readonly redoStack: EditorTransaction<T>[] = [];

    public documentChanged: (() => void) | null = null;
    public documentSubmitted: (() => void) | null = null;

    redo(): boolean{

        if (this.redoStack.length == 0){
            return false;
        }

        const top = this.redoStack.pop();

        if (top){
            this.undoStack.push({documentState: this.document!});
            this._document = top.documentState;

            if (this.documentSubmitted){
                this.documentSubmitted();
            }
        }

        return true;

    }

    undo(): boolean{

        if (this.undoStack.length == 0){
            return false;
        }

        const top = this.undoStack.pop();

        if (top){
            this.redoStack.push({documentState: this.document!});
            this._document = top.documentState;

            if (this.documentSubmitted){
                this.documentSubmitted();
            }
        }

        return true;
    }

    begin(){

        if (!this._document){
            throw new NoDocumentError();
        }

        if (this._currentTransaction){
            throw new TransactionInProgressError();
        }else{
            this._currentTransaction = {documentState: this._document};
        }
    }

    setDocument(document: T){
        if (this._currentTransaction){
            this._document = document;

            if (this.documentChanged){
                this.documentChanged();
            }

        }else{
            throw new NoTransactionError();
        }

    }

    commit(){

        if (!this._currentTransaction){
            throw new NoTransactionError();
        }

        // Push to undo stack
        this.undoStack.push(this._currentTransaction);

        // Clear transaction
        this._currentTransaction = null;

        // Empty redo stack
        while(this.redoStack.length > 0) {this.redoStack.pop()}

        // We have changes
        this._hasChanges = true;

        if (this.documentSubmitted){
            this.documentSubmitted();
        }
    }

    rollback(){

        if (this._currentTransaction){
            this._document = this._currentTransaction.documentState;
            this._currentTransaction = null;

            if (this.documentSubmitted){
                this.documentSubmitted();
            }

        }else{
            throw new NoTransactionError();
        }

    }

    open(document: T){

        if (this._currentTransaction){
            throw new TransactionInProgressError();
        }

        if (this._hasChanges){
            throw new UnsavedChangesError();
        }

        this._document = document;
    }

    close(){
        if (this._currentTransaction){
            throw new TransactionInProgressError();
        }

        if (this.hasChanges){
            throw new UnsavedChangesError();
        }

        this._document = null;
        this._hasChanges = false;

        // Empty stacks
        while(this.redoStack.length > 0){this.redoStack.pop()}
        while(this.undoStack.length > 0){this.redoStack.pop()}

    }

    clearChanges(){
        this._hasChanges = false;
    }

    get currentTransaction(): EditorTransaction<T> | null{
        return this._currentTransaction;
    }

    get document(): T | null {
        return this._document;
    }

    get hasChanges(): boolean{
        return this._hasChanges;
    }

    get redoCount(): number{
        return this.redoStack.length;
    }

    get undoCount(): number{
        return this.undoStack.length;
    }

}