/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

var assign = require('object-assign');

import ReactDomElement from './lib/ReactDomComponent';
import ReactCompositeElement from './lib/ReactCompositeComponent';
import ReactDefaultInjection from 'react/lib/ReactDefaultInjection';
import ReactNativeComponent from 'react/lib/ReactNativeComponent';
import ReactMarkupChecksum from 'react/lib/ReactMarkupChecksum.js';
import ReactInstanceHandles from 'react/lib/ReactInstanceHandles';

ReactDefaultInjection.inject();

var ReactServer = {
    addons: {
        cloneWithProps: function (element, props) {
            assign(element.props, props);
            return element;
        }
    },
    Component: require('react/lib/ReactComponent'),
    createClass: require('react/lib/ReactClass').createClass,
    createElement: function (type, props, children) {
        props = props || {};
        var childrenLength = arguments.length - 2;
        if (childrenLength === 1) {
            props.children = children;
        } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
                childArray[i] = arguments[i + 2];
            }
            props.children = childArray;
        }

        // Resolve default props
        if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (var propName in defaultProps) {
                if (typeof props[propName] === 'undefined') {
                    props[propName] = defaultProps[propName];
                }
            }
        }

        //type = ReactNativeComponent.getComponentClassForElement({
        //    type: type
        //});
        if ('string' === typeof type) {
            return new ReactDomElement(type, props, children);
        }
        return new ReactCompositeElement(type, props, children);
    },
    renderToStaticMarkup: function (element) {
        return element.mountComponent(null, {});
    },
    renderToString: function (element) {
        var rootNodeId = ReactInstanceHandles.createReactRootID();
        var markup = element.mountComponent(rootNodeId, {});
        return ReactMarkupChecksum.addChecksumToMarkup(markup);
    },
    PropTypes: require('./node_modules/react/lib/ReactPropTypes'),
    createFactory: function (type) {
        return ReactServer.createElement.bind(null, type);
    }
};

module.exports = ReactServer;
