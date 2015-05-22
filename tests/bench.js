require('babel/register');
var assert = require('assert');
var renderAppWithFreshReact = require('../utils/renderAppWithFreshReact');
var Benchtable = require('benchtable');

var appPath = require.resolve('./fixtures/apps/chat');
var statePath = require.resolve('./fixtures/apps/chat/state.json');
var reactServerPath = require.resolve('../dist/react-server');
var reactStockPath = require.resolve('../node_modules/react/dist/react-with-addons');

renderAppWithFreshReact(reactServerPath, appPath, statePath).then(function (serverApp) {
    return renderAppWithFreshReact(reactStockPath, appPath, statePath).then(function (stockApp) {
        assert(serverApp.markup, stockApp.markup);

        var suite = new Benchtable();

        // add tests
        suite
            .addFunction('RenderChat', function(React, context) {
                React.renderToString(context.createElement());
            })
            .addInput('react-server', [serverApp.React, serverApp.context])
            .addInput('react', [stockApp.React, stockApp.context])
            // add listeners
            .on('error', function (e) {
                throw e.target.error;
            })
            .on('cycle', function(event) {
                console.log(String(event.target));
            })
            .on('complete', function() {
                console.log('The Fastest test suite is ' + '\u001b[32m' + this.filter('fastest').pluck('name') + '\u001b[0m\n');
                console.log(this.table.toString());
            })
            // run async
            .run({ async: true, defer: true});
    });
}).catch(function (e) {
    console.log(e);
});
