import {assert} from 'chai';
import {IconService} from "../../src/model/IconService";
import {Rectangle} from "../../src/hui/helpers/Rectangle";

describe('model/IconService', function (){

    it('should scan a 32 bit region', function () {

        const a = IconService.newIcon(2, 2);
        const r = new Rectangle(1,1,1, 1);

        a.data.forEach(((value, index) => a.data[index] = index));

        assert.strictEqual(a.data[0], 0);
        assert.strictEqual(a.data[1], 1);
        assert.strictEqual(a.data[2], 2);
        assert.strictEqual(a.data[3], 3);

        IconService.region32(a, r, (regionIndex, iconIndex) => {

            assert.strictEqual(a.data[regionIndex], 12);
            assert.strictEqual(a.data[regionIndex + 1], 13);
            assert.strictEqual(a.data[regionIndex + 2], 14);
            assert.strictEqual(a.data[regionIndex + 3], 15);

        });

    });

});