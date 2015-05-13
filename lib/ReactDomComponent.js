/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 */

import ReactComponent from './ReactComponent';
import assign from 'object-assign';
import traverseAllChildren from 'react/lib/traverseAllChildren';

class ReactDomComponent extends ReactComponent {
    constructor(element) {
        super(element);
    }

    mountComponent(rootNodeId, transaction, context) {
        return (
            createOpenTagMarkup(this, rootNodeId, transaction, context) +
            createContentMarkup(this, rootNodeId, transaction, context) +
            createCloseTagMarkup(this, rootNodeId, transaction, context)
        );
    }
}

function mountChildren(component, rootNodeID, transaction, context) {
    var mountImages = [];
    var element = component.element;
    var childrenToUse = component.props.children;
    traverseAllChildren(childrenToUse, function mountChild(traverseContext, child, name) {
        if (child == null) {
            return;
        }
        var childInstance = element.instantiateReactComponent(child, element.type);
        // Inlined for performance, see `ReactInstanceHandles.createReactID`.
        var rootID = rootNodeID + name;
        var mountImage = childInstance.mountComponent(
            rootID,
            transaction,
            context
        );
        mountImages.push(mountImage);
    }, mountImages);

    return mountImages;
}

var omittedCloseTags = {
    'area': true,
    'base': true,
    'br': true,
    'col': true,
    'embed': true,
    'hr': true,
    'img': true,
    'input': true,
    'keygen': true,
    'link': true,
    'meta': true,
    'param': true,
    'source': true,
    'track': true,
    'wbr': true
    // NOTE: menuitem's close tag should be omitted, but that causes problems.
};
function createCloseTagMarkup(component, rootNodeId, transaction, context) {
    return omittedCloseTags[component.type] ? '' : '</' + component.type + '>';
}

/**
 * Creates markup for the open tag and all attributes.
 *
 * This method has side effects because events get registered.
 *
 * Iterating over object properties is faster than iterating over arrays.
 * @see http://jsperf.com/obj-vs-arr-iteration
 *
 * @private
 * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
 * @return {string} Markup of opening tag.
 */
var CSSPropertyOperations = require('react/lib/CSSPropertyOperations');
var DOMPropertyOperations = require('react/lib/DOMPropertyOperations');
function createOpenTagMarkup(component, rootNodeId, transaction, context) {
    var props = component.props;
    var ret = '<' + component.type;

    for (var propKey in props) {
        if (!props.hasOwnProperty(propKey)) {
            continue;
        }
        var propValue = props[propKey];
        if (propValue == null) {
            continue;
        }

        if (propKey === 'style') {
            if (propValue) {
                propValue = assign({}, props.style);
            }
            propValue = CSSPropertyOperations.createMarkupForStyles(propValue);
        }
        var markup =
            DOMPropertyOperations.createMarkupForProperty(propKey, propValue);
        if (markup) {
            ret += ' ' + markup;
        }
    }

    // For static pages, no need to put React ID and checksum. Saves lots of
    // bytes.
    if (transaction.renderToStaticMarkup) {
        return ret + '>';
    }

    var markupForID = DOMPropertyOperations.createMarkupForID(rootNodeId);
    return ret + ' ' + markupForID + '>';
}

/**
 * Creates markup for the content between the tags.
 *
 * @private
 * @param {ReactReconcileTransaction|ReactServerRenderingTransaction} transaction
 * @param {object} context
 * @return {string} Content markup.
 */
var escapeTextContentForBrowser = require('react/lib/escapeTextContentForBrowser');
var CONTENT_TYPES = {'string': true, 'number': true};
function createContentMarkup(component, rootNodeId, transaction, context) {
    var tag = component.type;
    var prefix = '';
    if (tag === 'listing' ||
        tag === 'pre' ||
        tag === 'textarea') {
        // Add an initial newline because browsers ignore the first newline in
        // a <listing>, <pre>, or <textarea> as an "authoring convenience" -- see
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inbody.
        prefix = '\n';
    }

    var props = component.props;

    // Intentional use of != to avoid catching zero/false.
    var innerHTML = props.dangerouslySetInnerHTML;
    if (innerHTML != null) {
        if (innerHTML.__html != null) {
            return prefix + innerHTML.__html;
        }
    } else {
        var contentToUse =
            CONTENT_TYPES[typeof props.children] ? props.children : null;
        var childrenToUse = contentToUse != null ? null : props.children;
        if (contentToUse != null) {
            return prefix + escapeTextContentForBrowser(contentToUse);
        } else if (childrenToUse != null ) {
            return prefix + mountChildren(component, rootNodeId, transaction, context).join('');
        }
    }
    return prefix;
}

export default ReactDomComponent;
