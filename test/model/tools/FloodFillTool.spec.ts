
import {assert} from "chai";
import {IconCanvasController} from "../../../src/model/IconCanvasController";
import {IconService} from "../../../src/model/IconService";
import {FloodFillTool} from "../../../src/model/tools/FloodFillTool";
import {makePt} from "../../../src/hui/helpers/Rectangle";

describe("model/tools/FloodFillTool", function (){

    it('should flood fill', function () {

        const icon = IconService.newIcon(2, 2);
        const c = new IconCanvasController({icon});
        const f = new FloodFillTool(c);

        f.fill(makePt(0,0));

        assert.deepEqual(icon.data[3], 255);
        assert.deepEqual(icon.data[7], 255);

    });

});