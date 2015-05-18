/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

var assign = require('object-assign');

import ReactServerClass from './ReactClass';
import ReactClass from 'react/lib/ReactClass';


// Prevent autobind on built-in components
ReactClass.createClass = ReactServerClass.createClass;

import ReactDomComponent from './ReactDomComponent';
import instantiateReactComponent from './instantiateReactComponent.js';
import ReactCompositeComponent from './ReactCompositeComponent';

import ReactChildren from 'react/lib/ReactChildren';
import ReactComponent from 'react/lib/ReactComponent';
import ReactDefaultInjection from 'react/lib/ReactDefaultInjection';
import ReactDOM from 'react/lib/ReactDOM';
import ReactElement from 'react/lib/ReactElement';
import ReactInstanceHandles from 'react/lib/ReactInstanceHandles';
import ReactMarkupChecksum from 'react/lib/ReactMarkupChecksum';
import ReactNativeComponent from 'react/lib/ReactNativeComponent';

ReactDefaultInjection.inject();

// Expose this on ReactElement
ReactElement.prototype.instantiateReactComponent = instantiateReactComponent;

var ReactServer = {
    Children: {
        map: ReactChildren.map,
        forEach: ReactChildren.forEach,
        count: ReactChildren.count,
        only: require('react/lib/onlyChild')
    },
    Component: ReactComponent,
    createClass: ReactServerClass.createClass,
    createElement: ReactElement.createElement,
    createFactory: ReactElement.createFactory,
    DOM: ReactDOM,
    isValidElement: ReactElement.isValidElement,
    PropTypes: require('react/lib/ReactPropTypes'),
    renderToStaticMarkup: function (element, callback) {
        var component = element.instantiateReactComponent(element);
        var markup = component.mountComponent(null, {
            renderToStaticMarkup: true
        }, {});
        callback && callback(null, markup);
        return markup;
    },
    renderToString: function (element, callback) {
        var rootNodeId = ReactInstanceHandles.createReactRootID();
        var component = element.instantiateReactComponent(element);
        var markup = component.mountComponent(rootNodeId, {
            renderToStaticMarkup: false
        }, {});
        markup = ReactMarkupChecksum.addChecksumToMarkup(markup);
        callback && callback(null, markup);
        return markup;
    },

    __spread: assign
};

module.exports = ReactServer;
