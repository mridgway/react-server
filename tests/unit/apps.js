var assert = require('assert');
var renderAppWithFreshReact = require('../../utils/renderAppWithFreshReact');

describe('Apps', function () {
    var apps = {
        Chat: {
            appPath: require.resolve('../fixtures/apps/chat'),
            statePath: require.resolve('../fixtures/apps/chat/state.json')
        },
        FluxibleRouter: {
            appPath: require.resolve('../fixtures/apps/fluxible-router'),
            statePath: require.resolve('../fixtures/apps/fluxible-router/state.json')
        },
        Todo: {
            appPath: require.resolve('../fixtures/apps/todo'),
            statePath: require.resolve('../fixtures/apps/todo/state.json')
        }
    };
    var ReactPaths = {
        react: require.resolve('../../node_modules/react'),
        'react-server': require.resolve('../../dist/react-server.dev')
    };

    Object.keys(apps).forEach(function (appName) {
        var appPath = apps[appName].appPath;
        var statePath = apps[appName].statePath;

        describe(appName, function () {
            it('should render the same output', function (done) {
                // run in series so mockery doesn't conflict
                renderAppWithFreshReact(ReactPaths.react, appPath, statePath).then(function (stockOutput) {
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
