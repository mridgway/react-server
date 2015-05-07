/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

var assign = require('object-assign');

import ReactServerClass from './lib/ReactClass';
import ReactClass from 'react/lib/ReactClass';

// Prevent autobind on built-in components
ReactClass.createClass = ReactServerClass.createClass;

import ReactDomComponent from './lib/ReactDomComponent';
import instantiateReactComponent from './lib/instantiateReactComponent.js';
import ReactCompositeComponent from './lib/ReactCompositeComponent';
import ReactElement from 'react/lib/ReactElement';
import ReactDefaultInjection from 'react/lib/ReactDefaultInjection';
import ReactNativeComponent from 'react/lib/ReactNativeComponent';
import ReactMarkupChecksum from 'react/lib/ReactMarkupChecksum.js';
import ReactInstanceHandles from 'react/lib/ReactInstanceHandles';

ReactDefaultInjection.inject();

// Expose this on ReactElement
ReactElement.prototype.instantiateReactComponent = instantiateReactComponent;

var ReactServer = {
    addons: {
        cloneWithProps: function (element, props) {
            assign(element.props, props);
            return element;
        }
    },
    Component: require('react/lib/ReactComponent'),
    createClass: ReactServerClass.createClass,
    createElement: ReactElement.createElement,
    renderToStaticMarkup: function (element, callback) {
        var component = element.instantiateReactComponent(element);
        callback(null, component.mountComponent(null, {
            renderToStaticMarkup: true
        }, {}));
    },
    renderToString: function (element, callback) {
        var rootNodeId = ReactInstanceHandles.createReactRootID();
        var component = element.instantiateReactComponent(element);
        var markup = component.mountComponent(rootNodeId, {
            renderToStaticMarkup: false
        }, {});
        callback(null, ReactMarkupChecksum.addChecksumToMarkup(markup));
    },
    PropTypes: require('react/lib/ReactPropTypes'),
    createFactory: ReactElement.createFactory
};

module.exports = ReactServer;
