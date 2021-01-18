
import {assert} from 'chai';
import {Icon} from "../../src/model/Icon";
import {IconEditor} from "../../src/model/IconEditor";

describe('model/IconEditor', function () {

    it('should clone the state', function () {

        const icon: Icon = {
            width: 1,
            height: 1,
            model: 'rgba',
            data: new Uint8ClampedArray(4)
        }

        const editor = new IconEditor({icon});

        icon.data[0] = 1;

        const newDoc = editor.cloneDocument();

        newDoc.icon.data[0] = 2;


        assert.notEqual(icon.data, newDoc.icon.data);

    });

});