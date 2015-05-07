var assert = require('assert');
var React = require('../../index');
var HelloComponent = require('../fixtures/Hello');
var HelloCreateClass = require('../fixtures/HelloCreateClass');

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
    it('should render hello world with create class', function (done) {
        React.renderToStaticMarkup(<HelloCreateClass />, function (err, markup) {
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
    it('should render multi hello world', function (done) {
        React.renderToStaticMarkup(
            <ul>
                <li><HelloComponent /></li>
                <li><HelloComponent /></li>
            </ul>
            , function (err, markup) {
                assert.equal(markup, '<ul><li><div>Hello world!</div></li><li><div>Hello world!</div></li></ul>');
                done();
            });
    });
    it('should render multi mixed children', function (done) {
        React.renderToStaticMarkup(<div>Hello <span>world!</span></div>, function (err, markup) {
            assert.equal(markup, '<div>Hello <span>world!</span></div>');
            done();
        });
    });
    it('should render nested multi hello world', function (done) {
        React.renderToStaticMarkup(
            <HelloComponent>
                <HelloComponent />
                <HelloComponent />
            </HelloComponent>
            , function (err, markup) {
                assert.equal(markup, '<div><div>Hello world!</div><div>Hello world!</div></div>');
                done();
            });
    });
    it('should render hello world with props', function (done) {
        React.renderToStaticMarkup(<HelloComponent id="foo" />, function (err, markup) {
            assert.equal(markup, '<div id="foo">Hello world!</div>');
            done();
        });
    });
});
