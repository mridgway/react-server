var assert = require('assert');
var React = require('../../dist/react-server.dev');
var ContextParent = require('../fixtures/components/ContextParent');

describe('Context', function () {
    it('should pass child context', function (done) {
        React.renderToStaticMarkup(<ContextParent />, function (err, markup) {
            assert.equal(markup, '<div>bar</div>');
            done();
        });
    });
});
