# react-server

This project seeks to re-implement React's `renderToString` and 
`renderToStaticMarkup` methods to be more efficient for server rendering. The
resulting markup is intended to be equivalent to that of stock React so that
the client (which will use stock React) will be able to re-use the server
rendered markup.

## Install

Not available on npm. You must install from git.

## Usage

react-server is meant to be a drop in replacement for React specifically for the
server. It should not be used on the client.

You can enable react-server by doing the following:

```js
require('react-server/register');
```

Internally this is overriding node's require cache to return react-server
whenever `require('react')` or `require('react/addons')` is called.

## Behavioral Differences

In order to gain these efficiencies, some of the inner workings of React have 
been changed which may bleed in to how components are implemented.

### Autobinding

`React.createClass` automatically binds all non-static methods to the component
instance so that you do not need to automatically bind them. This is typically 
used when registering event handlers or passing methods between components. If
your component relies on this, it's not as simple as just using bind because 
React on the client will warn about binding methods that are already autobound.
Instead, you can create a closure:

```
React.createClass({
    render: function () {
        var self = this;
        return <a onClick={function (e) {
            self.handleClick(e);
        }}>foo</a>
    }
});
```

### Owner vs. Parent Context

react-server uses parent context which is slightly different to React 0.13's 
owner context. React plans on switching to parent context in version 0.14, but
react-server chose parent context due to its simpler implementation. In most
cases, this is actually more reliable than the old owner context.

## Missing Utilities

react-server may still be missing functionality from stock React. If you find 
any missing pieces or broken functionality, please open an issue to let me know.

## Testing

You can run the test suite and benchmarks simply by running:

```
npm test
```
