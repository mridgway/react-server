var assert = require('assert');
var React = require('../../index');
var StatefulComponentNoInitialState = React.createClass({
    componentWillMount: function () {
        this.setState({
            foo: 'baz'
        });
    },
    render: function () {
        return <div>{this.state.foo}</div>;
    }
});
var StatefulComponent = React.createClass({
    getInitialState: function () {
        return {
            foo: 'bar'
        };
    },
    componentWillMount: function () {
        this.setState({
            foo: 'baz'
        });
    },
    render: function () {
        return <div>{this.state.foo}</div>;
    }
});

describe('StateFul', function () {
    it('should render with updated state', function (done) {
        React.renderToStaticMarkup(<StatefulComponent />, function (err, markup) {
            assert.equal(markup, '<div>baz</div>');
            done();
        });
    });
    it('should render without initial state', function (done) {
        React.renderToStaticMarkup(<StatefulComponentNoInitialState />, function (err, markup) {
            assert.equal(markup, '<div>baz</div>');
            done();
        });
    });
});
