var assert = require('assert');
var renderAppWithFreshReact = require('../../utils/renderAppWithFreshReact');

describe('Apps', function () {
    var apps = {
        Chat: {
            appPath: '../fixtures/apps/chat',
            statePath: '../fixtures/apps/chat/state.json'
        },
        FluxibleRouter: {
            appPath: '../fixtures/apps/fluxible-router',
            statePath: '../fixtures/apps/fluxible-router/state.json'
        },
        Todo: {
            appPath: '../fixtures/apps/todo',
            statePath: '../fixtures/apps/todo/state.json'
        }
    };
    var ReactPaths = {
        react: '../../node_modules/react',
        'react-server': '../../dist/react-server'
    };

    Object.keys(apps).forEach(function (appName) {
        var appPath = apps[appName].appPath;
        var statePath = apps[appName].statePath;

        describe(appName, function () {
            it('should render the same output', function (done) {
                // run in series so mockery doesn't conflict
                renderAppWithFreshReact(ReactPaths['react'], appPath, statePath).then(function (stockOutput) {
                    renderAppWithFreshReact(ReactPaths['react-server'], appPath, statePath).then(function (serverOutput) {
                        assert.notEqual(serverOutput.React.__isReactServer, stockOutput.React.__isReactServer);
                        assert.equal(
                            serverOutput.markup,
                            stockOutput.markup
                        );
                        done();
                    }).catch(done);
                }).catch(done);
            });
        });

    });
});
