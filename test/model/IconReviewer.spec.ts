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

});