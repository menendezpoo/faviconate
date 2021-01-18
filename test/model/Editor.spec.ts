import {assert} from 'chai';
import {
    Editor,
    NoTransactionError,
    TransactionInProgressError,
} from "../../src/model/Editor";
import {randomInt} from "../TestUtils";

describe(`model/Editor`, function (){

    it('should flag changes after changing a document', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>(a);

        editor.begin();
        editor.setDocument(b);
        editor.commit();

        assert.isTrue(editor.hasChanges);

    });

    it('should clear changes voluntarily', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>(a);

        editor.begin();
        editor.setDocument(b);
        editor.commit();
        editor.clearChanges();

        assert.isFalse(editor.hasChanges);

    });

    it('should change the document state', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>(a);

        editor.begin();
        editor.setDocument(b);

        assert.strictEqual(editor.document, b);


    });

    it('should rollback a transaction', function () {

        const a = randomInt(1, 5);
        const b = randomInt(6, 9);
        const editor = new Editor<number>(a);

        editor.begin();
        editor.setDocument(b);
        editor.rollback();

        assert.strictEqual(editor.document, a);

    });

    it('should reject state change without transaction', function () {

        const a = randomInt(0, 4);
        const b = randomInt(5, 9);
        const editor = new Editor<number>(a);

        assert.throws(() => editor.setDocument(b), NoTransactionError);

    });

    it('should reject beginTransaction if transaction in progress', function () {

        const editor = new Editor<number>(randomInt(1, 9));

        editor.begin();

        assert.throws(() => editor.begin(), TransactionInProgressError);

    });

    it('should reject transactionCommit if no transaction in progress', function () {

        const editor = new Editor<number>(0);

        assert.throws(() => editor.commit(), NoTransactionError);

    });

    it('should reject transactionRollback if no transaction in progress', function () {

        const editor = new Editor<number>(0);

        assert.throws(() => editor.rollback(), NoTransactionError);

    });

    it('should accumulate undo counts as transactions are committed', function () {

        const editor = new Editor<number>(randomInt(1, 10));
        const transact = () => {
            editor.begin();
            editor.setDocument(randomInt(0, 10000));
            editor.commit();
        };

        assert.strictEqual(editor.undoCount, 0);

        transact();

        assert.strictEqual(editor.undoCount, 1);

        transact();

        assert.strictEqual(editor.undoCount, 2);

    });

    it('should undo a document action', function () {

        const a = randomInt(0, 4);
        const b = randomInt(5, 9);
        const editor = new Editor<number>(a);

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
        const editor = new Editor<number>(a);

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
        const editor = new Editor<number>(a);

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
        const editor = new Editor<number>(a);

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