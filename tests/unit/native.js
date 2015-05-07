var assert = require('assert');
var React = require('../../index');

describe('Native Components', function () {
    //it('should render button', function (done) {
    //    React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
    //        assert.equal(markup, '<textarea id="foo"></textarea>');
    //        done();
    //    });
    //});
    //it('should render form', function (done) {
    //    React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
    //        assert.equal(markup, '<textarea id="foo"></textarea>');
    //        done();
    //    });
    //});
    //it('should render iframe', function (done) {
    //    React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
    //        assert.equal(markup, '<textarea id="foo"></textarea>');
    //        done();
    //    });
    //});
    //it('should render img', function (done) {
    //    React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
    //        assert.equal(markup, '<textarea id="foo"></textarea>');
    //        done();
    //    });
    //});
    //it('should render input', function (done) {
    //    React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
    //        assert.equal(markup, '<textarea id="foo"></textarea>');
    //        done();
    //    });
    //});
    //it('should render option', function (done) {
    //    React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
    //        assert.equal(markup, '<textarea id="foo"></textarea>');
    //        done();
    //    });
    //});
    //it('should render select', function (done) {
    //    React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
    //        assert.equal(markup, '<textarea id="foo"></textarea>');
    //        done();
    //    });
    //});
    it('should render textarea', function (done) {
        React.renderToStaticMarkup(
            <textarea className="message-composer" name="message" value="" />,
            function (err, markup) {
                assert.equal(markup, '<textarea class="message-composer" name="message">\n</textarea>');
                done();
            }
        );
    });
    //it('should render text', function (done) {
    //    React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
    //        assert.equal(markup, '<textarea id="foo"></textarea>');
    //        done();
    //    });
    //});
});
