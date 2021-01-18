import {assert} from 'chai';
import {makeSz, scaleToContain} from "../../../src/hui/helpers/Rectangle";

describe('hui/helpers/Rectangle', function (){

    it('should scale to fit a size', function () {

        const container = makeSz(16, 16);

        const a = makeSz(100, 100);
        const b = makeSz(100, 50);
        const c = makeSz(50, 100);

        assert.deepStrictEqual(scaleToContain(container, a), makeSz(16, 16));
        assert.deepStrictEqual(scaleToContain(container, b), makeSz(16, 8));
        assert.deepStrictEqual(scaleToContain(container, c), makeSz(8, 16));

    });

});