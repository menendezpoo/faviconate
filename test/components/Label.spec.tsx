import React from 'react';
import {assert} from 'chai';
import {JSDOM} from 'jsdom';
import {Label} from "../../src/components/Label";

describe('Label', function () {

    let dom = new JSDOM(`<!doctype html>`);

    it('should return a label', function () {
        let lbl = React.createElement(Label, {text: "World"});
        assert.isNotNull(lbl);
    });

});