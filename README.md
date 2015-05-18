# react-server

This project seeks to re-implement React's `renderToString` and 
`renderToStaticMarkup` methods to be more efficient for server rendering. The
resulting markup is intended to be equivalent to that of stock React so that
the client (which will use stock React) will be able to re-use the server
rendered markup.

## Install

```
npm i --save react-server
```

## Usage

react-server is meant to be a drop in replacement for React specifically for the
server. It should not be used on the client.

In order for this to work without modifying any of the components, you can hack
node's require cache in the following way:

```
require('react-server');

require.cache[require.resolve('react')] = require.cache[require.resolve('react-server')];
require.cache[require.resolve('react/addons')] = require.cache[require.resolve('react-server')];
```

## Behavioral Differences

In order to gain these efficiencies, some of the inner workings of React have 
been changed which may bleed in to how components are implemented.

### Autobinding

`React.createClass` automatically binds all non-static methods to the component
instance so that you do not need to automatically bind them. This is typically 
used when registering event handlers or passing methods between components. If
your component does this, you will need to manually bind the method.

```
<a onClick={this.handleClick.bind(this)}>foo</a>
```

### Owner vs. Parent Context

react-server uses parent context which is slightly different to React 0.13's 
owner context. React plans on switching to parent context in version 0.14, but
react-server chose parent context due to its simpler implementation.

## Missing Utilities

react-server may still be missing functionality from stock React. If you find 
any missing pieces or broken functionality, please open an issue to let me know.
