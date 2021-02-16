import {assert} from "chai";
import {Icon} from "../../src/model/Icon";
import {IconReviewer} from "../../src/model/IconReviewer";
import {makeSz, Rectangle} from "../../src/hui/helpers/Rectangle";
import {Color} from "../../src/hui/helpers/Color";

describe("model/IconReviewer", function (){

    it('should tint pixels', function () {

        const icon: Icon = {
            data: new Uint8ClampedArray([255, 0, 0, 255]),
            width: 1,
            height: 1,
            model: "rgba"
        };

        const r = new IconReviewer(icon, makeSz(1, 1), 'nw');

        r.tintRegion(Rectangle.fromSize(makeSz(1, 1)), new Color(0, 0, 0, 0.9));

        assert.equal(r.current.data[0], 230 );

    });

    it('should review a 2 x 2 icon', function () {

        const red: number[] = [255, 0, 0, 255];

        const icon: Icon = {
            data: new Uint8ClampedArray([...red, ...red, ...red, ...red]),
            width: 2,
            height: 2,
            model: "rgba"
        };

        const r = new IconReviewer(icon, makeSz(1, 1), 'nw');

        assert.equal(r.sampleSprite.length, 4);

        assert.equal(r.current.data[0], 255);
        assert.notEqual(r.current.data[1], 255);
        assert.notEqual(r.current.data[2], 255);
        assert.equal(r.current.data[3], 255);

        assert.deepEqual(r.sampleSprite, new Uint8ClampedArray([...red]));

        r.move('e');

        assert.equal(r.current.data[4], 255);
        assert.notEqual(r.current.data[5], 255);
        assert.notEqual(r.current.data[6], 255);
        assert.equal(r.current.data[7], 255);

    });

});