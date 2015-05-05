var assert = require('assert');
var React = require('../../index');

describe('Special Components', function () {
    it('should render textarea', function (done) {
        React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
            assert.equal(markup, '<textarea id="foo"></textarea>');
            done();
        });
    });
});
