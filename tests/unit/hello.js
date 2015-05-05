var assert = require('assert');
var React = require('../../index');
var HelloComponent = require('../fixtures/Hello');

describe('Hello', function () {
    it('should render hello world', function (done) {
        React.renderToStaticMarkup(<div>Hello world!</div>, function (err, markup) {
            assert.equal(markup, '<div>Hello world!</div>');
            done();
        });
    });
    it('should render hello world with custom component', function (done) {
        React.renderToStaticMarkup(<HelloComponent />, function (err, markup) {
            assert.equal(markup, '<div>Hello world!</div>');
            done();
        });
    });
    it('should render nested hello world', function (done) {
        React.renderToStaticMarkup(
            <HelloComponent>
                <HelloComponent />
            </HelloComponent>
        , function (err, markup) {
            assert.equal(markup, '<div><div>Hello world!</div></div>');
            done();
        });
    });
    it('should render hello world with props', function (done) {
        React.renderToStaticMarkup(<HelloComponent id="foo" />, function (err, markup) {
            assert.equal(markup, '<div id="foo">Hello world!</div>');
            done();
        });
    });
    it('should render textarea', function (done) {
        React.renderToStaticMarkup(<textarea id="foo" />, function (err, markup) {
            assert.equal(markup, '<textarea id="foo"></textarea>');
            done();
        });
    });
});
