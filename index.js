var assign = require('object-assign');

// Monkey patch setState to be synchronous and not deal with update queue
var ReactComponent = require('react/lib/ReactComponent');
ReactComponent.prototype.setState = function (state) {
    assign(this.state, state);
};

var ReactServer = require('./lib/React');

// Ensure that all addons use ./lib/React as React dependency
require.cache[require.resolve('react/lib/React')] = require.cache[require.resolve('./lib/React')];

ReactServer.addons = require('./lib/addons');

module.exports = ReactServer;
