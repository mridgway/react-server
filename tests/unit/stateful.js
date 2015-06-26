var assert = require('assert');
var React = require('../../index');
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
var HelloCreateClass = require('../fixtures/components/HelloCreateClass');

describe('StateFul', function () {
    it('should render with updated state', function (done) {
        React.renderToStaticMarkup(<StatefulComponent />, function (err, markup) {
            assert.equal(markup, '<div>baz</div>');
            done();
        });
    });
});
