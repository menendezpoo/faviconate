import {assert} from 'chai';
import {
    Editor,
    NoDocumentError,
    NoTransactionError,
    TransactionInProgressError,
    UnsavedChangesError
} from "../../src/model/Editor";
import {randomInt} from "../TestUtils";

describe(`model/Editor`, function (){

    it('should have a null document after init', function () {

        const editor = new Editor<number>();
        assert.isNull(editor.document);

    });

    it('should open a document', function () {

        const data = randomInt(1, 10);
        const editor = new Editor<number>();

        editor.open(data);

        assert.deepStrictEqual(editor.document, data);

    });

    it('should close a document', function () {

        const data = randomInt(0, 4);
        const editor = new Editor<number>();

        editor.open(data);
        editor.close();

        assert.isNull(editor.document);

    });

    it('should flag changes after changing a document', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);
        editor.commit();

        assert.isTrue(editor.hasChanges);

    });

    it('should clear changes voluntarily', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);
        editor.commit();
        editor.clearChanges();

        assert.isFalse(editor.hasChanges);

    });

    it('should not open a document if transaction in progress', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);

        assert.throws(() => editor.open(a), TransactionInProgressError);
    });

    it('should not open a document if unsaved changes', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);
        editor.commit();

        assert.throws(() => editor.open(a), UnsavedChangesError);

    });

    it('should not close a document if unsaved changes', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);
        editor.commit();

        assert.throws(() => editor.close(), UnsavedChangesError);

    });

    it('should change the document state', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);

        assert.strictEqual(editor.document, b);


    });

    it('should rollback a transaction', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);
        editor.rollback();

        assert.strictEqual(editor.document, a);

    });

    it('should reject transaction begin if no document', function () {

        const editor = new Editor<number>();

        assert.throws(() => editor.begin(), NoDocumentError);

    });

    it('should reject state change without transaction', function () {

        const a = randomInt(0, 4);
        const b = randomInt(5, 9);
        const editor = new Editor<number>();

        editor.open(a);

        assert.throws(() => editor.setDocument(b), NoTransactionError);

    });

    it('should reject beginTransaction if transaction in progress', function () {

        const editor = new Editor<number>();

        editor.open(randomInt(1, 9));
        editor.begin();

        assert.throws(() => editor.begin(), TransactionInProgressError);

    });

    it('should reject transactionCommit if no transaction in progress', function () {

        const editor = new Editor<number>();

        assert.throws(() => editor.commit(), NoTransactionError);

    });

    it('should reject transactionRollback if no transaction in progress', function () {

        const editor = new Editor<number>();

        assert.throws(() => editor.rollback(), NoTransactionError);

    });

    it('should accumulate undo counts as transactions are committed', function () {

        const editor = new Editor<number>();
        const transact = () => {
            editor.begin();
            editor.setDocument(randomInt(0, 10000));
            editor.commit();
        };

        editor.open(randomInt(1, 10));

        assert.strictEqual(editor.undoCount, 0);

        transact();

        assert.strictEqual(editor.undoCount, 1);

        transact();

        assert.strictEqual(editor.undoCount, 2);

    });

    it('should undo a document action', function () {

        const a = randomInt(0, 4);
        const b = randomInt(5, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);
        editor.commit();

        assert.strictEqual(editor.undoCount, 1);
        assert.strictEqual(editor.redoCount, 0);

        editor.undo();

        assert.strictEqual(editor.document, a);

    });

    it('should redo a document action', function () {
        const a = randomInt(0, 4);
        const b = randomInt(5, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);
        editor.commit();
        editor.undo();

        assert.strictEqual(editor.undoCount, 0);
        assert.strictEqual(editor.redoCount, 1);

        editor.redo();
        assert.strictEqual(editor.document, b);
    });

    it('should undo after a redo a document action', function () {
        const a = randomInt(0, 4);
        const b = randomInt(5, 9);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);
        editor.commit();
        const r1 = editor.undo();
        const r2 = editor.redo();
        const r3 = editor.undo();

        assert.strictEqual(editor.document, a);
        assert.strictEqual(r1, true);
        assert.strictEqual(r2, true);
        assert.strictEqual(r3, true);

    });

    it('should clear redo stack after a document change', function () {

        const a = randomInt(0, 4);
        const b = randomInt(5, 9);
        const c = randomInt(10, 15);
        const editor = new Editor<number>();

        editor.open(a);
        editor.begin();
        editor.setDocument(b);
        editor.commit();

        assert.strictEqual(editor.undoCount, 1);

        editor.undo();

        assert.strictEqual(editor.undoCount, 0);
        assert.strictEqual(editor.redoCount, 1);

        editor.begin();
        editor.setDocument(c);
        editor.commit();

        assert.strictEqual(editor.undoCount, 1);
        assert.strictEqual(editor.redoCount, 0);

    });

});