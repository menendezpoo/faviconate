import {assert} from 'chai';
import {Color} from "../../src/hui/helpers/Color";
import {ImageAdjustService} from "../../src/model/ImageAdjustService";

describe('model/ImageAdjustService', function (){

    it('should dither the colors', function () {
        const palette = [Color.white, Color.black];
        const red = new Color(255, 0, 0).tupleInt8;
        const data = new Uint8ClampedArray(16);
        // Make reds
        data[0] = data[4] = data[4] = data[12] = 255;


        ImageAdjustService.dither(data, 2, 2, palette, 0, true);
    });

});